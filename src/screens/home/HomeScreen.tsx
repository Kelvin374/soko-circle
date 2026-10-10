import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import TopAppBar from '../../components/TopAppBar';
import AdBanner from '../../components/AdBanner';
import ThemedText from '../../components/ThemedText';
import Icon from '../../components/Icon';
import PostComments from '../../components/PostComments';
import CreatePostSheet from '../../components/CreatePostSheet';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { spacing, radii, shadows } from '../../theme';
import { rgba } from '../../utils/color';
import { fmtTime, greetingForDate } from '../../lib/format';
import {
  useDataSources,
  useFeed,
  useLikedPostIds,
  usePostCategories,
  useProfile,
} from '../../hooks/useData';
import { setPostLiked } from '../../lib/api';
import { DataSource, FeedPost } from '../../types';

type PostCardProps = {
  post: FeedPost;
  liked: boolean;
  onLike: (post: FeedPost) => void;
  onComment: (id: string) => void;
};

function PostCard({ post, liked, onLike, onComment }: PostCardProps) {
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
            {fmtTime(post.createdAt)}
          </ThemedText>
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        {post.category ? (
          <View style={styles.tagBadge}>
            <ThemedText variant="labelSm" color={colors.outline} style={styles.tagText}>
              {post.category}
            </ThemedText>
          </View>
        ) : null}
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
          <Pressable
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel={liked ? 'Remove like' : 'Like this post'}
            onPress={() => onLike(post)}
          >
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
              {post.likes}
            </ThemedText>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel="Open comments"
            onPress={() => onComment(post.id)}
          >
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
      <View
        style={{
          height: 16,
          width: '30%',
          borderRadius: 6,
          backgroundColor: colors.surfaceContainerHigh,
        }}
      />
      <View
        style={{
          height: 18,
          width: '90%',
          borderRadius: 6,
          backgroundColor: colors.surfaceContainerHigh,
        }}
      />
    </View>
  );
}

type SourceCardProps = {
  source: DataSource;
  onOpen: (source: DataSource) => void;
};

