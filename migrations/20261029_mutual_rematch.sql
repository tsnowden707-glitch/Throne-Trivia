CREATE TABLE IF NOT EXISTS tt_private.rematches (
 original_room uuid PRIMARY KEY REFERENCES public.tt_rooms(id) ON DELETE CASCADE,
 owner_accepted boolean NOT NULL DEFAULT false,
 guest_accepted boolean NOT NULL DEFAULT false,
 next_room uuid REFERENCES public.tt_rooms(id)
);
REVOKE ALL ON tt_private.rematches FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.tt_rematch(p_room uuid, p_accept boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE r public.tt_rooms%rowtype; m tt_private.rematches%rowtype; n public.tt_rooms%rowtype;
BEGIN
 SELECT * INTO r FROM public.tt_rooms WHERE id=p_room FOR UPDATE;
 IF auth.uid() IS NULL OR NOT FOUND OR (auth.uid() IS DISTINCT FROM r.owner_id AND auth.uid() IS DISTINCT FROM r.guest_id) THEN RAISE EXCEPTION 'Not a player'; END IF;
 IF r.state<>'finished' THEN RAISE EXCEPTION 'Finish this match first'; END IF;
 IF r.guest_id IS NULL THEN RAISE EXCEPTION 'Two players are required'; END IF;
 INSERT INTO tt_private.rematches(original_room) VALUES(p_room) ON CONFLICT DO NOTHING;
 IF p_accept IS NULL THEN
  IF auth.uid()=r.owner_id THEN UPDATE tt_private.rematches SET owner_accepted=false WHERE original_room=p_room AND next_room IS NULL;
  ELSE UPDATE tt_private.rematches SET guest_accepted=false WHERE original_room=p_room AND next_room IS NULL; END IF;
 ELSIF p_accept THEN
  IF auth.uid()=r.owner_id THEN UPDATE tt_private.rematches SET owner_accepted=true WHERE original_room=p_room;
  ELSE UPDATE tt_private.rematches SET guest_accepted=true WHERE original_room=p_room; END IF;
 END IF;
 SELECT * INTO m FROM tt_private.rematches WHERE original_room=p_room;
 IF m.owner_accepted AND m.guest_accepted AND m.next_room IS NULL THEN
  INSERT INTO public.tt_rooms(owner_id,guest_id,season,owner_character,guest_character,owner_ready,guest_ready)
  VALUES(r.owner_id,r.guest_id,r.season,r.owner_character,r.guest_character,auth.uid()<>r.owner_id,auth.uid()<>r.guest_id) RETURNING * INTO n;
  PERFORM public.tt_ready(n.id);
  UPDATE tt_private.rematches SET next_room=n.id WHERE original_room=p_room;
  m.next_room:=n.id;
 END IF;
 SELECT * INTO n FROM public.tt_rooms WHERE id=m.next_room;
 RETURN jsonb_build_object('accepted',CASE WHEN auth.uid()=r.owner_id THEN m.owner_accepted ELSE m.guest_accepted END,
 'friend_accepted',CASE WHEN auth.uid()=r.owner_id THEN m.guest_accepted ELSE m.owner_accepted END,'room_id',m.next_room,'code',n.code);
END $$;
REVOKE ALL ON FUNCTION public.tt_rematch(uuid,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.tt_rematch(uuid,boolean) TO authenticated;
