import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  ViewProps,
} from 'react-native';
import TopAppBar from '../../components/TopAppBar';
import ThemedText from '../../components/ThemedText';
import Icon, { IconName } from '../../components/Icon';
import { colors } from '../../theme/colors';
import { radii, shadows, spacing } from '../../theme';
import { rgba } from '../../utils/color';
import { useCategories } from '../../hooks/useData';
import { ExploreCategory } from '../../types';

type CategoryCardProps = ExploreCategory & {
  onPress?: () => void;
  onJoinPress?: () => void;
  style?: ViewProps['style'];
};

function CategoryCard({
  icon,
  iconColor,
  iconBg,
  label,
  labelColor,
  labelBorder,
  title,
  subtitle,
  members,
  badge,
  height,
  image,
  dark = false,
  simple = false,
  onPress,
  onJoinPress,
  style,
}: CategoryCardProps) {
  const textOn = dark ? colors.surface : colors.onSurface;
  const textMuted = dark ? colors.primaryFixed : colors.onSurfaceVariant;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.categoryCard,
        { height },
        style,
        pressed && { transform: [{ scale: 0.99 }] },
      ]}
    >
      {image ? (
        <>
          <Image source={{ uri: image }} style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={
              dark
                ? [rgba(colors.primary, 0.95), rgba(colors.primary, 0.5), 'transparent']
                : [rgba(colors.primary, 0.85), rgba(colors.primary, 0.4)]
            }
            style={StyleSheet.absoluteFill}
          />
        </>
      ) : (
        <LinearGradient
          colors={
            dark
              ? [colors.primary, rgba(colors.primary, 0.6)]
              : [colors.surface, colors.surfaceContainer]
          }
          style={StyleSheet.absoluteFill}
        />
      )}

      <View style={styles.cardTop}>
        {simple ? (
          <View style={[styles.iconBlock, { backgroundColor: iconBg }]}>
            <Icon name={icon} size={26} color={iconColor} variant="solid" />
          </View>
        ) : (
          <View
            style={[
              styles.labelPill,
              {
                backgroundColor: dark
                  ? 'rgba(255,255,255,0.15)'
                  : colors.surface,
                borderColor: labelBorder,
              },
            ]}
          >
            <Icon name={icon} size={16} color={labelColor} variant="solid" />
            <ThemedText variant="labelSm" color={labelColor}>
              {label}
            </ThemedText>
          </View>
        )}
        {badge && (
          <Pressable style={styles.joinBtn} onPress={onJoinPress}>
            <ThemedText variant="labelSm" color={colors.onSecondaryContainer}>
              Join Network
            </ThemedText>
            <Icon name="arrow-right" size={16} color={colors.onSecondaryContainer} />
          </Pressable>
        )}
      </View>

      <View>
        <ThemedText variant="headline" color={textOn}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText variant="labelSm" color={textMuted}>
            {subtitle}
          </ThemedText>
        )}
        <View style={[styles.memberRow, { marginTop: 8 }]}>
          <View style={[styles.memberChip, !dark && styles.memberChipLight]}>
            <Icon name="user-group" size={14} color={textOn} variant="solid" />
            <ThemedText variant="labelSm" color={textOn} style={{ fontSize: 12 }}>
              {members}
            </ThemedText>
          </View>
          {badge ? (
            <View style={[styles.badgeChip, !dark && styles.memberChipLight]}>
              <Icon name="star" size={14} color={textOn} variant="solid" />
              <ThemedText variant="labelSm" color={textOn} style={{ fontSize: 12 }}>
                {badge}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const { data: categories } = useCategories();
  const [query, setQuery] = useState('');
  const all = categories ?? [];
  const list = useMemo(() => {
    if (!query.trim()) return all;
    const q = query.trim().toLowerCase();
    return all.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.label.toLowerCase().includes(q) ||
        c.members.toLowerCase().includes(q),
    );
  }, [all, query]);

  const first = list[0];
  const rest = list.slice(1);

  const handleJoin = (title: string) => {
    Alert.alert('Join Network', `Request to join the ${title} network.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Join', onPress: () => Alert.alert('Request Sent', `Your request to join ${title} was submitted.`) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <TopAppBar
        leftIcon="map-pin"
        title="SokoCircle"
        actions={[{ icon: 'bell' }]}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <ThemedText variant="displayLg" color={colors.primary} style={{ fontSize: 32 }}>
            Market Ecosystem
          </ThemedText>
          <ThemedText variant="bodyLg" color={colors.onSurfaceVariant}>
            Discover and connect with verified MSME networks across regions.
          </ThemedText>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Icon name="magnifying-glass" size={22} color={colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories or counties..."
            placeholderTextColor={colors.outline}
            autoCorrect={false}
            value={query}
            onChangeText={setQuery}
          />
          <Pressable
            style={styles.tuneBtn}
            hitSlop={8}
            onPress={() =>
              Alert.alert('Filters', 'Advanced filters are coming soon. Try searching for a category or county.')
            }
          >
            <Icon name="funnel" size={18} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>

        {/* Bento grid */}
        <View style={styles.bento}>
          {list.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="magnifying-glass" size={36} color={colors.outlineVariant} />
              <ThemedText variant="bodyMd" color={colors.outline} style={{ marginTop: 8 }}>
                No categories match "{query}". Try a different search.
              </ThemedText>
            </View>
          ) : (<>
          {first && (
            <CategoryCard
              key={first.id}
              {...first}
              height={320}
              onPress={() => handleJoin(first.title)}
              onJoinPress={() => handleJoin(first.title)}
            />
          )}

          {rest.length > 0 && (
            <>
              {/* Small row pair */}
              <View style={styles.smallRow}>
                <CategoryCard
                  key={rest[0].id}
                  {...rest[0]}
                  simple
                  height={210}
                  style={styles.cardHalf}
                  onPress={() => handleJoin(rest[0].title)}
                />
                {rest[1] && (
                  <CategoryCard
                    key={rest[1].id}
                    {...rest[1]}
                    simple
                    height={210}
                    style={styles.cardHalf}
                    onPress={() => handleJoin(rest[1].title)}
                  />
                )}
              </View>

              {/* Medium cards */}
              {rest.slice(2).map((c) => (
                <CategoryCard
                  key={c.id}
                  {...c}
                  height={200}
                  onPress={() => handleJoin(c.title)}
                />
              ))}
            </>
          )}
          </>)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.marginMobile, paddingBottom: 120, gap: 20 },

  pageHeader: { gap: 8, marginTop: 4 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.onSurface,
    marginRight: 12,
  },
  tuneBtn: {
    backgroundColor: colors.surfaceContainer,
    padding: 8,
    borderRadius: 999,
  },

  bento: { flexDirection: 'column', gap: 16 },

  categoryCard: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 24,
    justifyContent: 'space-between',
    ...shadows.card,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconBlock: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  memberRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(251,249,244,0.12)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  memberChipLight: {
    backgroundColor: colors.surface,
    borderColor: colors.outlineVariant,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(251,249,244,0.12)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  smallRow: { flexDirection: 'row', gap: 16 },
  cardHalf: { flex: 1 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 4,
  },
});