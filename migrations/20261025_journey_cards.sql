-- Card inventory is private. All mutations pass through an authenticated,
-- transaction-scoped command so the two sides of a trade cannot diverge.
create schema if not exists tt_cards_private;
revoke all on schema tt_cards_private from public, anon;
grant usage on schema tt_cards_private to authenticated;
create table tt_cards_private.catalog(id text primary key, family text not null, rarity text not null, unlock_season int not null check(unlock_season between 1 and 7));
create table tt_cards_private.players(
 id uuid primary key references auth.users(id) on delete cascade,
 code text unique not null default upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),
 name text not null default 'Traveler' check(length(name) between 1 and 32),
 copies jsonb not null default '{}', discovered text[] not null default '{}', duplicates int not null default 0,
 day date not null default (now() at time zone 'UTC')::date, gifts int not null default 0, trades int not null default 0,
 seen timestamptz not null default now()
);
create table tt_cards_private.friends(a uuid not null references tt_cards_private.players(id),b uuid not null references tt_cards_private.players(id),requested_by uuid not null,accepted boolean not null default false,primary key(a,b),check(a<b));
create table tt_cards_private.events(player uuid not null references tt_cards_private.players(id),key text not null,card text not null references tt_cards_private.catalog(id),kind text not null,created timestamptz not null default now(),primary key(player,key));
create table tt_cards_private.mail(id uuid primary key default gen_random_uuid(),sender uuid not null references tt_cards_private.players(id),recipient uuid not null references tt_cards_private.players(id),kind text not null check(kind in ('request','gift','trade')),give_card text references tt_cards_private.catalog(id),want_card text references tt_cards_private.catalog(id),sender_ok boolean not null default false,recipient_ok boolean not null default false,version int not null default 1,status text not null default 'pending',created timestamptz not null default now(),check(sender<>recipient));
create index on tt_cards_private.mail(recipient,created desc);
create index on tt_cards_private.mail(sender,created desc);
alter table tt_cards_private.catalog enable row level security;
alter table tt_cards_private.players enable row level security;
alter table tt_cards_private.friends enable row level security;
alter table tt_cards_private.events enable row level security;
alter table tt_cards_private.mail enable row level security;
revoke all on all tables in schema tt_cards_private from public,anon,authenticated;

