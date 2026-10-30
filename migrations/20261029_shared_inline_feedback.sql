CREATE OR REPLACE FUNCTION tt_private.advance_room(p_room uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r public.tt_rooms%rowtype; n integer; next_q bigint; w uuid; score1 int; score2 int;
begin
 select * into r from public.tt_rooms where id=p_room for update;
 if not found or r.state<>'playing' then return; end if;
 if r.closes_at > now() and (select count(*) from public.tt_answers a where a.room_id=p_room and a.number=r.round_number) < 2 then return; end if;
 -- Both answers close the round; keep one shared, readable inline feedback interval.
 if now() < least(r.closes_at,coalesce((select max(answered_at) from public.tt_answers where room_id=p_room and number=r.round_number having count(*)>=2),r.closes_at))+interval '1.2 seconds' then return; end if;
 if r.round_number>=10 then
  select coalesce(sum(points),0) into score1 from public.tt_answers where room_id=p_room and player_id=r.owner_id;
  select coalesce(sum(points),0) into score2 from public.tt_answers where room_id=p_room and player_id=r.guest_id;
  w := case when score1>score2 then r.owner_id when score2>score1 then r.guest_id else null end;
  update public.tt_rooms set state='finished',winner_id=w where id=p_room;
 else
  n:=r.round_number+1;
  select question_id into next_q from public.tt_rounds where room_id=p_room and number=n;
  update public.tt_rounds set reveal_at=now()+tt_private.narration_delay(p_room,n),closes_at=now()+tt_private.narration_delay(p_room,n)+interval '15 seconds' where room_id=p_room and number=n;
  update public.tt_rooms set round_number=n,reveal_at=now()+tt_private.narration_delay(p_room,n),closes_at=now()+tt_private.narration_delay(p_room,n)+interval '15 seconds' where id=p_room;
 end if;
end $function$
;
CREATE OR REPLACE FUNCTION public.tt_state(p_room uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare r public.tt_rooms%rowtype; q public.tt_questions%rowtype; a jsonb; scoreboard jsonb;
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 select * into r from public.tt_rooms where id=p_room;
 if not found or (auth.uid() is distinct from r.owner_id and auth.uid() is distinct from r.guest_id) then raise exception 'Not a player'; end if;
 perform tt_private.advance_room(p_room);
 select * into r from public.tt_rooms where id=p_room;
 select jsonb_build_object(
 'owner',coalesce((select sum(points) from public.tt_answers where room_id=p_room and player_id=r.owner_id),0),
 'guest',coalesce((select sum(points) from public.tt_answers where room_id=p_room and player_id=r.guest_id),0)) into scoreboard;
 if r.state='playing' then
  select q2.* into q from public.tt_rounds rd join public.tt_questions q2 on q2.id=rd.question_id where rd.room_id=p_room and rd.number=r.round_number;
  select coalesce(jsonb_agg(jsonb_build_object('player_id',player_id,'points',points,'chosen_index',case when player_id=auth.uid() then chosen_index else null end)), '[]'::jsonb) into a
   from public.tt_answers where room_id=p_room and number=r.round_number;
  return jsonb_build_object('state',r.state,'code',r.code,'room_id',r.id,'round',r.round_number,'owner',r.owner_id,'guest',r.guest_id,
   'owner_ready',r.owner_ready,'guest_ready',r.guest_ready,'prompt',q.prompt,
   'options',case when now()>=r.reveal_at then q.options else null end,
   'phase',case when now()>=r.closes_at or jsonb_array_length(a)>=2 then 'feedback' else 'question' end,
   'correct_index',case when now()>=r.closes_at or jsonb_array_length(a)>=2 then q.correct_index else null end,
   'server_now',now(),'narration_started_at',r.reveal_at-tt_private.narration_delay(p_room,r.round_number),'reveal_at',r.reveal_at,'closes_at',r.closes_at,'answers',a,'scores',scoreboard);
 end if;
 return jsonb_build_object('state',r.state,'code',r.code,'room_id',r.id,'owner',r.owner_id,'guest',r.guest_id,
 'owner_ready',r.owner_ready,'guest_ready',r.guest_ready,'winner',r.winner_id,'scores',scoreboard);
end $function$
;

 CREATE OR REPLACE FUNCTION tt_private.narration_delay(p_room uuid,p_number integer) RETURNS interval LANGUAGE sql STABLE SET search_path TO '' AS $$ select make_interval(secs=>coalesce(q.narration_seconds,8)::double precision+0.35) from public.tt_rounds r join public.tt_questions q on q.id=r.question_id where r.room_id=p_room and r.number=p_number; $$;
