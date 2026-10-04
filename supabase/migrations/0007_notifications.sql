-- SokoCircle 0007 — in-app notifications.
--
-- Replaces the hardcoded notification list in the app. Rows are written by
-- triggers only; clients can read and mark their own notifications as read but
-- never create or edit them.
--
-- Push delivery (expo-notifications / Edge Function fan-out) is layered on top of
-- this table in a later migration — the data model does not change.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('post_liked', 'post_commented', 'tier_changed', 'report_unlocked', 'mentor_decision')),
  title text not null,
  body text not null,
  post_id uuid references public.posts(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_profile_created_idx
  on public.notifications (profile_id, created_at desc);

create index if not exists notifications_unread_idx
  on public.notifications (profile_id) where read_at is null;

alter table public.notifications enable row level security;

create policy "Users read own notifications"
  on public.notifications for select
  using (profile_id = (select public.current_profile_id()));

-- Only the `read_at` flip is permitted; no INSERT/DELETE policies exist so the
-- triggers remain the single writer.
create policy "Users mark own notifications read"
  on public.notifications for update
  using (profile_id = (select public.current_profile_id()))
  with check (profile_id = (select public.current_profile_id()));

revoke all on table public.notifications from anon;
grant select, update (read_at) on table public.notifications to authenticated;

-- ============ triggers ============

create or replace function public.notify_post_author_on_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post public.posts;
begin
  select * into v_post from public.posts where id = NEW.post_id;

  -- Seeded/legacy posts have no author row, and nobody should be notified
  -- about their own taps.
  if v_post.id is null or v_post.author_id is null or v_post.author_id = NEW.user_id then
    return NEW;
  end if;

  insert into public.notifications (profile_id, actor_profile_id, kind, title, body, post_id)
  values (
    v_post.author_id,
    NEW.user_id,
    'post_liked',
    'Your post was upvoted',
    'A trader found your post helpful.',
    v_post.id
  );

  return NEW;
end;
$$;

create or replace function public.notify_post_author_on_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post public.posts;
begin
  select * into v_post from public.posts where id = NEW.post_id;

  if v_post.id is null or v_post.author_id is null or v_post.author_id = NEW.user_id then
    return NEW;
  end if;

  insert into public.notifications (profile_id, actor_profile_id, kind, title, body, post_id)
  values (
    v_post.author_id,
    NEW.user_id,
    'post_commented',
    'New comment on your post',
    left(NEW.body, 160),
    v_post.id
  );

  return NEW;
end;
$$;

drop trigger if exists post_likes_notify on public.post_likes;
create trigger post_likes_notify
  after insert on public.post_likes
  for each row execute function public.notify_post_author_on_like();

drop trigger if exists post_comments_notify on public.post_comments;
create trigger post_comments_notify
  after insert on public.post_comments
  for each row execute function public.notify_post_author_on_comment();

-- ============ mark_notifications_read ============

create or replace function public.mark_notifications_read(p_ids uuid[] default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_count integer;
begin
  v_profile_id := public.current_profile_id();

  if v_profile_id is null then
    raise exception 'profile_missing' using errcode = '42501';
  end if;

  update public.notifications
     set read_at = now()
   where profile_id = v_profile_id
     and read_at is null
     and (p_ids is null or id = any (p_ids));

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.mark_notifications_read(uuid[]) to authenticated;

-- ============ unread count ============
-- Small, index-backed helper for the tab-bar badge.

create or replace function public.unread_notification_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
    from public.notifications
   where profile_id = (select public.current_profile_id())
     and read_at is null;
$$;

grant execute on function public.unread_notification_count() to authenticated;