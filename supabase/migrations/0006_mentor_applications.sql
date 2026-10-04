-- SokoCircle 0006 — mentor applications.
--
-- The client used to write `profiles.tier = 'mentor'` directly, which meant any
-- user could grant themselves the Verified Mentor badge. Tier promotion is now
-- an admin/service-role decision recorded in `mentor_applications`.

create table if not exists public.mentor_applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  community_posts integer not null,
  helpful_upvotes integer not null,
  business_type text,
  location text,
  review_note text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (profile_id, status)
);

create index if not exists mentor_applications_profile_idx
  on public.mentor_applications (profile_id, created_at desc);

alter table public.mentor_applications enable row level security;

-- Users may read their own applications and file a new one. No UPDATE/DELETE
-- policy exists on purpose: only service_role can approve or reject.
create policy "Users read own mentor applications"
  on public.mentor_applications for select
  using (profile_id = (select public.current_profile_id()));

create policy "Users file own mentor application"
  on public.mentor_applications for insert
  with check (profile_id = (select public.current_profile_id()));

revoke all on table public.mentor_applications from anon;
grant select, insert on table public.mentor_applications to authenticated;

-- ============ apply_for_mentor ============
-- Criteria are re-checked here so a stale client UI cannot submit an
-- application the server would reject.

create or replace function public.apply_for_mentor()
returns public.mentor_applications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_application public.mentor_applications;
begin
  select * into v_profile
    from public.profiles
   where id = (select public.current_profile_id());

  if v_profile.id is null then
    raise exception 'profile_missing' using errcode = '42501';
  end if;

  if v_profile.tier = 'mentor' then
    raise exception 'already_mentor' using errcode = '22023';
  end if;

  if v_profile.community_posts < 10 then
    raise exception 'posts_below_threshold' using errcode = '22023';
  end if;

  if v_profile.helpful_upvotes < 50 then
    raise exception 'upvotes_below_threshold' using errcode = '22023';
  end if;

  if v_profile.business_type is null or v_profile.location is null then
    raise exception 'profile_incomplete' using errcode = '22023';
  end if;

  -- A rejected application may be re-applied; a pending one may not.
  delete from public.mentor_applications
   where profile_id = v_profile.id
     and status = 'rejected';

  insert into public.mentor_applications (
    profile_id, community_posts, helpful_upvotes, business_type, location
  )
  values (
    v_profile.id, v_profile.community_posts, v_profile.helpful_upvotes,
    v_profile.business_type, v_profile.location
  )
  returning * into v_application;

  return v_application;
end;
$$;

grant execute on function public.apply_for_mentor() to authenticated;

-- ============ approve_mentor_application ============
-- Called from an admin Edge Function (service_role), never from the client.
-- Promoting the tier here keeps `posts.is_verified` / `is_mentor` consistent via
-- the trigger installed in 0004.

create or replace function public.approve_mentor_application(p_application_id uuid)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_application public.mentor_applications;
  v_profile public.profiles;
begin
  select * into v_application
    from public.mentor_applications
   where id = p_application_id
     for update;

  if v_application.id is null then
    raise exception 'application_not_found' using errcode = 'P0002';
  end if;

  if v_application.status <> 'pending' then
    raise exception 'application_already_reviewed' using errcode = '22023';
  end if;

  update public.mentor_applications
     set status = 'approved', reviewed_at = now()
   where id = p_application_id;

  update public.profiles set tier = 'mentor' where id = v_application.profile_id
  returning * into v_profile;

  return v_profile;
end;
$$;

revoke all on function public.approve_mentor_application(uuid) from public, anon, authenticated;