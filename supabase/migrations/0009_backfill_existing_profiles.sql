-- SokoCircle 0009 - backfill profiles for accounts created before 0004.
--
-- 0004 introduced `handle_new_user()` so every new sign-up gets a `profiles`
-- row, and `create_post`/`create_comment`/`create_post_like` refuse to run
-- without one (`profile_missing`). Accounts that already existed when 0004 was
-- applied were never covered by the trigger, so their posts, comments and
-- likes all failed with `profile_missing` even though onboarding looked fine.
--
-- This migration provisions those rows once. It is idempotent: rows are only
-- inserted for auth users that have no profile yet, and re-running it is a
-- no-op.

insert into public.profiles (auth_uid, full_name)
select
  u.id,
  coalesce(
    nullif(trim(coalesce(u.raw_user_meta_data ->> 'full_name', '')), ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
    'New Trader'
  )
from auth.users u
where not exists (
  select 1 from public.profiles p where p.auth_uid = u.id
);