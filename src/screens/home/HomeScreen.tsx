import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import TopAppBar from '../../components/TopAppBar';
import ThemedText from '../../components/ThemedText';
import Icon from '../../components/Icon';
import PostComments from '../../components/PostComments';
import CreatePostSheet from '../../components/CreatePostSheet';
import { colors } from '../../theme/colors';
import { spacing, radii, shadows } from '../../theme';
import { rgba } from '../../utils/color';
import { usePosts } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { fetchUserLikedPosts, toggleLike } from '../../lib/api';
import { FeedPost } from '../../types';

const MENTOR_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBV84iX6b6Xe0mRpF9EnKUF5b0R0vh9n41_rdk5yEIbxXInaze2WW-r1Q7Ud00kRbbmRxcECPq0MJ_Z7WYM_6GS4cNNgiGdlhMwRJyWClnVa4AAxE4exoQi9DwIrQuBszdCVmqAgdsy5nYke_wKDQ-sW3kxsj3Pwh1GThqiRK2JJbX8sV6kfIpU5TCazJdG1v4QmLULis9aePjxlSKHnyXQ_n_apDVYE7WP1e3YKjee66R-6KdGj3t1';

function toggleInSet(set: Set<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

type PostCardProps = {
  post: FeedPost;
  liked: boolean;
  bookmarked: boolean;
  likeDelta: number;
  onLike: (post: FeedPost) => void;
  onBookmark: (id: string) => void;
  onComment: (id: string) => void;
};

function PostCard({
  post,
  liked,
  bookmarked,
  likeDelta,
  onLike,
  onBookmark,
  onComment,
}: PostCardProps) {
  const initials = post.authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <View style={styles.mainPost}>
      <View style={styles.authorRow}>
        {post.authorAvatar ? (
          <Image source={{ uri: post.authorAvatar }} style={styles.authorAvatar} />
        ) : (
          <View style={[styles.authorAvatar, styles.avatarFallback]}>
            <ThemedText variant="labelSm" color={colors.primary} style={styles.avatarInitials}>
              {initials}
            </ThemedText>
          </View>
        )}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ThemedText variant="labelSm" color={colors.primary}>
              {post.authorName}
            </ThemedText>
            {post.isVerified && (
              <Icon name="check-badge" size={16} color={colors.secondary} variant="solid" />
            )}
          </View>
          <ThemedText variant="labelSm" color={colors.onSurfaceVariant} style={{ fontSize: 11 }}>
            {post.isMentor ? 'Verified Mentor • ' : ''}
            {post.timeAgo}
          </ThemedText>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <View style={styles.tagBadge}>
          <ThemedText variant="labelSm" color={colors.outline} style={styles.tagText}>
            {post.category}
          </ThemedText>
        </View>
        <ThemedText variant="titleMd" color={colors.primary} style={{ marginTop: 6 }}>
          {post.title}
        </ThemedText>
        <ThemedText
          variant="bodyMd"
          color={colors.onSurfaceVariant}
          numberOfLines={3}
          style={{ marginTop: 6 }}
        >
          {post.body}
        </ThemedText>
      </View>

      {post.imageUrl && (
        <View style={styles.postImageWrap}>
          <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
          <LinearGradient
            colors={[rgba(colors.primary, 0.6), 'transparent']}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      )}

      <View style={styles.postActions}>
        <View style={{ flexDirection: 'row', gap: 24 }}>
          <Pressable style={styles.actionBtn} onPress={() => onLike(post)}>
            <Icon
              name="hand-thumb-up"
              size={18}
              color={liked ? colors.secondary : colors.onSurfaceVariant}
              variant="solid"
            />
            <ThemedText
              variant="labelSm"
              color={liked ? colors.secondary : colors.onSurfaceVariant}
              style={{ fontSize: 12 }}
            >
              {Math.max(0, post.likes + likeDelta)}
            </ThemedText>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={() => onComment(post.id)}>
            <Icon
              name="chat-bubble-left-right"
              size={18}
              color={colors.onSurfaceVariant}
              variant="solid"
            />
            <ThemedText variant="labelSm" color={colors.onSurfaceVariant} style={{ fontSize: 12 }}>
              {post.comments}
            </ThemedText>
          </Pressable>
        </View>
        <Pressable onPress={() => onBookmark(post.id)}>
          <Icon
            name="bookmark"
            size={22}
            color={bookmarked ? colors.primary : colors.onSurfaceVariant}
            variant="solid"
          />
        </Pressable>
      </View>
    </View>
  );
}