/** A snippet of a reference article; tapping it opens the source page. */
function SourceCard({ source, onOpen }: SourceCardProps) {
  const meta = [source.publisher, source.year ? String(source.year) : null]
    .filter(Boolean)
    .join(' • ');

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Open source: ${source.title}`}
      onPress={() => onOpen(source)}
      style={({ pressed }) => [styles.sourceCard, pressed && styles.sourceCardPressed]}
    >
      <View style={styles.sourceBadge}>
        <ThemedText variant="labelSm" color={colors.secondary} style={styles.sourceBadgeText}>
          {source.reliability}
        </ThemedText>
      </View>

      <ThemedText
        variant="labelSm"
        color={colors.primary}
        numberOfLines={3}
        style={styles.sourceTitle}
      >
        {source.title}
      </ThemedText>

      {meta ? (
        <ThemedText
          variant="labelSm"
          color={colors.onSurfaceVariant}
          numberOfLines={1}
          style={{ fontSize: 11 }}
        >
          {meta}
        </ThemedText>
      ) : null}

      <View style={styles.sourceFooter}>
        <Icon name="globe-alt" size={14} color={colors.secondary} />
        <ThemedText variant="labelSm" color={colors.secondary} style={{ fontSize: 11 }}>
          Read source
        </ThemedText>
        <Icon name="arrow-up-right" size={14} color={colors.secondary} />
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const feed = useFeed(activeChip);
  const liked = useLikedPostIds();
  const profile = useProfile();

  const [likedOverride, setLikedOverride] = useState<Record<string, boolean>>({});
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  const categoriesState = usePostCategories();
  const chips = useMemo(() => ['All', ...(categoriesState.data ?? [])], [categoriesState.data]);

  const sources = useDataSources(8);

  const handleOpenSource = useCallback(async (source: DataSource) => {
    if (!source.url) return;
    try {
      await Linking.openURL(source.url);
    } catch {
      // A malformed/unsupported URL should not crash the screen.
    }
  }, []);

  const likedIds = useMemo(() => liked.data ?? new Set<string>(), [liked.data]);

  const isLiked = useCallback(
    (id: string) => likedOverride[id] ?? likedIds.has(id),
    [likedOverride, likedIds],
  );

  const handleLike = useCallback(
    async (post: FeedPost) => {
      const wasLiked = isLiked(post.id);

      // Optimistic: flip the flag and the visible counter, then reconcile with
      // the server (migration 0005 owns `posts.likes`).
      setLikedOverride((prev) => ({ ...prev, [post.id]: !wasLiked }));
      feed.setItems((items) =>
        items.map((p) =>
          p.id === post.id ? { ...p, likes: Math.max(0, p.likes + (wasLiked ? -1 : 1)) } : p,
        ),
      );

        try {
          await setPostLiked(post.id, !wasLiked);
          await liked.reload();
        } catch {
          // Roll back — the like did not persist.
          setLikedOverride((prev) => ({ ...prev, [post.id]: wasLiked }));
          feed.setItems((items) =>
            items.map((p) =>
              p.id === post.id ? { ...p, likes: Math.max(0, p.likes + (wasLiked ? 1 : -1)) } : p,
            ),
          );
        }
      },
      [feed, isLiked, liked],
    );

  const posts = feed.data ?? [];
  const showSkeleton = feed.loading && posts.length === 0;

  return (
    <View style={styles.screen}>
      <TopAppBar
        leftIcon="map-pin"
        title="SokoCircle"
        actions={[{ icon: 'pencil-square', onPress: () => setComposerOpen(true) }]}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl
              refreshing={feed.loading && posts.length > 0}
              onRefresh={async () => {
                await Promise.all([feed.reload(), liked.reload(), profile.reload()]);
              }}
              tintColor={colors.primary}
            />
        }
      >
          <View style={styles.welcome}>
            <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
              {greetingForDate()}, {profile.data?.fullName || 'Trader'}!
            </ThemedText>
          </View>

        {/* Rotating ad banner (placeholder inventory, ready to wire to a backend). */}
        <AdBanner />

        {/* Reads come from public.data_sources; tapping a card opens the article. */}
        {(sources.loading || (sources.data?.length ?? 0) > 0) && (
          <View style={styles.reads}>
            <View style={styles.readsHeader}>
              <ThemedText variant="labelSm" color={colors.primary} style={styles.readsTitle}>
                Market reads
              </ThemedText>
              <ThemedText
                variant="labelSm"
                color={colors.onSurfaceVariant}
                style={{ fontSize: 11 }}
              >
                Sources behind the circle
              </ThemedText>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sourceRow}
            >
              {sources.loading
                ? [0, 1].map((i) => <View key={i} style={styles.sourceSkeleton} />)
                : (sources.data ?? []).map((source) => (
                    <SourceCard key={source.id} source={source} onOpen={handleOpenSource} />
                  ))}
            </ScrollView>
          </View>
        )}

        {/* Filter chips mirror the categories actually present in the feed. */}
        {chips.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {chips.map((chip) => {
              const active = chip === 'All' ? activeChip === null : activeChip === chip;
              return (
                <Pressable
                  key={chip}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setActiveChip(chip === 'All' ? null : chip)}
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
        {showSkeleton ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : feed.error ? (
          <ErrorState
            title="Couldn't load the feed"
            error={feed.error}
            onRetry={feed.reload}
          />
        ) : posts.length === 0 ? (
          <EmptyState
            icon="chat-bubble-left-right"
            title="No posts here yet"
            message={
              activeChip
                ? `Nothing tagged "${activeChip}" yet. Try another filter or start the conversation.`
                : 'Be the first to share a trade insight with the circle.'
            }
            actionLabel="Create a Post"
            onAction={() => setComposerOpen(true)}
          />
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                liked={isLiked(post.id)}
                onLike={(p) => void handleLike(p)}
                onComment={setCommentPostId}
              />
            ))}

            {feed.loadingMore && (
              <View style={styles.footerLoading}>
                <ActivityIndicator color={colors.primary} />
              </View>
            )}

            {feed.loadMoreError && (
              <Pressable
                onPress={feed.loadMore}
                accessibilityRole="button"
                accessibilityLabel="Retry loading more posts"
                style={styles.retryMore}
              >
                <Icon name="exclamation-triangle" size={16} color={colors.error} />
                <ThemedText variant="labelSm" color={colors.error}>
                  Could not load more posts. Tap to retry.
                </ThemedText>
              </Pressable>
            )}

            {feed.hasMore && !feed.loadingMore && !feed.loadMoreError && (
              <Pressable
                onPress={feed.loadMore}
                accessibilityRole="button"
                accessibilityLabel="Load more posts"
                style={styles.loadMore}
              >
                <ThemedText variant="labelSm" color={colors.secondary} style={{ fontWeight: '700' }}>
                  Load more
                </ThemedText>
                <Icon name="chevron-down" size={16} color={colors.secondary} />
              </Pressable>
            )}
          </>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <PostComments
        visible={commentPostId !== null}
        postId={commentPostId ?? ''}
        onClose={() => setCommentPostId(null)}
      />

      <CreatePostSheet
        visible={composerOpen}
        onClose={() => setComposerOpen(false)}
        onCreated={() => {
          setComposerOpen(false);
          feed.reload();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, gap: spacing.sectionPadding },

  welcome: { gap: 4 },

  reads: { gap: 12 },
  readsHeader: { gap: 2 },
  readsTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sourceRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  sourceCard: {
    width: 260,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(21,42,74,0.06)',
    gap: 8,
    ...shadows.card,
  },
  sourceCardPressed: { opacity: 0.85 },
  sourceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  sourceBadgeText: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sourceTitle: {
    fontFamily: fonts.title,
    fontSize: 15,
    lineHeight: 21,
  },
  sourceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sourceSkeleton: {
    width: 260,
    height: 150,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceContainerHigh,
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
    minHeight: 36,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },

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
    minHeight: 44,
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

  footerLoading: { paddingVertical: 16, alignItems: 'center' },
  loadMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 14,
    minHeight: 48,
  },
  retryMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    minHeight: 48,
  },
});