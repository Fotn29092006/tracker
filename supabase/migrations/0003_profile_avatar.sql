-- Profile photo avatar.
-- Stores a public URL pointing at an image in the EXISTING `progress` storage
-- bucket (no new bucket/policies needed — that bucket already allows the owner
-- to upload under their own {user_id}/ folder and is publicly readable).
alter table public.profiles
  add column if not exists avatar_url text;
