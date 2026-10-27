create or replace function public.tt_leaderboard(p_scope text default 'Global')
returns jsonb language plpgsql stable security definer set search_path=''
as $$
declare uid uuid:=auth.uid(); result jsonb;
begin
 if uid is null then raise exception 'Sign in to view rankings'; end if;
 if p_scope not in ('Global','Friends','Monthly') then raise exception 'Invalid ranking scope'; end if;
 with opponents as (
  select case when r.owner_id=uid then r.guest_id else r.owner_id end id
  from public.tt_rooms r where uid in (r.owner_id,r.guest_id) and r.guest_id is not null
 ), finished as (
  select r.* from public.tt_rooms r where r.state='finished' and r.guest_id is not null
   and (p_scope<>'Monthly' or r.created_at>=date_trunc('month',now()))
 ), entrants as (
  select r.id room_id,r.owner_id player_id,r.winner_id from finished r
  union all select r.id,r.guest_id,r.winner_id from finished r
 ), totals as (
  select e.player_id,count(*) matches,count(*) filter(where e.winner_id=e.player_id) wins,
   sum(coalesce((select sum(a.points) from public.tt_answers a where a.room_id=e.room_id and a.player_id=e.player_id),0)) points
  from entrants e where p_scope<>'Friends' or e.player_id=uid or e.player_id in(select id from opponents)
  group by e.player_id
 ), ranked as (
  select *,dense_rank() over(order by points desc,wins desc) place from totals
 ), safe as (
  select place,case when player_id=uid then 'You' else 'Player '||upper(substr(md5(player_id::text),1,6)) end name,
   points,wins,matches,player_id=uid mine from ranked order by place,player_id limit 50
 )
 select coalesce(jsonb_agg(to_jsonb(safe)),'[]'::jsonb) into result from safe;
 return result;
end $$;
revoke all on function public.tt_leaderboard(text) from public,anon;
grant execute on function public.tt_leaderboard(text) to authenticated;
comment on function public.tt_leaderboard(text) is 'Signed-in aggregate rankings only. No account details, room codes, raw user IDs or answer contents are returned. Friends means past opponents.';
