-- SokoCircle 0005 — server-side counters.
--
-- Every number shown in the UI (likes, comments, community posts, helpful
-- upvotes) is now derived from rows instead of client arithmetic, so a user
-- cannot inflate their own credibility.

-- ============ post_likes -> posts.likes + author helpful_upvotes ============

create or replace function public.on_post_like_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author uuid;
begin
  update public.posts
     set likes = likes + 1
   where id = NEW.post_id;

  select author_id into v_author from public.posts where id = NEW.post_id;

  if v_author is not null and v_author <> NEW.user_id then
    update public.profiles
       set helpful_upvotes = helpful_upvotes + 1
     where id = v_author;
  end if;

  return NEW;
end;
$$;

create or replace function public.on_post_like_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author uuid;
begin
  update public.posts
     set likes = greatest(0, likes - 1)
   where id = OLD.post_id;

  select author_id into v_author from public.posts where id = OLD.post_id;

  if v_author is not null and v_author <> OLD.user_id then
    update public.profiles
       set helpful_upvotes = greatest(0, helpful_upvotes - 1)
     where id = v_author;
  end if;

  return OLD;
end;
$$;

drop trigger if exists post_likes_count_insert on public.post_likes;
create trigger post_likes_count_insert
  after insert on public.post_likes
  for each row execute function public.on_post_like_insert();

drop trigger if exists post_likes_count_delete on public.post_likes;
create trigger post_likes_count_delete
  after delete on public.post_likes
  for each row execute function public.on_post_like_delete();

-- ============ post_comments -> posts.comments ============

create or replace function public.on_post_comment_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts set comments = comments + 1 where id = NEW.post_id;
  return NEW;
end;
$$;

create or replace function public.on_post_comment_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts set comments = greatest(0, comments - 1) where id = OLD.post_id;
  return OLD;
end;
$$;

drop trigger if exists post_comments_count_insert on public.post_comments;
create trigger post_comments_count_insert
  after insert on public.post_comments
  for each row execute function public.on_post_comment_insert();

drop trigger if exists post_comments_count_delete on public.post_comments;
create trigger post_comments_count_delete
  after delete on public.post_comments
  for each row execute function public.on_post_comment_delete();

-- ============ posts -> author community_posts ============

create or replace function public.on_post_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set community_posts = community_posts + 1
   where id = NEW.author_id;

  return NEW;
end;
$$;

create or replace function public.on_post_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set community_posts = greatest(0, community_posts - 1)
   where id = OLD.author_id;

  return OLD;
end;
$$;

drop trigger if exists posts_count_insert on public.posts;
create trigger posts_count_insert
  after insert on public.posts
  for each row execute function public.on_post_insert();

drop trigger if exists posts_count_delete on public.posts;
create trigger posts_count_delete
  after delete on public.posts
  for each row execute function public.on_post_delete();

-- ============ backfill ============
-- Make existing rows consistent with the trigger-derived truth.
update public.posts p
   set likes = (select count(*) from public.post_likes l where l.post_id = p.id),
       comments = (select count(*) from public.post_comments c where c.post_id = p.id);

update public.profiles pr
   set community_posts = (
         select count(*) from public.posts p where p.author_id = pr.id
       ),
       helpful_upvotes = coalesce((
         select count(*)
           from public.post_likes l
           join public.posts p on p.id = l.post_id
          where p.author_id = pr.id
            and l.user_id is distinct from pr.id
       ), 0);