import { supabase } from './supabase';
import { Database } from '../types/database';
import {
  ExploreCategory,
  FeedPost,
  GapAnalytics,
  GapReport,
  PostComment,
  Supplier,
  UserProfile,
} from '../types';

type Category = Database['public']['Tables']['categories']['Row'];
type SupplierRow = Database['public']['Tables']['suppliers']['Row'];
type PostRow = Database['public']['Tables']['posts']['Row'];
type GapReportRow = Database['public']['Tables']['gap_reports']['Row'];
type AnalyticsRow = Database['public']['Tables']['gap_analytics']['Row'];

const DEFAULT_CATGORY_ICONS = {
  mitumba: 'shopping-bag',
  kinyozi: 'scissors',
  duka: 'building-storefront',
  electronics: 'device-phone-mobile',
  hardware: 'wrench-screwdriver',
} as const;

function levelBand(pct: number): 'High' | 'Moderate' | 'Low' {
  if (pct >= 70) return 'High';
  if (pct >= 40) return 'Moderate';
  return 'Low';
}

function fmtTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const mins = Math.max(1, Math.round((Date.now() - d.getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

function mapCategory(c: Category): ExploreCategory {
  return {
    id: c.id,
    icon: (c.icon as ExploreCategory['icon']) || DEFAULT_CATGORY_ICONS[c.slug as keyof typeof DEFAULT_CATGORY_ICONS] || 'squares-2x2',
    iconColor: c.icon_color ?? '',
    iconBg: c.icon_bg ?? '',
    label: c.label,
    labelColor: c.label_color ?? '',
    labelBorder: c.label_border ?? 'transparent',
    title: c.title,
    subtitle: c.subtitle ?? undefined,
    members: c.members ? `${c.members.toLocaleString()} Members` : '',
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
    category: p.category ?? '',
    title: p.title,
    body: p.body,
    imageUrl: p.image_url,
    likes: p.likes,
    comments: p.comments,
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
    saturationLabel: `${a.market_saturation_pct}% (${levelBand(
      a.market_saturation_pct,
    )})`,
    saturationColor: '#815600',
  };
}

/* ============ Feed ============ */

export async function fetchPosts(): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapPost);
}

export async function createPost(input: {
  author_name: string;
  title: string;
  body: string;
  category?: string;
  image_url?: string;
}): Promise<FeedPost> {
  // Attribute the post to the signed-in user's profile row when available.
  const authorId = await currentProfileId();
  const { data, error } = await supabase
    .from('posts')
    .insert({ ...input, author_id: authorId, likes: 0, comments: 0 })
    .select()
    .single();
  if (error) throw error;
  return mapPost(data);
}

/**
 * Uploads a locally picked image to the public `post-images` bucket and returns
 * its public URL. Returns null when the user is signed out, offline, or the
 * bucket is not configured, so callers can degrade gracefully.
 */
export async function uploadPostImage(uri: string): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  const ownerId = auth?.user?.id;
  if (!ownerId) return null;

  try {
    const res = await fetch(uri);
    const body: ArrayBuffer | Blob =
      typeof res.arrayBuffer === 'function'
        ? await res.arrayBuffer()
        : await res.blob();

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
    const path = `${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from('post-images')
      .upload(path, body, { contentType, upsert: false });
    if (error) throw error;

    const { data } = supabase.storage.from('post-images').getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return null;
  }
}

export async function likePost(postId: string): Promise<void> {
  const { data: post, error: fetchErr } = await supabase
    .from('posts')
    .select('likes')
    .eq('id', postId)
    .single();
  if (fetchErr) throw fetchErr;
  const { error } = await supabase
    .from('posts')
    .update({ likes: (post?.likes ?? 0) + 1 })
    .eq('id', postId);
  if (error) throw error;
}

export async function addComment(postId: string, authorName: string, body: string): Promise<void> {
  const { error } = await supabase
    .from('post_comments')
    .insert({ post_id: postId, author_name: authorName, body })
    .select();
  if (error) throw error;
}

export async function fetchComments(postId: string): Promise<PostComment[]> {
  const { data, error } = await supabase
    .from('post_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((c) => ({
    id: c.id,
    authorName: c.author_name,
    body: c.body,
    createdAt: fmtTime(c.created_at),
  }));
}

/* ============ Explore ============ */

export async function fetchCategories(): Promise<ExploreCategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapCategory);
}

/* ============ Suppliers ============ */

export async function fetchSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapSupplier);
}

/* ============ Gap Map ============ */

export async function fetchGapReports(): Promise<GapReport[]> {
  const { data, error } = await supabase
    .from('gap_reports')
    .select('*')
    .order('title', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapGapReport);
}

export async function fetchAnalytics(category: string, location: string): Promise<GapAnalytics> {
  const { data, error } = await supabase
    .from('gap_analytics')
    .select('*')
    .eq('category', category)
    .ilike('location', `%${location.split(',')[0]}%`)
    .maybeSingle();
  if (error) throw error;
  if (data) return mapAnalytics(data);
  return {
    category,
    location,
    consumerDemandPct: 84,
    marketSaturationPct: 32,
    demandLabel: `84% (${levelBand(84)})`,
    demandColor: '#001533',
    saturationLabel: `32% (${levelBand(32)})`,
    saturationColor: '#815600',
  };
}

/* ============ Account ============ */

export async function fetchProfile(displayName = 'David Kamau'): Promise<UserProfile> {
  const { data: session } = await supabase.auth.getUser();
  const authUid = session?.user?.id ?? null;

  let profile: UserProfile = {
    id: 'demo',
    fullName: displayName,
    avatarUrl: null,
    businessType: 'Electronics Retailer',
    location: 'Kayole, Nairobi',
    tierName: 'Tier 1: Verified Trader',
    communityPosts: 24,
    helpfulUpvotes: 142,
    walletBalance: 12400,
    upvotedVerified: false,
    email: '',
  };

  if (authUid) {
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_uid', authUid)
      .maybeSingle();
    if (!profileError && data) {
      profile = {
        id: data.id,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        businessType: data.business_type ?? 'Electronics Retailer',
        location: data.location ?? 'Kayole, Nairobi',
        tierName: data.tier === 'mentor' ? 'Verified Mentor' : 'Tier 1: Verified Trader',
        communityPosts: data.community_posts,
        helpfulUpvotes: data.helpful_upvotes,
        walletBalance: data.wallet_balance,
        upvotedVerified: data.helpful_upvotes > 100,
        email: session.user?.email ?? '',
      };
    }
  }

  return profile;
}

export async function upgradeProfileTier(): Promise<void> {
  const { data: session } = await supabase.auth.getUser();
  const authUid = session?.user?.id;
  if (!authUid) throw new Error('sign-in-required');
  const { error } = await supabase
    .from('profiles')
    .update({ tier: 'mentor' })
    .eq('auth_uid', authUid);
  if (error) throw error;
}

/**
 * `post_likes.user_id` references `profiles.id`, not `auth.users.id`, so we
 * must resolve the signed-in user's profile row before touching likes.
 */
async function currentProfileId(): Promise<string | null> {
  const { data: me } = await supabase.auth.getUser();
  const authUid = me?.user?.id;
  if (!authUid) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_uid', authUid)
    .maybeSingle();
  return data?.id ?? null;
}

export async function toggleLike(postId: string, liked: boolean): Promise<void> {
  const userId = await currentProfileId();
  if (!userId) throw new Error('sign-in-required');
  if (liked) {
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    const { data: post } = await supabase.from('posts').select('likes').eq('id', postId).single();
    if (post) {
      await supabase.from('posts').update({ likes: Math.max(0, post.likes - 1) }).eq('id', postId);
    }
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
    const { data: post } = await supabase.from('posts').select('likes').eq('id', postId).single();
    if (post) {
      await supabase.from('posts').update({ likes: post.likes + 1 }).eq('id', postId);
    }
  }
}

export async function fetchUserLikedPosts(): Promise<Set<string>> {
  const userId = await currentProfileId();
  if (!userId) return new Set();
  const { data } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', userId);
  return new Set((data ?? []).map((r) => r.post_id));
}