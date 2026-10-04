import { supabase } from './supabase';
import { fmtTime } from './format';
import { Database } from '../types/database';
import {
  ExploreCategory,
  FeedPost,
  GapAnalytics,
  GapReport,
  PostComment,
  PostsPage,
  Supplier,
  UserProfile,
} from '../types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type SupplierRow = Database['public']['Tables']['suppliers']['Row'];
type PostRow = Database['public']['Tables']['posts']['Row'];
type GapReportRow = Database['public']['Tables']['gap_reports']['Row'];
type AnalyticsRow = Database['public']['Tables']['gap_analytics']['Row'];
type CommentRow = Database['public']['Tables']['post_comments']['Row'];

export const PAGE_SIZE = 20;

const DEFAULT_CATEGORY_ICONS = {
  mitumba: 'shopping-bag',
  kinyozi: 'scissors',
  duka: 'building-storefront',
  electronics: 'device-phone-mobile',
  hardware: 'wrench-screwdriver',
} as const;

export const TIER_LABELS: Record<string, string> = {
  new: 'New Trader',
  tier1: 'Tier 1: Verified Trader',
  tier2: 'Tier 2: Trusted Dealer',
  mentor: 'Verified Mentor',
};

export function tierLabel(tier: string): string {
  return TIER_LABELS[tier] ?? TIER_LABELS.new;
}

/** Raised when the signed-in user has no `profiles` row yet (e.g. trigger pending). */
export class ProfileMissingError extends Error {
  constructor() {
    super('Your profile has not finished setting up yet. Pull to refresh in a moment.');
    this.name = 'ProfileMissingError';
  }
}

export class SignInRequiredError extends Error {
  constructor() {
    super('Please sign in to continue.');
    this.name = 'SignInRequiredError';
  }
}

function levelBand(pct: number): 'High' | 'Moderate' | 'Low' {
  if (pct >= 70) return 'High';
  if (pct >= 40) return 'Moderate';
  return 'Low';
}

/* ==================================================================== */
/* mappers                                                              */
/* ==================================================================== */

function mapCategory(c: Database['public']['Tables']['categories']['Row']): ExploreCategory {
  return {
    id: c.id,
    icon:
      (c.icon as ExploreCategory['icon']) ||
      DEFAULT_CATEGORY_ICONS[c.slug as keyof typeof DEFAULT_CATEGORY_ICONS] ||
      'squares-2x2',
    iconColor: c.icon_color ?? '',
    iconBg: c.icon_bg ?? '',
    label: c.label,
    labelColor: c.label_color ?? '',
    labelBorder: c.label_border ?? 'transparent',
    title: c.title,
    subtitle: c.subtitle ?? undefined,
    members: c.members ? `${c.members.toLocaleString('en-KE')} members` : '',
    badge: c.badge ?? undefined,
    height: c.height ?? 200,
    image: c.image_url ?? undefined,
    dark: c.dark,
    simple: c.simple,
  };
}

function mapSupplier(s: SupplierRow): Supplier {
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    rating: s.rating != null ? String(s.rating) : undefined,
    isNew: s.is_new,
    verifiedDate: s.verified_date,
    description: s.description,
    price: s.price,
    image: s.image_url ?? undefined,
    featured: s.featured,
    location: s.location ?? undefined,
    verified: s.verified,
  };
}

function mapPost(p: PostRow): FeedPost {
  return {
    id: p.id,
    authorName: p.author_name,
    authorAvatar: p.author_avatar,
    isVerified: p.is_verified,
    isMentor: p.is_mentor,
    timeAgo: fmtTime(p.created_at),
    createdAt: p.created_at,
    category: p.category ?? '',
    title: p.title,
    body: p.body,
    imageUrl: p.image_url,
    likes: p.likes,
    comments: p.comments,
  };
}

function mapComment(c: CommentRow): PostComment {
  return {
    id: c.id,
    authorName: c.author_name,
    body: c.body,
    createdAt: fmtTime(c.created_at),
    isMine: false,
  };
}

function mapGapReport(r: GapReportRow): GapReport {
  return {
    id: r.id,
    tag: r.tag,
    icon: r.icon as GapReport['icon'],
    title: r.title,
    description: r.description,
    reportType: (r.report_type as GapReport['reportType']) || 'demographics',
    previewImageUrl: r.preview_image_url ?? undefined,
    isUnlocked: r.is_unlocked,
    price: r.price_ksh,
    location: r.location,
  };
}

function mapAnalytics(a: AnalyticsRow): GapAnalytics {
  return {
    category: a.category,
    location: a.location,
    consumerDemandPct: a.consumer_demand_pct,
    marketSaturationPct: a.market_saturation_pct,
    demandLabel: `${a.consumer_demand_pct}% (${levelBand(a.consumer_demand_pct)})`,
    demandColor: '#001533',
    saturationLabel: `${a.market_saturation_pct}% (${levelBand(a.market_saturation_pct)})`,
    saturationColor: '#815600',
  };
}

