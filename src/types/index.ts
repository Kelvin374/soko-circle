import { IconName } from '../components/Icon';

export type FeedPost = {
  id: string;
  authorName: string;
  authorAvatar: string | null;
  isVerified: boolean;
  isMentor: boolean;
  timeAgo: string;
  category: string;
  title: string;
  body: string;
  imageUrl: string | null;
  likes: number;
  comments: number;
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

export type GapAnalytics = {
  category: string;
  location: string;
  consumerDemandPct: number;
  marketSaturationPct: number;
  demandLabel: string;
  demandColor: string;
  saturationLabel: string;
  saturationColor: string;
};

export type UserProfile = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  businessType: string;
  location: string;
  tierName: string;
  communityPosts: number;
  helpfulUpvotes: number;
  walletBalance: number;
  upvotedVerified: boolean;
  email: string;
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
};