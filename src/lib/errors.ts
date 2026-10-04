/**
 * Turns Supabase/PostgREST failures into something a trader can act on. The raw
 * payloads are developer-facing (`profile_missing`, `PGRST202`, `42501`), so they
 * are mapped here instead of being shown verbatim in the UI.
 */

type ErrorLike = {
  message?: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
};

const EXACT_MESSAGES: Record<string, string> = {
  profile_missing:
    'Your profile has not finished setting up yet. Finish your business details, then try again.',
  unknown_author: 'Your profile could not be verified. Sign out and back in, then try again.',
  title_too_short: 'Give your post a longer title.',
  body_too_short: 'Add a little more detail to your post.',
  comment_empty: 'Write something before posting the comment.',
  already_mentor: 'You are already a verified mentor.',
  posts_below_threshold: 'Publish more community posts before applying to be a mentor.',
  upvotes_below_threshold: 'You need more helpful upvotes before applying to be a mentor.',
  profile_incomplete: 'Add your business type and county before applying.',
  application_not_found: 'That application no longer exists.',
  application_already_reviewed: 'That application has already been reviewed.',
  storage_exception:
    'The image could not be uploaded. Check your connection and try again.',
};

function includes(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle);
}

export function humanizeError(value: unknown, fallback: string): string {
  if (value instanceof Error && value.name === 'ProfileMissingError') {
    return value.message;
  }

  const error = (value ?? {}) as ErrorLike;
  const raw = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`.trim();

  for (const [code, message] of Object.entries(EXACT_MESSAGES)) {
    if (raw.includes(code)) return message;
  }

  if (error.code === 'PGRST202' || includes(raw, 'could not find the function')) {
    return 'This app is out of date: the database is missing the latest schema. Apply the pending Supabase migrations, then try again.';
  }
  if (error.code === 'PGRST205' || includes(raw, 'could not find the table')) {
    return 'This app is out of date: the database is missing the latest tables. Apply the pending Supabase migrations, then try again.';
  }
  if (raw.includes('42501') || includes(raw, 'permission denied')) {
    return 'Your account is not allowed to do that yet.';
  }
  if (raw.includes('23505') || includes(raw, 'duplicate key')) {
    return 'That already exists.';
  }
  if (
    includes(raw, 'failed to fetch') ||
    includes(raw, 'network request failed') ||
    includes(raw, 'econnrefused')
  ) {
    return 'No connection to the server. Check your data and try again.';
  }

  return error.message?.trim() || raw || fallback;
}