-- SokoCircle 0004 — profile security, signup provisioning and write policies.
--
-- Goals
--   1. Create the `profiles` row from an `auth.users` trigger instead of the
--      client-side insert that used to swallow errors.
--   2. Stop trusting the client for identity, tier, wallet and counters.
--   3. Give authors real ownership policies on posts / comments / likes.

-- ============ profiles: extra columns ============

alter table public.profiles add column if not exists phone text;

-- The old default (12400) handed every new user a fake KES 12.4k balance.
alter table public.profiles alter column wallet_balance set default 0;

-- Reset balances that were created purely by that fake default.
-- REVIEW: drop this statement if you ever stored a real KSh 12,400 balance.
update public.profiles set wallet_balance = 0 where wallet_balance = 12400;

-- New accounts start as `new`, not `tier1`. `tier1` used to be the default, which
-- meant every sign-up rendered a "Verified" badge before any checks had run.
-- Promotion to mentor is server-side only (see 0006); tier1/tier2 arrive with
-- the KYC review flow.
alter table public.profiles alter column tier set default 'new';

-- ============ helper: map auth.uid() -> profiles.id ============
-- SECURITY DEFINER so RLS on `profiles` cannot hide the caller's own row.
create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id from public.profiles p where p.auth_uid = auth.uid() limit 1;
$$;

revoke all on function public.current_profile_id() from public;
grant execute on function public.current_profile_id() to anon, authenticated;

-- ============ signup provisioning ============

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  v_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');

  insert into public.profiles (auth_uid, full_name)
  values (
    new.id,
    coalesce(v_name, nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'New Trader')
  )
  on conflict (auth_uid) do update
    set full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- The client no longer creates profile rows, so it does not need INSERT.
drop policy if exists "Authenticated profiles write" on public.profiles;
revoke insert on table public.profiles from anon, authenticated;

-- ============ profile updates: column-restricted ============
-- `tier`, `wallet_balance`, `community_posts` and `helpful_upvotes` are only
-- ever written by triggers or SECURITY DEFINER functions, never by the client.
revoke update on table public.profiles from anon, authenticated;
grant update (full_name, avatar_url, business_type, location, bio, phone)
  on table public.profiles to authenticated;

-- `upsert_my_profile` is SECURITY DEFINER, so it is unaffected by the revoke.
revoke execute on function public.upsert_my_profile(text, text, text) from anon;
grant execute on function public.upsert_my_profile(text, text, text) to authenticated;

-- ============ identity triggers ============
-- Denormalised author columns are always derived from the profile row so the
-- client cannot impersonate another trader.

create or replace function public.set_post_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
begin
  select * into v_profile from public.profiles where id = NEW.author_id;

  if v_profile.id is null then
    raise exception 'unknown_author' using errcode = '42501';
  end if;

  NEW.author_name  := v_profile.full_name;
  NEW.author_avatar := v_profile.avatar_url;
  NEW.is_verified   := (v_profile.tier in ('tier1', 'tier2', 'mentor'));
  NEW.is_mentor     := (v_profile.tier = 'mentor');
  return NEW;
end;
$$;

create or replace function public.set_comment_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
begin
  select * into v_profile from public.profiles where id = NEW.user_id;

  if v_profile.id is null then
    raise exception 'unknown_author' using errcode = '42501';
  end if;

  NEW.author_name := v_profile.full_name;
  return NEW;
end;
$$;

create or replace function public.set_like_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  v_profile_id := public.current_profile_id();

  if NEW.user_id is null or NEW.user_id <> v_profile_id then
    NEW.user_id := v_profile_id;
  end if;

  if NEW.user_id is null then
    raise exception 'profile_missing' using errcode = '42501';
  end if;

  return NEW;
end;
$$;

drop trigger if exists posts_set_author on public.posts;
create trigger posts_set_author
  before insert or update of author_id on public.posts
  for each row execute function public.set_post_author();

drop trigger if exists comments_set_author on public.post_comments;
create trigger comments_set_author
  before insert on public.post_comments
  for each row execute function public.set_comment_author();

drop trigger if exists likes_set_owner on public.post_likes;
create trigger likes_set_owner
  before insert on public.post_likes
  for each row execute function public.set_like_owner();

-- ============ write policies ============

drop policy if exists "Authenticated posts write" on public.posts;
drop policy if exists "Authenticated likes write" on public.post_likes;
drop policy if exists "Authenticated comments write" on public.post_comments;

create policy "Authors insert own posts"
  on public.posts for insert
  with check (author_id = (select public.current_profile_id()));

create policy "Authors update own posts"
  on public.posts for update
  using (author_id = (select public.current_profile_id()))
  with check (author_id = (select public.current_profile_id()));

create policy "Authors delete own posts"
  on public.posts for delete
  using (author_id = (select public.current_profile_id()));

create policy "Authors insert own comments"
  on public.post_comments for insert
  with check (user_id = (select public.current_profile_id()));

create policy "Authors delete own comments"
  on public.post_comments for delete
  using (user_id = (select public.current_profile_id()));

create policy "Users insert own likes"
  on public.post_likes for insert
  with check (user_id = (select public.current_profile_id()));

create policy "Users delete own likes"
  on public.post_likes for delete
  using (user_id = (select public.current_profile_id()));

-- Client may edit post copy, never the counters.
revoke update on table public.posts from anon, authenticated;
grant update (title, body, category, image_url) on table public.posts to authenticated;

-- ============ create_post / create_comment RPCs ============
-- Server-side validation, identity and counter initialisation in one round trip.

create or replace function public.create_post(
  p_title text,
  p_body text,
  p_category text default null,
  p_image_url text default null
) returns public.posts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_post public.posts;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'profile_missing' using errcode = '42501';
  end if;

  if length(trim(coalesce(p_title, ''))) < 3 then
    raise exception 'title_too_short' using errcode = '22023';
  end if;

  if length(trim(coalesce(p_body, ''))) < 10 then
    raise exception 'body_too_short' using errcode = '22023';
  end if;

  insert into public.posts (author_id, category, title, body, image_url)
  values (v_profile_id, nullif(trim(p_category), ''), trim(p_title), trim(p_body), p_image_url)
  returning * into v_post;

  return v_post;
end;
$$;

create or replace function public.create_comment(
  p_post_id uuid,
  p_body text
) returns public.post_comments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_comment public.post_comments;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'profile_missing' using errcode = '42501';
  end if;

  if length(trim(coalesce(p_body, ''))) < 1 then
    raise exception 'comment_empty' using errcode = '22023';
  end if;

  insert into public.post_comments (post_id, user_id, body)
  values (p_post_id, v_profile_id, trim(p_body))
  returning * into v_comment;

  return v_comment;
end;
$$;

grant execute on function public.create_post(text, text, text, text) to authenticated;
grant execute on function public.create_comment(uuid, text) to authenticated;