create function tt_cards_private.command(action text, args jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare me uuid:=auth.uid(); other uuid; p tt_cards_private.players; q tt_cards_private.players; m tt_cards_private.mail; c tt_cards_private.catalog; k text; card_id text; rarity_pick text; season int; n int; roll float; today date:=(now() at time zone 'UTC')::date; result jsonb; request_id uuid;
begin
 if me is null then raise exception 'Sign in to use Journey Cards'; end if;
 insert into tt_cards_private.players(id) values(me) on conflict do nothing;
 if action in ('gift','trade_offer','request') then other:=(args->>'friend')::uuid;
 elsif action in ('confirm','cancel','change_offer','fulfill') then
  select * into m from tt_cards_private.mail where id=(args->>'id')::uuid for update;
  if not found or me not in (m.sender,m.recipient) then raise exception 'Offer not found';end if;
  other:=case when m.sender=me then m.recipient else m.sender end;
 end if;
 -- Stable lock order protects daily counters and concurrent spending.
 perform 1 from tt_cards_private.players where id=me or id=other order by id for update;
 update tt_cards_private.players set gifts=0,trades=0,day=today where (id=me or id=other) and day<>today;
 update tt_cards_private.players set seen=now() where id=me;
 select * into p from tt_cards_private.players where id=me;
 if other is not null then
  if other=me then raise exception 'Choose another player';end if;
  select * into q from tt_cards_private.players where id=other;
  if not found then raise exception 'Friend not found';end if;
  if not exists(select 1 from tt_cards_private.friends where a=least(me,other) and b=greatest(me,other) and accepted) then raise exception 'Add and accept this friend first';end if;
 end if;
 if action='profile' then
  update tt_cards_private.players set name=left(coalesce(nullif(btrim(args->>'name'),''),'Traveler'),32) where id=me;
 elsif action='add_friend' then
  select id into other from tt_cards_private.players where code=upper(btrim(args->>'code'));
  if other is null or other=me then raise exception 'Friend code not found';end if;
  insert into tt_cards_private.friends(a,b,requested_by) values(least(me,other),greatest(me,other),me) on conflict do nothing;
 elsif action='accept_friend' then
  other:=(args->>'friend')::uuid;
  update tt_cards_private.friends set accepted=true where a=least(me,other) and b=greatest(me,other) and requested_by<>me;
  if not found then raise exception 'Invitation not found';end if;
 elsif action='reward' then
  k:=args->>'event';
  if k !~ '^(trivia:[1-8]:([1-9]|[1-4][0-9]|50)|story:[1-8]:[1-6])$' or k is null then raise exception 'Invalid completion';end if;
  select card into card_id from tt_cards_private.events where player=me and key=k;
  if found then return jsonb_build_object('card',card_id,'repeated',true);end if;
  season:=split_part(k,':',2)::int;
  if p.duplicates>=7 then
   select * into c from tt_cards_private.catalog where unlock_season<=season and not(id=any(p.discovered)) order by random() limit 1;
  end if;
  if c.id is null then
   roll:=random();rarity_pick:=case when roll<.72 then 'COMMON' when roll<.96 then 'RARE' else 'LEGENDARY' end;
   select * into c from tt_cards_private.catalog where unlock_season<=season and rarity=rarity_pick order by random() limit 1;
   if c.id is null then select * into c from tt_cards_private.catalog where rarity='COMMON' order by random() limit 1;end if;
  end if;
  update tt_cards_private.players set copies=jsonb_set(copies,array[c.id],to_jsonb(coalesce((copies->>c.id)::int,0)+1)),duplicates=case when c.id=any(discovered) then duplicates+1 else 0 end,discovered=case when c.id=any(discovered) then discovered else array_append(discovered,c.id) end where id=me;
  insert into tt_cards_private.events(player,key,card,kind) values(me,k,c.id,'reward');
  return jsonb_build_object('card',c.id,'repeated',false);
 elsif action='use' then
  card_id:=args->>'card';k:='use:'||(args->>'scene');
  if k !~ '^use:chapter-0[1-8]-scene-0[1-6]$' then raise exception 'Invalid scene';end if;
  if exists(select 1 from tt_cards_private.events where player=me and key=k) then raise exception 'A card was already used in this scene';end if;
  if coalesce((p.copies->>card_id)::int,0)<1 then raise exception 'No copy available';end if;
  update tt_cards_private.players set copies=jsonb_set(copies,array[card_id],to_jsonb((copies->>card_id)::int-1)) where id=me;
  insert into tt_cards_private.events(player,key,card,kind) values(me,k,card_id,'use');
 elsif action in ('gift','fulfill') then
  if action='fulfill' then
   if m.kind<>'request' or m.recipient<>me then raise exception 'Not your request to fulfill';end if;
   if m.status='complete' then return jsonb_build_object('complete',true,'repeated',true);end if;
   if m.status<>'pending' then raise exception 'Request no longer available';end if;
   card_id:=m.want_card;
  else
   card_id:=args->>'card';request_id:=(args->>'operation')::uuid;
   if request_id is null then raise exception 'Missing operation';end if;
   if exists(select 1 from tt_cards_private.mail where id=request_id and sender=me and kind='gift') then return jsonb_build_object('complete',true,'repeated',true);end if;
  end if;
  if q.gifts>=5 then raise exception 'Your friend has received five gifted cards today';end if;
  if coalesce((p.copies->>card_id)::int,0)<1 then raise exception 'No copy available';end if;
  update tt_cards_private.players set copies=jsonb_set(copies,array[card_id],to_jsonb((copies->>card_id)::int-1)) where id=me;
  update tt_cards_private.players set gifts=gifts+1,copies=jsonb_set(copies,array[card_id],to_jsonb(coalesce((copies->>card_id)::int,0)+1)),discovered=case when card_id=any(discovered) then discovered else array_append(discovered,card_id) end where id=other;
  if action='fulfill' then update tt_cards_private.mail set status='complete' where id=m.id;
  else insert into tt_cards_private.mail(id,sender,recipient,kind,give_card,status) values(request_id,me,other,'gift',card_id,'complete');end if;
 elsif action='request' then
  insert into tt_cards_private.mail(sender,recipient,kind,want_card) values(me,other,'request',args->>'card');
 elsif action='trade_offer' then
  if p.trades>=10 or q.trades>=10 then raise exception 'A player has reached ten trades today';end if;
  if coalesce((p.copies->>(args->>'give'))::int,0)<1 then raise exception 'No offered copy available';end if;
  insert into tt_cards_private.mail(sender,recipient,kind,give_card,want_card) values(me,other,'trade',args->>'give',args->>'want');
 elsif action='cancel' then
  update tt_cards_private.mail set status='cancelled',sender_ok=false,recipient_ok=false where id=m.id and status='pending';
 elsif action='change_offer' then
  if m.kind<>'trade' or m.status<>'pending' then raise exception 'Trade is closed';end if;
  update tt_cards_private.mail set give_card=args->>'give',want_card=args->>'want',sender_ok=false,recipient_ok=false,version=version+1 where id=m.id;
 elsif action='confirm' then
  if m.kind<>'trade' then raise exception 'Not a trade';end if;
  if m.status='complete' then return jsonb_build_object('complete',true,'repeated',true);end if;
  if m.status<>'pending' or m.created<now()-interval '7 days' then raise exception 'Trade is closed or expired';end if;
  if m.version<>(args->>'version')::int or args->>'version' is null then raise exception 'Offer changed. Review it again';end if;
  if p.trades>=10 or q.trades>=10 then raise exception 'A player has reached ten trades today';end if;
  update tt_cards_private.mail set sender_ok=sender_ok or me=sender,recipient_ok=recipient_ok or me=recipient where id=m.id returning * into m;
  if m.sender_ok and m.recipient_ok then
   if not exists(select 1 from tt_cards_private.players where id=m.sender and coalesce((copies->>m.give_card)::int,0)>0) or not exists(select 1 from tt_cards_private.players where id=m.recipient and coalesce((copies->>m.want_card)::int,0)>0) then raise exception 'A card is no longer available. Change or cancel this offer';end if;
   update tt_cards_private.players set copies=jsonb_set(copies,array[m.give_card],to_jsonb((copies->>m.give_card)::int-1)) where id=m.sender;
   update tt_cards_private.players set copies=jsonb_set(copies,array[m.want_card],to_jsonb((copies->>m.want_card)::int-1)) where id=m.recipient;
   update tt_cards_private.players set trades=trades+1,copies=jsonb_set(copies,array[m.want_card],to_jsonb(coalesce((copies->>m.want_card)::int,0)+1)),discovered=case when m.want_card=any(discovered) then discovered else array_append(discovered,m.want_card) end where id=m.sender;
   update tt_cards_private.players set trades=trades+1,copies=jsonb_set(copies,array[m.give_card],to_jsonb(coalesce((copies->>m.give_card)::int,0)+1)),discovered=case when m.give_card=any(discovered) then discovered else array_append(discovered,m.give_card) end where id=m.recipient;
   update tt_cards_private.mail set status='complete' where id=m.id;
  end if;
 elsif action<>'state' then raise exception 'Unknown card action';end if;
 select to_jsonb(x)-'day'-'seen' into result from tt_cards_private.players x where id=me;
 result:=result||jsonb_build_object('friends',coalesce((select jsonb_agg(jsonb_build_object('id',x.id,'name',x.name,'accepted',f.accepted,'incoming',f.requested_by<>me,'online',x.seen>now()-interval '90 seconds')) from tt_cards_private.friends f join tt_cards_private.players x on x.id=case when f.a=me then f.b else f.a end where me in (f.a,f.b)),'[]'::jsonb));
 result:=result||jsonb_build_object('mail',coalesce((select jsonb_agg(t) from (select * from tt_cards_private.mail where me in(sender,recipient) order by created desc limit 100)t),'[]'::jsonb));
 result:=result||jsonb_build_object('uses',coalesce((select jsonb_agg(jsonb_build_object('scene',substr(key,5),'card',card)) from tt_cards_private.events where player=me and kind='use'),'[]'::jsonb));
 return result;
end $$;
revoke all on function tt_cards_private.command(text,jsonb) from public,anon;
grant execute on function tt_cards_private.command(text,jsonb) to authenticated;
create function public.tt_cards(action text,args jsonb default '{}') returns jsonb language sql security invoker set search_path='' as $$select tt_cards_private.command(action,args)$$;
revoke all on function public.tt_cards(text,jsonb) from public,anon;
grant execute on function public.tt_cards(text,jsonb) to authenticated;

insert into tt_cards_private.catalog(id,family,rarity,unlock_season) values
('stark-supply-cache','Supplies','COMMON',1),
('tyrell-grain-wagon','Supplies','COMMON',1),
('tully-river-provisions','Supplies','COMMON',1),
('arryn-trail-rations','Supplies','COMMON',1),
('martell-water-skins','Supplies','COMMON',1),
('baratheon-camp-stores','Supplies','COMMON',1),
('stark-winter-provisions','Supplies','RARE',2),
('tyrell-harvest-convoy','Supplies','RARE',2),
('tully-medicine-chest','Supplies','RARE',2),
('lannister-provision-contract','Supplies','RARE',2),
('tyrell-granary-reserve','Supplies','LEGENDARY',4),
('stark-winter-relief','Supplies','LEGENDARY',4),
('stark-scout-report','Information','COMMON',1),
('arryn-lookout-report','Information','COMMON',1),
('tully-river-chart','Information','COMMON',1),
('martell-desert-guide','Information','COMMON',1),
('greyjoy-tide-chart','Information','COMMON',1),
('baratheon-road-survey','Information','COMMON',1),
('stark-raven-insight','Information','RARE',2),
('arryn-hidden-pass-map','Information','RARE',2),
('martell-coded-message','Information','RARE',2),
('lannister-court-intelligence','Information','RARE',2),
('arryn-far-reaching-watch','Information','LEGENDARY',5),
('martell-hidden-network','Information','LEGENDARY',5),
('tully-letter-of-introduction','Diplomacy','COMMON',1),
('tyrell-welcome-gift','Diplomacy','COMMON',1),
('stark-letter-of-good-faith','Diplomacy','COMMON',1),
('arryn-audience-request','Diplomacy','COMMON',1),
('martell-peace-offering','Diplomacy','COMMON',1),
('baratheon-envoy-seal','Diplomacy','COMMON',1),
('tully-mediation-charter','Diplomacy','RARE',2),
('tyrell-diplomatic-seal','Diplomacy','RARE',2),
('martell-private-audience','Diplomacy','RARE',2),
('lannister-negotiating-writ','Diplomacy','RARE',2),
('tully-council-of-allies','Diplomacy','LEGENDARY',6),
('baratheon-royal-petition','Diplomacy','LEGENDARY',6),
('stark-trusted-escort','Protection','COMMON',1),
('arryn-mountain-guide','Protection','COMMON',1),
('tully-ferry-escort','Protection','COMMON',1),
('martell-desert-shelter','Protection','COMMON',1),
('greyjoy-coastal-passage','Protection','COMMON',1),
('baratheon-camp-watch','Protection','COMMON',1),
('stark-hidden-refuge','Protection','RARE',2),
('arryn-safe-passage','Protection','RARE',2),
('tully-river-sanctuary','Protection','RARE',2),
('greyjoy-storm-shelter','Protection','RARE',2),
('stark-sworn-guard','Protection','LEGENDARY',7),
('arryn-mountain-sanctuary','Protection','LEGENDARY',7);
