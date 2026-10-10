import { IconName } from '../components/Icon';

export type FeedPost = {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  isVerified: boolean;
  isMentor: boolean;
  timeAgo: string;
  /** Raw ISO timestamp so relative labels can be refreshed without a refetch. */
  createdAt: string;
  category: string;
  title: string;
  body: string;
  imageUrl: string | null;
  likes: number;
  comments: number;
};

/** One page of the feed. `nextOffset` is `null` when the end has been reached. */
export type PostsPage = {
  items: FeedPost[];
  nextOffset: number | null;
};

export type ExploreCategory = {
  id: string;
  icon: IconName;
  iconColor: string;
  iconBg: string;
  label: string;
  labelColor: string;
  labelBorder: string;
  title: string;
  subtitle?: string;
  members: string;
  badge?: string;
  height: number;
  image?: string;
  dark?: boolean;
  simple?: boolean;
};

export type Supplier = {
  id: string;
  name: string;
  category: string;
  rating?: string;
  isNew?: boolean;
  verifiedDate: string;
  description: string;
  price: string;
  image?: string;
  featured?: boolean;
  location?: string;
  verified: boolean;
};

export type GapReport = {
  id: string;
  tag: string;
  icon: IconName;
  title: string;
  description: string;
  reportType: 'demographics' | 'competitor';
  previewImageUrl?: string;
  isUnlocked: boolean;
  price: number;
  location: string;
};

/** Rule-based county archetype from `gap_archetypes`. */
export type GapArchetype = {
  code: string;
  label: string;
  rule: string;
  typicalGaps: string;
  evidenceLevel: string;
};

/** Sector-level demand/saturation score for one category + location. */
export type SectorAnalytics = {
  kind: 'sector';
  category: string;
  location: string;
  consumerDemandPct: number;
  marketSaturationPct: number;
  demandLabel: string;
  demandColor: string;
  saturationLabel: string;
  saturationColor: string;
};

/**
 * County-level structural signal (category-agnostic). Rendered instead of the
 * demand/saturation bars because it carries GDP, population and inclusion data
 * rather than a sector score.
 */
export type CountyAnalytics = {
  kind: 'county';
  category: string;
  location: string;
  countyCode: string | null;
  population2023Proj: number | null;
  gdpUsdBn2024: number | null;
  gdpPerCapitaUsd2024: number | null;
  gdpPerCapitaVsNational: number | null;
  avgGdpGrowthPct: number | null;
  highGrowth: boolean | null;
  formalInclusionPct2024: number | null;
  finAccessFlag: string | null;
  msmeSharePct2016: number | null;
  msmeShareToPopShare: number | null;
  caipPhase1: boolean | null;
  caipNearComplete: boolean | null;
  documentedNotes: string | null;
  archetype: GapArchetype | null;
  sources: DataSource[];
};

export type GapAnalytics = SectorAnalytics | CountyAnalytics;

/** Administrative level a pickable location belongs to. */
export type LocationLevel = 'county' | 'subcounty' | 'constituency' | 'ward' | 'town';

/**
 * A selectable location loaded from the geo reference tables. Every option
 * resolves to a `county`, because the gap analytics/reports are county-keyed.
 */
export type LocationOption = {
  /** Unique option key (`label · level · code`). */
  value: string;
  label: string;
  county: string;
  level: LocationLevel;
};

/**
 * Everything shown on the Account tab. Nullable fields stay nullable — the UI
 * renders "Not set yet" rather than inventing a business type or location.
 */
export type UserProfile = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  businessType: string | null;
  location: string | null;
  bio: string | null;
  phone: string | null;
  tier: string;
  tierName: string;
  communityPosts: number;
  helpfulUpvotes: number;
  walletBalance: number;
  email: string | null;
  createdAt: string;
};

export type ProfileMetrics = {
  communityPosts: string;
  helpfulUpvotes: string;
  walletBalance: string;
};

export type PostComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
  isMine: boolean;
};

/**
 * A reference source / article backing the circle's market data. `url` is the
 * page opened when a reader taps the snippet.
 */
export type DataSource = {
  id: string;
  title: string;
  publisher: string | null;
  url: string | null;
  year: number | null;
  reliability: string;
};