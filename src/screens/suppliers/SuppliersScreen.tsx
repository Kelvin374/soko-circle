import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import TopAppBar from '../../components/TopAppBar';
import ThemedText from '../../components/ThemedText';
import Icon, { IconName } from '../../components/Icon';
import { colors } from '../../theme/colors';
import { radii, shadows, spacing } from '../../theme';
import { rgba } from '../../utils/color';
import { useSuppliers } from '../../hooks/useData';

const CATEGORIES = ['All Verified', 'Agriculture', 'Textiles', 'Tech Hardware', 'FMCG Food'];
const COUNTIES = ['All Counties', 'Nairobi', 'Nakuru', 'Mombasa', 'Kiambu'];
const SORTS = ['Featured', 'Rating: High to Low', 'Rating: Low to High'];

type ChipProps = {
  label: string;
  icon?: IconName;
  active?: boolean;
  onPress?: () => void;
};

function Chip({ label, icon, active, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
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
  const handleContact = () => {
    Alert.alert('Contact Supplier', `Send an inquiry to ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Send',
        onPress: () => Alert.alert('Inquiry Sent', `Your inquiry to ${name} was sent. They typically reply within 24 hours.`),
      },
    ]);
  };

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
          <Pressable style={styles.sendBtn} hitSlop={8} onPress={handleContact}>
            <Icon name="paper-airplane" size={20} color={colors.primary} variant="solid" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function SuppliersScreen() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [county, setCounty] = useState(COUNTIES[0]);
  const [sort, setSort] = useState(SORTS[0]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { data: suppliersData } = useSuppliers();
  const featured = suppliersData?.featured;
  const list = useMemo(() => {
    let items = suppliersData?.list ?? [];
    if (category !== CATEGORIES[0]) {
      items = items.filter((s) => s.category === category);
    }
    if (county !== COUNTIES[0]) {
      items = items.filter((s) => s.location === county);
    }
    if (sort === 'Rating: High to Low') {
      items = [...items].sort((a, b) => parseFloat(b.rating ?? '0') - parseFloat(a.rating ?? '0'));
    } else if (sort === 'Rating: Low to High') {
      items = [...items].sort((a, b) => parseFloat(a.rating ?? '0') - parseFloat(b.rating ?? '0'));
    } else {
      items = [...items].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
    }
    return items;
  }, [suppliersData, category, county, sort]);

  useEffect(() => {
    setOpenMenu(null);
  }, [category, county, sort]);

  const renderMenu = (id: string, options: string[], onSelect: (v: string) => void) =>
    openMenu === id && (
      <View style={styles.filterMenu}>
        {options.map((opt) => (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt)}
            style={[
              styles.filterItem,
              ((id === 'category' && opt === category) ||
                (id === 'county' && opt === county) ||
                (id === 'sort' && opt === sort)) &&
                styles.filterItemActive,
            ]}
          >
            <ThemedText
              variant="bodyMd"
              color={
                (id === 'category' && opt === category) ||
                (id === 'county' && opt === county) ||
                (id === 'sort' && opt === sort)
                  ? colors.primary
                  : colors.onSurface
              }
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
            <Chip label={category} active onPress={() => setOpenMenu(openMenu === 'category' ? null : 'category')} />
            <Chip label={county} icon="map-pin" onPress={() => setOpenMenu(openMenu === 'county' ? null : 'county')} />
            <Chip label={sort} icon="arrows-up-down" onPress={() => setOpenMenu(openMenu === 'sort' ? null : 'sort')} />
            {(category !== CATEGORIES[0] || county !== COUNTIES[0] || sort !== SORTS[0]) && (
              <Chip label="Reset" onPress={() => {
                setCategory(CATEGORIES[0]);
                setCounty(COUNTIES[0]);
                setSort(SORTS[0]);
              }} />
            )}
          </ScrollView>
          {renderMenu('category', CATEGORIES, setCategory)}
          {renderMenu('county', COUNTIES, setCounty)}
          {renderMenu('sort', SORTS, setSort)}
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
              <Pressable
                style={styles.quoteBtn}
                onPress={() =>
                  Alert.alert('Request Quote', `Send a quote request to ${featured.name}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Send',
                      onPress: () => Alert.alert('Request Sent', 'The supplier was notified of your quote request.'),
                    },
                  ])
                }
              >
                <ThemedText variant="labelSm" color={colors.onPrimary}>
                  Request Quote
                </ThemedText>
                <Icon name="arrow-right" size={18} color={colors.onPrimary} />
              </Pressable>
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
              Avg. Order Value
            </ThemedText>
            <ThemedText variant="titleMd" color={colors.primary}>
              Ksh 45k - 120k
            </ThemedText>
          </View>
          <View style={styles.insightRow}>
            <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
              Fulfillment Rate
            </ThemedText>
            <ThemedText variant="titleMd" color={colors.onTertiaryContainer}>
              98.4%
            </ThemedText>
          </View>
          <View style={styles.insightRow}>
            <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
              Verified Partners
            </ThemedText>
            <ThemedText variant="titleMd" color={colors.primary}>
              142
            </ThemedText>
          </View>

          <View style={styles.gapMapLink}>
            <ThemedText variant="labelSm" color={colors.onSurfaceVariant}>
              Looking for bespoke logistics?
            </ThemedText>
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              onPress={() => Alert.alert('Gap Map', 'Open the Gap Map tab to explore market intelligence for logistics.')}
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
          {list.length === 0 ? (
            <View style={styles.emptyList}>
              <Icon name="cube" size={36} color={colors.outlineVariant} />
              <ThemedText variant="bodyMd" color={colors.outline} style={{ textAlign: 'center' }}>
                No suppliers match your filters. Try a different category or county.
              </ThemedText>
            </View>
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

        {/* Become a supplier CTA */}
        <Pressable style={styles.ctaCard} onPress={() => Alert.alert('Become a Supplier', 'Opening the supplier onboarding form.')}>
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
            <ThemedText variant="bodyLg" color={colors.primaryFixedDim} style={{ marginTop: 12, marginBottom: 24 }}>
              Join our curated directory of verified MSMEs. Access institutional
              buyers, secure transparent quotes, and build trust across borders.
            </ThemedText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <Pressable style={styles.ctaPrimaryBtn} onPress={() => Alert.alert('Become a Supplier', 'Opening the supplier onboarding form.')}>
                <ThemedText variant="labelSm" color={colors.onSecondaryContainer} style={{ fontWeight: '700' }}>
                  Become a Supplier
                </ThemedText>
                <Icon name="rocket-launch" size={18} color={colors.onSecondaryContainer} variant="solid" />
              </Pressable>
              <Pressable style={styles.ctaOutlineBtn} onPress={() => Alert.alert('Supplier Requirements', 'View the KYC and compliance requirements to join the directory.')}>
                <ThemedText variant="labelSm" color={colors.onPrimary}>
                  View Requirements
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </Pressable>
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
  chipLabelActive: { color: colors.onPrimaryContainer },

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
  quoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radii.md,
    marginTop: 20,
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
  gapMapLink: {
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
  sendBtn: {
    backgroundColor: colors.surfaceContainerHigh,
    padding: 8,
    borderRadius: 999,
  },

  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
    paddingHorizontal: 24,
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
  ctaPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radii.md,
  },
  ctaOutlineBtn: {
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radii.md,
  },
});