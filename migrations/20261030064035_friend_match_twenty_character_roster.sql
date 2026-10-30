CREATE OR REPLACE FUNCTION public.tt_configure_room(p_room uuid, p_character text, p_season integer DEFAULT NULL::integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE r public.tt_rooms%rowtype;
BEGIN
 SELECT * INTO r FROM public.tt_rooms WHERE id=p_room FOR UPDATE;
 IF auth.uid() IS NULL OR NOT FOUND OR (auth.uid() IS DISTINCT FROM r.owner_id AND auth.uid() IS DISTINCT FROM r.guest_id) THEN RAISE EXCEPTION 'Not a player'; END IF;
 IF r.state<>'waiting' THEN RAISE EXCEPTION 'Match already started'; END IF;
 IF p_season IS NOT NULL THEN
  IF auth.uid() IS DISTINCT FROM r.owner_id THEN RAISE EXCEPTION 'Only the host chooses the season'; END IF;
  IF r.guest_id IS NOT NULL OR r.owner_ready OR r.guest_ready THEN RAISE EXCEPTION 'Choose a season before your friend joins'; END IF;
  IF p_season NOT BETWEEN 1 AND 8 THEN RAISE EXCEPTION 'Invalid season'; END IF;
  UPDATE public.tt_rooms SET season=p_season WHERE id=p_room; r.season=p_season;
 END IF;
 IF p_character IS NULL OR NOT (p_character = ANY(ARRAY['jon-snow','daenerys','arya','sansa-stark','tyrion','cersei','jaime-lannister','ned','robb-stark','bran-stark','catelyn-stark','theon-greyjoy','samwell-tarly','brienne','sandor-the-hound-clegane','joffrey-baratheon','stannis-baratheon','davos-seaworth','margaery-tyrell','tywin-lannister']::text[])) THEN RAISE EXCEPTION 'Choose one of the 20 friend-match characters'; END IF;
 IF auth.uid()=r.owner_id THEN UPDATE public.tt_rooms SET owner_character=p_character WHERE id=p_room;
 ELSE UPDATE public.tt_rooms SET guest_character=p_character WHERE id=p_room; END IF;
 RETURN public.tt_room_details(p_room);
END $function$
;

CREATE OR REPLACE FUNCTION public.tt_ready(p_room uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE r public.tt_rooms%rowtype; cnt integer;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in first'; END IF;
 SELECT * INTO r FROM public.tt_rooms WHERE id=p_room FOR UPDATE;
 IF NOT FOUND OR (auth.uid() IS DISTINCT FROM r.owner_id AND auth.uid() IS DISTINCT FROM r.guest_id) THEN RAISE EXCEPTION 'Not a player'; END IF;
 IF r.state<>'waiting' THEN RETURN jsonb_build_object('state',r.state); END IF;
 IF (CASE WHEN auth.uid()=r.owner_id THEN r.owner_character ELSE r.guest_character END) IS NULL OR NOT ((CASE WHEN auth.uid()=r.owner_id THEN r.owner_character ELSE r.guest_character END) = ANY(ARRAY['jon-snow','daenerys','arya','sansa-stark','tyrion','cersei','jaime-lannister','ned','robb-stark','bran-stark','catelyn-stark','theon-greyjoy','samwell-tarly','brienne','sandor-the-hound-clegane','joffrey-baratheon','stannis-baratheon','davos-seaworth','margaery-tyrell','tywin-lannister']::text[])) THEN RAISE EXCEPTION 'Choose one of the 20 friend-match characters before readying'; END IF;
 IF r.owner_id=auth.uid() THEN UPDATE public.tt_rooms SET owner_ready=true WHERE id=p_room;
 ELSE UPDATE public.tt_rooms SET guest_ready=true WHERE id=p_room; END IF;
 SELECT * INTO r FROM public.tt_rooms WHERE id=p_room;
 IF r.owner_ready AND r.guest_ready THEN
  -- Serialize matches sharing a player, in stable order, before selecting fresh questions.
  PERFORM pg_advisory_xact_lock(hashtextextended(p::text,0)) FROM unnest(ARRAY[r.owner_id,r.guest_id]) p ORDER BY p;

  SELECT count(*) INTO cnt FROM (SELECT difficulty FROM public.tt_questions WHERE season=r.season AND active AND NOT EXISTS (
 SELECT 1 FROM public.tt_rounds prior JOIN public.tt_rooms previous ON previous.id=prior.room_id
 WHERE prior.question_id=public.tt_questions.id AND (previous.owner_id IN (r.owner_id,r.guest_id) OR previous.guest_id IN (r.owner_id,r.guest_id))
) GROUP BY difficulty HAVING count(*)>=CASE difficulty WHEN 'hard' THEN 2 ELSE 4 END) x;
  IF cnt<>3 THEN RAISE EXCEPTION 'Not enough fresh questions remain for both players in this season. Choose another season. Previous questions will not be repeated.'; END IF;
  INSERT INTO public.tt_rounds(room_id,number,question_id)
  SELECT p_room,row_number() OVER(ORDER BY random()),id FROM (
   (SELECT id FROM public.tt_questions WHERE season=r.season AND active AND NOT EXISTS (
 SELECT 1 FROM public.tt_rounds prior JOIN public.tt_rooms previous ON previous.id=prior.room_id
 WHERE prior.question_id=public.tt_questions.id AND (previous.owner_id IN (r.owner_id,r.guest_id) OR previous.guest_id IN (r.owner_id,r.guest_id))
) AND difficulty='easy' ORDER BY random() LIMIT 4)
   UNION ALL (SELECT id FROM public.tt_questions WHERE season=r.season AND active AND NOT EXISTS (
 SELECT 1 FROM public.tt_rounds prior JOIN public.tt_rooms previous ON previous.id=prior.room_id
 WHERE prior.question_id=public.tt_questions.id AND (previous.owner_id IN (r.owner_id,r.guest_id) OR previous.guest_id IN (r.owner_id,r.guest_id))
) AND difficulty='medium' ORDER BY random() LIMIT 4)
   UNION ALL (SELECT id FROM public.tt_questions WHERE season=r.season AND active AND NOT EXISTS (
 SELECT 1 FROM public.tt_rounds prior JOIN public.tt_rooms previous ON previous.id=prior.room_id
 WHERE prior.question_id=public.tt_questions.id AND (previous.owner_id IN (r.owner_id,r.guest_id) OR previous.guest_id IN (r.owner_id,r.guest_id))
) AND difficulty='hard' ORDER BY random() LIMIT 2)
  ) chosen;
  UPDATE public.tt_rooms SET state='playing',round_number=1,reveal_at=now()+tt_private.narration_delay(p_room,1),closes_at=now()+tt_private.narration_delay(p_room,1)+interval '15 seconds' WHERE id=p_room;
  UPDATE public.tt_rounds SET reveal_at=now()+tt_private.narration_delay(p_room,1),closes_at=now()+tt_private.narration_delay(p_room,1)+interval '15 seconds' WHERE room_id=p_room AND number=1;
 END IF;
 RETURN jsonb_build_object('state',(SELECT state FROM public.tt_rooms WHERE id=p_room));
END $function$
;