function mapProfile(row: ProfileRow, email: string | null): UserProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    businessType: row.business_type,
    location: row.location,
    bio: row.bio,
    phone: row.phone,
    tier: row.tier,
    tierName: tierLabel(row.tier),
    communityPosts: row.community_posts,
    helpfulUpvotes: row.helpful_upvotes,
    walletBalance: row.wallet_balance,
    email,
    createdAt: row.created_at,
  };
}

/* ==================================================================== */
/* current user                                                         */
/* ==================================================================== */

/**
 * `posts.author_id`, `post_likes.user_id` and `post_comments.user_id` all point
 * at `profiles.id`, not `auth.users.id`. The 0004 migration exposes
 * `current_profile_id()` so the mapping stays in one place.
 */
export async function currentProfileId(): Promise<string> {
  const { data, error } = await supabase.rpc('current_profile_id');
  if (error) throw error;
  const id = data as string | null;
  if (!id) throw new ProfileMissingError();
  return id;
}

/* ==================================================================== */
/* feed                                                                 */
/* ==================================================================== */

/**
 * Range pagination over a stable sort (`created_at desc, id desc`). Offset is
 * threaded back by callers through `nextOffset`.
 */
export async function fetchPostsPage(opts?: {
  offset?: number;
  limit?: number;
  category?: string | null;
}): Promise<PostsPage> {
  const offset = opts?.offset ?? 0;
  const limit = opts?.limit ?? PAGE_SIZE;

  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1);

  if (opts?.category) query = query.eq('category', opts.category);

  const { data, error } = await query;
  if (error) throw error;

  const rows = (data ?? []) as PostRow[];

  return {
    items: rows.map(mapPost),
    nextOffset: rows.length === limit ? offset + limit : null,
  };
}

/** Distinct categories currently present in the feed, for the filter chips. */
export async function fetchPostCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('category')
    .not('category', 'is', null)
    .order('category', { ascending: true })
    .limit(200);
  if (error) throw error;

  const seen: string[] = [];
  for (const row of (data ?? []) as { category: string | null }[]) {
    const value = row.category?.trim();
    if (value && !seen.includes(value)) seen.push(value);
  }
  return seen;
}

/** Server-validated insert. Identity and counters are set by migration 0004/0005. */
export async function createPost(input: {
  title: string;
  body: string;
  category?: string | null;
  image_url?: string | null;
}): Promise<FeedPost> {
  const { data, error } = await supabase.rpc('create_post', {
    p_title: input.title,
    p_body: input.body,
    p_category: input.category ?? null,
    p_image_url: input.image_url ?? null,
  });
  if (error) throw error;
  return mapPost(data as PostRow);
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
}

/**
 * Uploads a locally picked image to the public `post-images` bucket and returns
 * its public URL. Throws on failure — callers must surface the error instead of
 * silently posting without an image.
 */
