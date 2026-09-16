-- Business onboarding

-- Allow signed-in users to update their own profile row directly.
create policy "Authenticated users update own profile"
  on public.profiles
  for update
  using (auth.uid() = auth_uid)
  with check (auth.uid() = auth_uid);

-- SECURITY DEFINER helper the mobile app uses to create or update the
-- signed-in user's profile row in a single call, regardless of RLS.
create or replace function public.upsert_my_profile(
  p_business_type text,
  p_location text,
  p_full_name text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (auth_uid, full_name, business_type, location)
  values (auth.uid(), p_full_name, p_business_type, p_location)
  on conflict (auth_uid) do update
    set full_name = excluded.full_name,
        business_type = excluded.business_type,
        location = excluded.location;
end;
$$;

grant execute on function public.upsert_my_profile(text, text, text)
  to anon, authenticated;