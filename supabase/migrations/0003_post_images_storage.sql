-- Storage bucket for images attached to Home feed posts.

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Anyone (including the anon client) may read post images.
create policy "Public post images read"
  on storage.objects for select
  using (bucket_id = 'post-images');

-- Only signed-in users may upload, and they must own the file path.
create policy "Authenticated post images upload"
  on storage.objects for insert
  with check (bucket_id = 'post-images' and auth.role() = 'authenticated');

-- Owners can replace or remove their own uploads.
create policy "Owners update post images"
  on storage.objects for update
  using (bucket_id = 'post-images' and owner = auth.uid());

create policy "Owners delete post images"
  on storage.objects for delete
  using (bucket_id = 'post-images' and owner = auth.uid());
