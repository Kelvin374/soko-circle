-- SokoCircle 0008 - storage path ownership for post images.
--
-- 0003 lets any authenticated user upload into any path in the public
-- `post-images` bucket. Uploads are now pinned to the caller's own profile
-- folder (`<profiles.id>/<file>`), which is what the app already writes.

drop policy if exists "Authenticated post images upload" on storage.objects;

create policy "Owners upload post images"
  on storage.objects for insert
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = (select public.current_profile_id())::text
  );