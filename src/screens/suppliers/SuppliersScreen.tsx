import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TopAppBar from '../../components/TopAppBar';
import ThemedText from '../../components/ThemedText';
import Icon, { IconName } from '../../components/Icon';
import { colors } from '../../theme/colors';
import { radii, shadows, spacing } from '../../theme';
import { rgba } from '../../utils/color';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { useCategories, useSuppliers } from '../../hooks/useData';
import { COUNTY_NAMES } from '../../lib/locations';
import type { RootStackParamList, TabParamList } from '../../navigation/types';

const ALL_CATEGORIES = 'All Categories';
const ALL_COUNTIES = 'All Counties';
const SORTS = ['Featured', 'Rating: High to Low', 'Rating: Low to Low'] as const;
type Sort = (typeof SORTS)[number];

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

type ChipProps = {
  label: string;
  icon?: IconName;
  active?: boolean;
  accessibilityLabel?: string;
  onPress?: () => void;
};

function Chip({ label, icon, active, accessibilityLabel, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: !!active }}
      style={[styles.chip, active && styles.chipActive]}
    >
      {icon && (
        <Icon
          name={icon}
          size={16}
          color={active ? colors.onPrimaryContainer : colors.onSurfaceVariant}
          variant="solid"
        />
      )}
      <ThemedText
        variant="labelSm"
        color={active ? colors.onPrimaryContainer : colors.onSurfaceVariant}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

type SupplierCardProps = {
  name: string;
  category: string;
  rating?: string;
  new?: boolean;
  verifiedDate: string;
  description: string;
  price: string;
  image?: string;
};