export async function uploadPostImage(uri: string): Promise<string> {
  const profileId = await currentProfileId();

  const res = await fetch(uri);
  const body: ArrayBuffer | Blob =
    typeof res.arrayBuffer === 'function' ? await res.arrayBuffer() : await res.blob();

  const rawExt = uri.split('?')[0].split('.').pop()?.toLowerCase() ?? 'jpg';
  const ext = ['jpg', 'jpeg', 'png', 'webp', 'heic'].includes(rawExt) ? rawExt : 'jpg';
  const contentType =
    ext === 'png'
      ? 'image/png'
      : ext === 'webp'
        ? 'image/webp'
        : ext === 'heic'
          ? 'image/heic'
          : 'image/jpeg';
  const path = `${profileId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('post-images')
    .upload(path, body, { contentType, upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from('post-images').getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Likes are rows, not arithmetic. Migration 0005 keeps `posts.likes` in sync, so
 * this only inserts/deletes `post_likes`.
 */
export async function setPostLiked(postId: string, liked: boolean): Promise<void> {
  const profileId = await currentProfileId();

  if (liked) {
    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: profileId });
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', profileId);
  if (error) throw error;
}

/** Post ids the signed-in user has liked. */
export async function fetchLikedPostIds(): Promise<string[]> {
  const profileId = await currentProfileId();
  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', profileId);
  if (error) throw error;
  return ((data ?? []) as { post_id: string }[]).map((r) => r.post_id);
}

/* ==================================================================== */
/* comments                                                             */
/* ==================================================================== */

export async function fetchComments(postId: string): Promise<PostComment[]> {
  const profileId = await currentProfileId().catch(() => null);

  const { data, error } = await supabase
    .from('post_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;

  return ((data ?? []) as CommentRow[]).map((c) => ({
    ...mapComment(c),
    isMine: profileId !== null && c.user_id === profileId,
  }));
}

export async function createComment(postId: string, body: string): Promise<PostComment> {
  const { data, error } = await supabase.rpc('create_comment', {
    p_post_id: postId,
    p_body: body,
  });
  if (error) throw error;
  const row = data as CommentRow;
  return { ...mapComment(row), isMine: true };
}

export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabase.from('post_comments').delete().eq('id', commentId);
  if (error) throw error;
}

/* ==================================================================== */
/* explore                                                              */
/* ==================================================================== */

export async function fetchCategories(): Promise<ExploreCategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as Database['public']['Tables']['categories']['Row'][]).map(mapCategory);
}

/* ==================================================================== */
/* suppliers                                                            */
/* ==================================================================== */

export async function fetchSuppliers(opts?: {
  category?: string | null;
  county?: string | null;
}): Promise<Supplier[]> {
  let query = supabase
    .from('suppliers')
    .select('*')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: true });

  if (opts?.category) query = query.eq('category', opts.category);
  if (opts?.county) query = query.ilike('location', `%${opts.county}%`);

  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as SupplierRow[]).map(mapSupplier);
}

/* ==================================================================== */
/* gap map                                                              */
/* ==================================================================== */

export async function fetchGapReports(category?: string | null): Promise<GapReport[]> {
  let query = supabase.from('gap_reports').select('*').order('title', { ascending: true });
  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as GapReportRow[]).map(mapGapReport);
}

/**
 * Returns `null` when the dataset has no row for this category/location. The UI
 * shows an explicit "no data yet" state — it must never invent percentages.
 */
export async function fetchAnalytics(
  category: string,
  location: string,
): Promise<GapAnalytics | null> {
  const needle = location.split(',')[0]?.trim() ?? location;
  const { data, error } = await supabase
    .from('gap_analytics')
    .select('*')
    .eq('category', category)
    .ilike('location', `%${needle}%`)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapAnalytics(data as AnalyticsRow) : null;
}

/* ==================================================================== */
/* notifications                                                        */
/* ==================================================================== */

type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export type AppNotification = NotificationRow & { timeAgo: string };

const NOTIFICATION_ICONS: Record<string, ExploreCategory['icon']> = {
  post_liked: 'hand-thumb-up',
  post_commented: 'chat-bubble-left-right',
  tier_changed: 'shield-check',
  report_unlocked: 'document-check',
  mentor_decision: 'trophy',
};

function mapNotification(n: NotificationRow): AppNotification {
  return {
    ...n,
    timeAgo: fmtTime(n.created_at),
  };
}

export function notificationIcon(kind: string): ExploreCategory['icon'] {
  return NOTIFICATION_ICONS[kind] ?? 'bell';
}

/**
 * Calls with `onAuthChange` so the bell badge and the sheet stay in sync with
 * likes/comments landing while the user reads the feed.
 */
export async function fetchNotifications(limit = 50): Promise<AppNotification[]> {
  const profileId = await currentProfileId();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as NotificationRow[]).map(mapNotification);
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const { data, error } = await supabase.rpc('unread_notification_count');
  if (error) throw error;
  return (data as number | null) ?? 0;
}

/** Pass no ids to mark everything read. Returns the number of rows updated. */
export async function markNotificationsRead(ids?: string[]): Promise<number> {
  const { data, error } = await supabase.rpc('mark_notifications_read', {
    p_ids: ids ?? null,
  });
  if (error) throw error;
  return (data as number | null) ?? 0;
}

/* ==================================================================== */
/* mentor applications                                                  */
/* ==================================================================== */

export type MentorApplication = Database['public']['Tables']['mentor_applications']['Row'];

/**
 * The signed-in user's most recent mentor application, or `null` if they have
 * never applied. Only `service_role` can approve, so the UI shows "under review".
 */
export async function fetchMyMentorApplication(): Promise<MentorApplication | null> {
  const profileId = await currentProfileId();
  const { data, error } = await supabase
    .from('mentor_applications')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as MentorApplication | null) ?? null;
}

/** Files a real application. Throws with the server's reason if it is rejected. */
export async function applyForMentor(): Promise<MentorApplication> {
  const { data, error } = await supabase.rpc('apply_for_mentor');
  if (error) throw error;
  return data as MentorApplication;
}

/* ==================================================================== */
/* account                                                              */
/* ==================================================================== */

/** Throws `ProfileMissingError` rather than returning a placeholder profile. */
export async function fetchProfile(): Promise<UserProfile> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  const authUid = auth.user?.id;
  if (!authUid) throw new SignInRequiredError();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_uid', authUid)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new ProfileMissingError();

  return mapProfile(data as ProfileRow, auth.user?.email ?? null);
}

/**
 * Only the columns the client is allowed to write (see the column-level GRANT in
 * migration 0004). `tier`, `wallet_balance` and the counters are not writable.
 */
export async function updateProfile(
  patch: Partial<
    Pick<ProfileRow, 'full_name' | 'avatar_url' | 'business_type' | 'location' | 'bio' | 'phone'>
  >,
): Promise<UserProfile> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  const authUid = auth.user?.id;
  if (!authUid) throw new SignInRequiredError();

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('auth_uid', authUid)
    .select('*')
    .single();
  if (error) throw error;

  return mapProfile(data as ProfileRow, auth.user?.email ?? null);
}