function PostSkeleton() {
  return (
    <View style={[styles.mainPost, { gap: 12 }]}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <View style={[styles.authorAvatar, { backgroundColor: colors.surfaceContainerHigh }]} />
        <View style={{ gap: 6, flex: 1 }}>
          <View style={styles.skeletonLineWide} />
          <View style={styles.skeletonLineNarrow} />
        </View>
      </View>
      <View style={{ height: 16, width: '30%', borderRadius: 6, backgroundColor: colors.surfaceContainerHigh }} />
      <View style={{ height: 18, width: '90%', borderRadius: 6, backgroundColor: colors.surfaceContainerHigh }} />
      <View style={[styles.postImageWrap, { backgroundColor: colors.surfaceContainerHigh }]} />
    </View>
  );
}

export default function HomeScreen() {
  const [activeChip, setActiveChip] = useState('All');
  const { fullName } = useAuth();
  const { data: posts, loading: postsLoading, reload: reloadPosts } = usePosts();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [serverLiked, setServerLiked] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetchUserLikedPosts()
      .then((liked) => {
        if (!active) return;
        setLikedPosts(liked);
        setServerLiked(liked);
      })
      .catch(() => {
        // Not signed in or offline — fall back to optimistic local-only likes.
      });
    return () => {
      active = false;
    };
  }, []);

  // Filter chips mirror the categories actually present in the feed.
  const chips = useMemo(() => {
    const seen: string[] = [];
    (posts ?? []).forEach((p) => {
      const category = p.category.trim();
      if (category && !seen.includes(category)) seen.push(category);
    });
    return ['All', ...seen];
  }, [posts]);

  useEffect(() => {
    // A reload can drop the category we were filtered on (e.g. after posting).
    if (activeChip !== 'All' && !chips.includes(activeChip)) {
      setActiveChip('All');
    }
  }, [chips, activeChip]);

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (activeChip === 'All') return posts;
    return posts.filter((p) => p.category === activeChip);
  }, [posts, activeChip]);

  const handleLike = useCallback(
    (post: FeedPost) => {
      const wasLiked = likedPosts.has(post.id);
      setLikedPosts((prev) => toggleInSet(prev, post.id));
      toggleLike(post.id, wasLiked).catch(() => {
        // Persist failed (offline / signed out): roll the optimistic toggle back.
        setLikedPosts((prev) => toggleInSet(prev, post.id));
      });
    },
    [likedPosts],
  );

  const handleBookmark = useCallback((postId: string) => {
    setBookmarkedPosts((prev) => toggleInSet(prev, postId));
  }, []);

  return (
    <View style={styles.screen}>
      <TopAppBar
        leftIcon="map-pin"
        title="SokoCircle"
        actions={[
          { icon: 'pencil-square', onPress: () => setComposerOpen(true) },
          { icon: 'bell' },
        ]}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome */}
        <View style={styles.welcome}>
          <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
            Good morning,
          </ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ThemedText variant="displayLg" color={colors.primary}>
              Nairobi
            </ThemedText>
            <Icon
              name="face-smile"
              size={36}
              color={colors.secondaryContainer}
              variant="solid"
            />
          </View>
        </View>

        {/* SACCO Banner */}
        <LinearGradient
          colors={[colors.primaryContainer, colors.primaryContainer, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.banner, shadows.card]}
        >
          {/* Decorative blob */}
          <View style={styles.bannerBlob} />

          <View style={{ flex: 1 }}>
            <View style={styles.bannerBadge}>
              <ThemedText
                variant="labelSm"
                color={colors.onSecondaryContainer}
              >
                Partner Offer
              </ThemedText>
            </View>
            <ThemedText
              variant="titleMd"
              color={colors.onPrimary}
              style={{ marginBottom: 6 }}
            >
              Fast-Track SACCO Financing
            </ThemedText>
            <ThemedText
              variant="bodyMd"
              color={rgba(colors.onPrimaryContainer, 0.8)}
            >
              Access up to KES 500k collateral-free to expand your inventory
              before the holiday rush.
            </ThemedText>
          </View>

          <Pressable
            style={styles.bannerBtn}
            onPress={() => Alert.alert('SACCO Financing', 'Opening the Fast-Track SACCO Financing application form.')}
          >
            <ThemedText variant="labelSm" color={colors.onSecondaryContainer}>
              Apply Now
            </ThemedText>
          </Pressable>
        </LinearGradient>

        {/* Trending */}
        <View style={styles.trendingHeader}>
          <ThemedText variant="headline">
            Trending This Week
          </ThemedText>
          <Pressable
            style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
            onPress={() => setActiveChip('All')}
          >
            <ThemedText variant="labelSm" color={colors.secondary}>
              View All
            </ThemedText>
            <Icon name="arrow-right" size={16} color={colors.secondary} />
          </Pressable>
        </View>

        {/* Chips */}
        {chips.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {chips.map((chip) => {
              const active = activeChip === chip;
              return (
                <Pressable
                  key={chip}
                  onPress={() => setActiveChip(chip)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <ThemedText
                    variant="labelSm"
                    color={active ? colors.onPrimary : colors.onSurfaceVariant}
                    style={{ fontSize: 13 }}
                  >
                    {chip}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* Feed */}
        {postsLoading && !posts ? (
          <PostSkeleton />
        ) : filteredPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Icon name="chat-bubble-left-right" size={28} color={colors.outline} />
            </View>
            <ThemedText variant="titleMd" color={colors.primary} style={{ textAlign: 'center' }}>
              No posts here yet
            </ThemedText>
            <ThemedText
              variant="bodyMd"
              color={colors.onSurfaceVariant}
              style={{ textAlign: 'center' }}
            >
              {activeChip === 'All'
                ? 'Be the first to share a trade insight with the circle.'
                : `Nothing tagged "${activeChip}" yet. Try another filter or start the conversation.`}
            </ThemedText>
            <Pressable style={styles.emptyBtn} onPress={() => setComposerOpen(true)}>
              <Icon name="pencil-square" size={16} color={colors.onSecondaryContainer} variant="solid" />
              <ThemedText variant="labelSm" color={colors.onSecondaryContainer}>
                Create a Post
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              liked={likedPosts.has(post.id)}
              bookmarked={bookmarkedPosts.has(post.id)}
              likeDelta={
                (likedPosts.has(post.id) ? 1 : 0) - (serverLiked.has(post.id) ? 1 : 0)
              }
              onLike={handleLike}
              onBookmark={handleBookmark}
              onComment={setCommentPostId}
            />
          ))
        )}

        {/* Mentor Card */}
        <View style={styles.mentorCard}>
          <View style={styles.mentorBlob} />

          <View style={styles.mentorBadge}>
            <ThemedText variant="labelSm" color={colors.onSurfaceVariant} style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.2 }}>
              New Expert Added
            </ThemedText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <View style={styles.mentorAvatarWrap}>
              <Image source={{ uri: MENTOR_IMG }} style={styles.mentorAvatar} />
              <View style={styles.starBadge}>
                <Icon name="star" size={12} color={colors.onSecondary} variant="solid" />
              </View>
            </View>
            <View>
              <ThemedText variant="titleMd" color={colors.primary}>John M.</ThemedText>
              <ThemedText variant="labelSm" color={colors.onSurfaceVariant}>
                Electronics Importer
              </ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Icon name="briefcase" size={14} color={colors.secondary} variant="solid" />
                <ThemedText variant="labelSm" color={colors.secondary} style={{ fontSize: 12 }}>
                  10 yrs exp.
                </ThemedText>
              </View>
            </View>
          </View>

          <ThemedText variant="bodyMd" color={colors.onSurfaceVariant} style={{ marginBottom: 24, flex: 1 }}>
            Specializing in direct OEM sourcing from Shenzhen and Dubai. John
            is now taking booking for 1-on-1 consultations to help you bypass
            middlemen.
          </ThemedText>

          <Pressable
            style={styles.viewProfileBtn}
            onPress={() => Alert.alert('John M.', 'Viewing the mentor profile for John M. (Electronics Importer).')}
          >
            <ThemedText variant="labelSm" color={colors.primary}>
              View Profile
            </ThemedText>
          </Pressable>
        </View>

        {/* Skeleton shimmer placeholder */}
        <View style={{ gap: 12, marginTop: 24 }}>
          <View style={{ height: 24, width: 192, borderRadius: 6, backgroundColor: colors.surfaceContainerHigh }} />
          <View style={styles.skeletonRow}>
            <View style={[styles.skeletonCard, { flex: 1 }]} />
            <View style={[styles.skeletonCard, { flex: 1 }]} />
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <PostComments
        visible={commentPostId !== null}
        postId={commentPostId ?? ''}
        onClose={() => setCommentPostId(null)}
      />

      <CreatePostSheet
        visible={composerOpen}
        authorName={fullName || 'You'}
        onClose={() => setComposerOpen(false)}
        onCreated={() => {
          setComposerOpen(false);
          reloadPosts();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, gap: spacing.sectionPadding },

  welcome: { gap: 4 },

  // Banner
  banner: {
    borderRadius: radii.xl,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    overflow: 'hidden',
  },
  bannerBlob: {
    position: 'absolute',
    right: -32,
    top: -32,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: colors.primary,
    opacity: 0.5,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    marginBottom: 8,
  },
  bannerBtn: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    alignSelf: 'center',
  },

  // Trending
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: rgba(colors.outlineVariant, 0.5),
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },

  // Main Post
  mainPost: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: radii.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(21,42,74,0.06)',
    ...shadows.card,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHigh,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '700',
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  tagText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  postImageWrap: {
    height: 192,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: rgba(colors.outlineVariant, 0.2),
    paddingTop: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skeletonLineWide: {
    height: 14,
    width: '40%',
    borderRadius: 6,
    backgroundColor: colors.surfaceContainerHigh,
  },
  skeletonLineNarrow: {
    height: 10,
    width: '25%',
    borderRadius: 6,
    backgroundColor: colors.surfaceContainerHigh,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(21,42,74,0.06)',
    ...shadows.card,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 6,
  },

  // Mentor Card
  mentorCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: radii.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(21,42,74,0.06)',
    overflow: 'hidden',
    ...shadows.card,
  },
  mentorBlob: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 128,
    height: 128,
    borderBottomLeftRadius: 999,
    backgroundColor: rgba(colors.secondaryContainer, 0.2),
  },
  mentorBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
    marginBottom: 16,
  },
  mentorAvatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
    elevation: 2,
  },
  mentorAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    resizeMode: 'cover',
  },
  starBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
  },
  viewProfileBtn: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingVertical: 12,
    borderRadius: radii.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: rgba(colors.outlineVariant, 0.3),
  },

  // Skeleton
  skeletonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skeletonCard: {
    height: 128,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceContainerHigh,
  },
});