function SupplierCard({
  name,
  category,
  rating,
  new: isNew,
  verifiedDate,
  description,
  price,
  image,
}: SupplierCardProps) {
  return (
    <View style={styles.supplierCard}>
      <View style={styles.supplierMedia}>
        {image ? (
          <Image source={{ uri: image }} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.supplierMediaPlaceholder]}>
            <Icon
              name="cpu-chip"
              size={48}
              color={rgba(colors.outlineVariant, 0.5)}
              variant="outline"
            />
          </View>
        )}
        <View style={styles.supplierCategoryChip}>
          <Icon name="squares-2x2" size={14} color={colors.primary} variant="solid" />
          <ThemedText variant="labelSm" color={colors.primary} style={{ fontSize: 11 }}>
            {category}
          </ThemedText>
        </View>
      </View>

      <View style={styles.supplierBody}>
        <View style={styles.supplierTitleRow}>
          <ThemedText variant="titleMd" color={colors.primary} numberOfLines={1} style={{ flex: 1 }}>
            {name}
          </ThemedText>
          {isNew ? (
            <View style={styles.newBadge}>
              <Icon name="sparkles" size={16} color={colors.outline} variant="solid" />
              <ThemedText variant="labelSm" color={colors.outline} style={{ fontSize: 12 }}>
                New
              </ThemedText>
            </View>
          ) : (
            <View style={styles.ratingRow}>
              <Icon name="star" size={16} color={colors.secondary} variant="solid" />
              <ThemedText variant="labelSm" color={colors.secondary} style={{ fontSize: 13 }}>
                {rating}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          <Icon name="check-badge" size={16} color={colors.onTertiaryContainer} variant="solid" />
          <ThemedText variant="labelSm" color={colors.onTertiaryContainer} style={{ fontSize: 12 }}>
            Verified {verifiedDate}
          </ThemedText>
        </View>

        <ThemedText
          variant="bodyMd"
          color={colors.onSurfaceVariant}
          style={{ fontSize: 14, marginBottom: 16 }}
        >
          {description}
        </ThemedText>

        <View style={styles.supplierFoot}>
          <ThemedText variant="labelSm" color={colors.primary}>
            {price}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

export default function SuppliersScreen() {
  const navigation = useNavigation<Nav>();
  const { data: categories } = useCategories();
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [county, setCounty] = useState(ALL_COUNTIES);
  const [sort, setSort] = useState<Sort>('Featured');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => [ALL_CATEGORIES, ...(categories ?? []).map((c) => c.title)],
    [categories],
  );
  const countyOptions = useMemo(() => [ALL_COUNTIES, ...COUNTY_NAMES], []);

  const {
    data: suppliersData,
    loading,
    error,
    reload,
  } = useSuppliers({
    category: category === ALL_CATEGORIES ? null : category,
    county: county === ALL_COUNTIES ? null : county,
  });

  const featured = suppliersData?.featured ?? null;
  const list = useMemo(() => {
    const items = suppliersData?.list ?? [];
    if (sort === 'Rating: High to Low') {
      return [...items].sort(
        (a, b) => (parseFloat(b.rating ?? '') || 0) - (parseFloat(a.rating ?? '') || 0),
      );
    }
    if (sort === 'Rating: Low to Low') {
      return [...items].sort(
        (a, b) => (parseFloat(a.rating ?? '') || 0) - (parseFloat(b.rating ?? '') || 0),
      );
    }
    return [...items].sort(
      (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false),
    );
  }, [suppliersData, sort]);

  const insights = useMemo(() => {
    const all = [...(suppliersData?.list ?? []), ...(featured ? [featured] : [])];
    const rated = all.filter((s) => typeof s.rating === 'string' && s.rating.length > 0);
    const avgRating =
      rated.length > 0
        ? rated.reduce((sum, s) => sum + (parseFloat(s.rating ?? '') || 0), 0) / rated.length
        : null;
    const counties = new Set(
      all.map((s) => s.location?.split(',')[0]?.trim()).filter((v): v is string => !!v),
    );
    return {
      total: all.length,
      verified: all.filter((s) => s.verified).length,
      avgRating,
      counties: counties.size,
    };
  }, [suppliersData, featured]);

  const filtersActive =
    category !== ALL_CATEGORIES || county !== ALL_COUNTIES || sort !== 'Featured';

  const pickCategory = (value: string) => {
    setCategory(value);
    setOpenMenu(null);
  };
  const pickCounty = (value: string) => {
    setCounty(value);
    setOpenMenu(null);
  };
  const pickSort = (value: string) => {
    setSort(value as Sort);
    setOpenMenu(null);
  };
  const resetFilters = () => {
    setCategory(ALL_CATEGORIES);
    setCounty(ALL_COUNTIES);
    setSort('Featured');
    setOpenMenu(null);
  };

  const renderMenu = (
    id: string,
    options: readonly string[],
    current: string,
    onSelect: (v: string) => void,
  ) =>
    openMenu === id && (
      <View style={styles.filterMenu}>
        {options.map((opt) => (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt)}
            accessibilityRole="menuitem"
            accessibilityState={{ selected: opt === current }}
            style={[styles.filterItem, opt === current && styles.filterItemActive]}
          >
<ThemedText
                variant="bodyMd"
                color={opt === current ? colors.primary : colors.onSurface}
                style={{ fontSize: 14 }}
              >
              {opt}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    );

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
      >
        {/* Header */}
        <View>
          <ThemedText variant="displayLg" color={colors.primary}>
            Verified Suppliers
          </ThemedText>
          <ThemedText variant="bodyLg" color={colors.onSurfaceVariant} style={{ marginTop: 4 }}>
            Connect with trusted MSMEs across the ecosystem.
          </ThemedText>
        </View>

        {/* Chips */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            <Chip
              label={category}
              active
              accessibilityLabel={`Category: ${category}`}
              onPress={() => setOpenMenu(openMenu === 'category' ? null : 'category')}
            />
            <Chip
              label={county}
              icon="map-pin"
              accessibilityLabel={`County: ${county}`}
              onPress={() => setOpenMenu(openMenu === 'county' ? null : 'county')}
            />
            <Chip
              label={sort}
              icon="arrows-up-down"
              accessibilityLabel={`Sort: ${sort}`}
              onPress={() => setOpenMenu(openMenu === 'sort' ? null : 'sort')}
            />
            {filtersActive && <Chip label="Reset" onPress={resetFilters} />}
          </ScrollView>
          {renderMenu('category', categoryOptions, category, pickCategory)}
          {renderMenu('county', countyOptions, county, pickCounty)}
          {renderMenu('sort', SORTS, sort, pickSort)}
        </View>

        {/* Featured supplier */}
        {featured && (
          <View style={styles.featuredCard}>
            {featured.image && (
              <View style={StyleSheet.absoluteFill}>
                <Image
                  source={{ uri: featured.image }}
                  style={[StyleSheet.absoluteFill, { opacity: 0.25 }]}
                />
              </View>
            )}
            <LinearGradient
              colors={[rgba(colors.surface, 0.6), 'rgba(251,249,244,0.02)']}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <View style={styles.featuredBadge}>
                <Icon name="sparkles" size={16} color={colors.onTertiaryContainer} variant="solid" />
                <ThemedText variant="labelSm" color={colors.onTertiaryContainer}>
                  Featured Enterprise
                </ThemedText>
              </View>
              <ThemedText variant="headline" color={colors.primary} style={{ marginTop: 12 }}>
                {featured.name}
              </ThemedText>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="map-pin" size={16} color={colors.onSurfaceVariant} />
                  <ThemedText variant="labelSm" color={colors.onSurfaceVariant}>
                    {featured.location ?? 'Kenya'}
                  </ThemedText>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="check-circle" size={16} color={colors.onTertiaryContainer} variant="solid" />
                  <ThemedText variant="labelSm" color={colors.onTertiaryContainer}>
                    Verified since {featured.verifiedDate}
                  </ThemedText>
                </View>
              </View>
              <ThemedText
                variant="bodyMd"
                color={colors.onSurfaceVariant}
                style={{ marginTop: 12, maxWidth: 480 }}
              >
                {featured.description}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Market insights */}
        <View style={styles.insightsCard}>
          <ThemedText variant="titleMd" color={colors.primary} style={styles.insightsTitle}>
            <Icon name="arrow-trending-up" size={20} color={colors.secondary} variant="solid" />  Market Insights
          </ThemedText>
          <View style={styles.insightRow}>
            <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
              Suppliers in view
            </ThemedText>
            <ThemedText variant="titleMd" color={colors.primary}>
              {insights.total}
            </ThemedText>
          </View>
          <View style={styles.insightRow}>
            <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
              Verified Partners
            </ThemedText>
            <ThemedText variant="titleMd" color={colors.onTertiaryContainer}>
              {insights.verified}
            </ThemedText>
          </View>
          <View style={styles.insightRow}>
            <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
              Average Rating
            </ThemedText>
            <ThemedText variant="titleMd" color={colors.primary}>
              {insights.avgRating === null ? 'Not rated yet' : insights.avgRating.toFixed(1)}
            </ThemedText>
          </View>
          <View style={styles.insightRow}>
            <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
              Counties Covered
            </ThemedText>
            <ThemedText variant="titleMd" color={colors.primary}>
              {insights.counties}
            </ThemedText>
          </View>

          <View style={styles.gapMapLink}>
            <ThemedText variant="labelSm" color={colors.onSurfaceVariant}>
              Looking for bespoke logistics?
            </ThemedText>
            <Pressable
              style={styles.gapMapLinkBtn}
              accessibilityRole="link"
              accessibilityLabel="Open the Gap Map tab"
              hitSlop={8}
              onPress={() => navigation.navigate('GapMap')}
            >
              <ThemedText variant="labelSm" color={colors.primary}>
                Explore Gap Map
              </ThemedText>
              <Icon name="arrow-up-right" size={16} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Supplier cards */}
        <View style={{ gap: 16 }}>
          {loading && (suppliersData?.list.length ?? 0) === 0 ? (
            <EmptyState
              compact
              icon="cube"
              title="Loading suppliers…"
              message="Fetching verified enterprises from the directory."
            />
          ) : error ? (
            <ErrorState
              title="Couldn't load suppliers"
              error={error}
              onRetry={reload}
            />
          ) : list.length === 0 ? (
            <EmptyState
              icon="cube"
              title="No suppliers match your filters"
              message="Try a different category or county, or reset the filters to see the full directory."
            />
          ) : (
            list.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                name={supplier.name}
                category={supplier.category}
                rating={supplier.rating}
                new={supplier.isNew}
                verifiedDate={supplier.verifiedDate}
                description={supplier.description}
                price={supplier.price}
                image={supplier.image}
              />
            ))
          )}
        </View>

        {/* Become a supplier */}
        <View style={styles.ctaCard}>
          <LinearGradient
            colors={[colors.primary, colors.primary]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.ctaBlob, styles.ctaBlob1]} />
          <View style={[styles.ctaBlob, styles.ctaBlob2]} />
          <View style={{ flex: 1, padding: 28, justifyContent: 'center' }}>
            <ThemedText variant="headline" color={colors.onPrimary} style={styles.ctaTitle}>
              Grow Your Enterprise with SokoCircle
            </ThemedText>
            <ThemedText variant="bodyLg" color={colors.primaryFixedDim} style={{ marginTop: 12 }}>
              Supplier onboarding opens once verification reviews are live. Every
              enterprise in the directory is vetted before it appears here.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.marginMobile, paddingBottom: 120, gap: 20 },

  chipRow: { gap: 12, paddingVertical: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: rgba(colors.outlineVariant, 0.4),
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
    borderWidth: 0,
  },

  filterMenu: {
    position: 'absolute',
    top: 48,
    left: 0,
    alignSelf: 'flex-start',
    minWidth: 220,
    marginTop: 8,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
    zIndex: 50,
    elevation: 4,
    shadowColor: '#152a4a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterItemActive: {
    backgroundColor: colors.surfaceContainer,
  },

  featuredCard: {
    borderRadius: radii.xl,
    padding: spacing.sectionPadding,
    minHeight: 320,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    ...shadows.card,
    gap: 4,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.tertiaryContainer,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },

  insightsCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.xl,
    padding: spacing.sectionPadding,
    borderWidth: 1,
    borderColor: rgba(colors.outlineVariant, 0.2),
    gap: 16,
  },
  insightsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: rgba(colors.outlineVariant, 0.1),
    paddingBottom: 8,
  },
  gapMapLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },  gapMapLink: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.surfaceBright,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: rgba(colors.primary, 0.1),
    gap: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  supplierCard: {
    backgroundColor: 'rgba(251,249,244,0.7)',
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  supplierMedia: {
    height: 192,
    width: '100%',
  },
  supplierMediaPlaceholder: {
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supplierCategoryChip: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251,249,244,0.9)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: rgba(colors.outlineVariant, 0.2),
  },
  supplierBody: {
    padding: 20,
  },
  supplierTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  supplierFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: rgba(colors.outlineVariant, 0.1),
    paddingTop: 14,
  },


  ctaCard: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    ...shadows.card,
  },
  ctaBlob: {
    position: 'absolute',
    borderRadius: 999,
  },
  ctaBlob1: {
    right: -96,
    top: -96,
    width: 256,
    height: 256,
    backgroundColor: colors.secondary,
    opacity: 0.2,
  },
  ctaBlob2: {
    left: -48,
    bottom: -48,
    width: 192,
    height: 192,
    backgroundColor: colors.tertiaryFixed,
    opacity: 0.1,
  },
  ctaTitle: { fontSize: 28, maxWidth: 320 },
});