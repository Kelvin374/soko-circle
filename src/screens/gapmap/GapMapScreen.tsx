import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import TopAppBar from '../../components/TopAppBar';
import ThemedText from '../../components/ThemedText';
import Icon from '../../components/Icon';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../theme/colors';
import { radii, shadows, spacing } from '../../theme';
import { rgba } from '../../utils/color';
import { useAnalytics, useCategories, useGapReports, useProfile } from '../../hooks/useData';
import { COUNTY_NAMES, POPULAR_WARDS } from '../../lib/locations';
import { formatKsh } from '../../lib/format';
import { GapReport } from '../../types';

const TOPO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCUYG67f8lTVhR53Yovg5IZu6ZaNAEbCFqbRpPVXvVt10NAiSMDO6RSQOZJY6Sr1F6APzKPy2hSw1jM-TyqwWFp7knaznJnCkzKSxVlDJ9xs_9ggLmHrbc1sd48-8ab20KIx1aOxwyYDzNIXtP8lOcSWT-TUvCJBv8k2ryvPxhHlfzv_j-FUD9hKQH0IAmIQLB1qec2iHlWsdyj1shm1LhdmniWn3gNnb3DTgaCJmmOV1NtuBGJNX8T';

const LOCATION_OPTIONS = [
  ...POPULAR_WARDS.map((w) => `${w.ward}, ${w.county}`),
  ...COUNTY_NAMES,
];

type SelectProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
};

function Select({ label, options, value, onChange, disabled }: SelectProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <ThemedText
        variant="labelSm"
        color={colors.onSurfaceVariant}
        style={{ marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}
      >
        {label}
      </ThemedText>
      <Pressable
        onPress={() => !disabled && options.length > 0 && setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || 'none selected'}`}
        accessibilityState={{ disabled: !!disabled || options.length === 0, expanded: open }}
        style={[styles.selectInput, disabled && styles.selectInputDisabled]}
      >
        <ThemedText variant="bodyMd" color={colors.onSurface} numberOfLines={1}>
          {value || 'None'}
        </ThemedText>
        <Icon name="chevron-down" size={20} color={colors.outline} />
      </Pressable>
      {open && (
        <View style={styles.selectMenu}>
          {options.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={[
                styles.selectItem,
                opt === value && styles.selectItemActive,
              ]}
            >
              <ThemedText
                variant="bodyMd"
                color={opt === value ? colors.primary : colors.onSurface}
              >
                {opt}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function StatBar({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
}) {
  return (
    <View>
      <View style={styles.statRow}>
        <ThemedText variant="labelSm" color={colors.onSurface}>
          {label}
        </ThemedText>
        <ThemedText variant="labelSm" color={color} style={{ fontWeight: '700' }}>
          {value}
        </ThemedText>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.max(0, Math.min(100, pct))}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

export default function GapMapScreen() {
  const { data: profile } = useProfile();
  const { data: categories } = useCategories();

  const categoryOptions = useMemo(
    () => (categories ?? []).map((c) => c.title),
    [categories],
  );

  const [locationChoice, setLocationChoice] = useState<string | null>(null);
  const [categoryChoice, setCategoryChoice] = useState<string | null>(null);
  const [capital, setCapital] = useState('500000');
  const [overhead, setOverhead] = useState('45000');
  const [revenue, setRevenue] = useState('130000');

  const location = locationChoice ?? profile?.location ?? 'Nairobi';
  const category = categoryChoice ?? categoryOptions[0] ?? '';

  const {
    data: analytics,
    loading: analyticsLoading,
    error: analyticsError,
    reload: reloadAnalytics,
  } = useAnalytics(category || '__none__', location);

  const {
    data: reports,
    loading: reportsLoading,
    error: reportsError,
    reload: reloadReports,
  } = useGapReports(category || null);

  const capitalN = parseFloat(capital) || 0;
  const overheadN = parseFloat(overhead) || 0;
  const revenueN = parseFloat(revenue) || 0;
  const monthlyProfit = revenueN - overheadN;
  const breakEvenMonths =
    monthlyProfit > 0 && capitalN > 0
      ? Math.max(1, Math.ceil(capitalN / monthlyProfit))
      : null;

  const hasCategory = categoryOptions.length > 0;

  const renderReport = (report: GapReport) => (
    <View key={report.id} style={styles.reportCard}>
      <View style={styles.reportBody}>
        <View style={styles.reportTagRow}>
          <View style={styles.reportTag}>
            <ThemedText
              variant="labelSm"
              color={colors.onSurfaceVariant}
              style={{ fontSize: 11, textTransform: 'uppercase' }}
            >
              {report.tag}
            </ThemedText>
          </View>
          {report.isUnlocked ? (
            <View style={styles.unlockedChip}>
              <Icon name="check-badge" size={14} color={colors.onTertiaryContainer} variant="solid" />
              <ThemedText variant="labelSm" color={colors.onTertiaryContainer}>
                Unlocked
              </ThemedText>
            </View>
          ) : (
            <Icon name={report.icon} size={20} color={colors.outline} />
          )}
        </View>
        <ThemedText variant="titleMd" color={colors.primary}>
          {report.title}
        </ThemedText>
        <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
          {report.description}
        </ThemedText>
        <ThemedText variant="labelSm" color={colors.secondary} style={{ marginTop: 8 }}>
          {report.isUnlocked
            ? 'Included in your intelligence assets'
            : `${formatKsh(report.price)} · ${report.location}`}
        </ThemedText>
      </View>
      <View style={styles.reportPreview}>
        {report.previewImageUrl ? (
          <Image source={{ uri: report.previewImageUrl }} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={styles.blurredContent}>
            <View style={[styles.shimmerBar, { width: '75%' }]} />
            <View style={[styles.shimmerBar, { width: '50%' }]} />
            <View style={[styles.shimmerBlock, { flex: 1 }]} />
          </View>
        )}
        {!report.isUnlocked && (
          <View style={styles.lockOverlay}>
            <View style={styles.lockIconWrap}>
              <Icon name="lock-closed" size={22} color={colors.secondary} variant="solid" />
            </View>
            <ThemedText variant="labelSm" color={colors.onSurface} style={{ marginVertical: 12 }}>
              Premium Intelligence Data
            </ThemedText>
            <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
              Unlocking is handled at checkout.
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <TopAppBar leftIcon="map-pin" title="SokoCircle" actions={[{ icon: 'bell' }]} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Market Intelligence selector */}
        <View style={styles.selectorCard}>
          <Image
            source={{ uri: TOPO_IMG }}
            style={[
              StyleSheet.absoluteFill,
              { opacity: 0.12, borderRadius: radii.xl },
            ]}
          />
          <View style={{ gap: 6 }}>
            <ThemedText variant="titleMd" color={colors.primary}>
              Market Intelligence
            </ThemedText>
            <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
              Analyze demand and saturation to find your next opportunity.
            </ThemedText>
          </View>

          <View style={styles.selectRow}>
            <Select
              label="Category"
              options={categoryOptions}
              value={category}
              onChange={setCategoryChoice}
              disabled={!hasCategory}
            />
            <Select label="Location" options={LOCATION_OPTIONS} value={location} onChange={setLocationChoice} />
          </View>

          <Pressable
            style={[
              styles.analyzeBtn,
              (!hasCategory || analyticsLoading) && styles.analyzeBtnDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Analyze gap"
            accessibilityState={{ disabled: !hasCategory || analyticsLoading, busy: analyticsLoading }}
            disabled={!hasCategory || analyticsLoading}
            onPress={reloadAnalytics}
          >
            <Icon name="magnifying-glass" size={18} color={colors.onPrimary} />
            <ThemedText variant="labelSm" color={colors.onPrimary}>
              {analyticsLoading ? 'Analyzing…' : 'Analyze Gap'}
            </ThemedText>
          </Pressable>
        </View>

        {/* Analytics */}
        <View style={styles.oppCard}>
          <View style={styles.oppHeader}>
            <View style={{ gap: 2, flex: 1 }}>
              <ThemedText variant="titleMd" color={colors.primary}>
                Opportunity Score
              </ThemedText>
              <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
                {category || 'No category'} in {location}
              </ThemedText>
            </View>
          </View>

          {!hasCategory ? (
            <EmptyState
              compact
              icon="squares-2x2"
              title="No categories published yet"
              message="Opportunity scores appear once a category network is live."
            />
          ) : analyticsError ? (
            <ErrorState
              title="Couldn't load the analysis"
              error={analyticsError}
              onRetry={reloadAnalytics}
            />
          ) : !analytics ? (
            <EmptyState
              compact
              icon="chart-bar"
              title="No data for this selection yet"
              message={`We have no demand or saturation figures for ${category} in ${location}. Try another location.`}
            />
          ) : (
            <View style={{ gap: 24 }}>
              <StatBar
                label="Consumer Demand"
                value={analytics.demandLabel}
                pct={analytics.consumerDemandPct}
                color={analytics.demandColor}
              />
              <StatBar
                label="Market Saturation"
                value={analytics.saturationLabel}
                pct={analytics.marketSaturationPct}
                color={analytics.saturationColor}
              />
            </View>
          )}
        </View>

        {/* Break-even estimator */}
        <View style={styles.estimatorCard}>
          <ThemedText variant="titleMd" color={colors.primary}>
            Break-even Estimator
          </ThemedText>
          <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
            Quick feasibility check
          </ThemedText>

          <View style={{ gap: 12, marginTop: 4 }}>
            <View>
              <ThemedText
                variant="labelSm"
                color={colors.onSurfaceVariant}
                style={{ marginBottom: 4 }}
              >
                Initial Capital (KSh)
              </ThemedText>
              <TextInput
                style={styles.estimatorInput}
                value={capital}
                onChangeText={(t) => setCapital(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.outline}
                accessibilityLabel="Initial capital in Kenyan shillings"
              />
            </View>
            <View>
              <ThemedText
                variant="labelSm"
                color={colors.onSurfaceVariant}
                style={{ marginBottom: 4 }}
              >
                Avg. Monthly Overhead
              </ThemedText>
              <TextInput
                style={styles.estimatorInput}
                value={overhead}
                onChangeText={(t) => setOverhead(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.outline}
                accessibilityLabel="Average monthly overhead in Kenyan shillings"
              />
            </View>
            <View>
              <ThemedText
                variant="labelSm"
                color={colors.onSurfaceVariant}
                style={{ marginBottom: 4 }}
              >
                Est. Monthly Revenue
              </ThemedText>
              <TextInput
                style={styles.estimatorInput}
                value={revenue}
                onChangeText={(t) => setRevenue(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.outline}
                accessibilityLabel="Estimated monthly revenue in Kenyan shillings"
              />
            </View>
          </View>

          <View style={styles.breakEvenBox}>
            <ThemedText variant="labelSm" color={colors.onSurfaceVariant}>
              Est. Break-even
            </ThemedText>
            <ThemedText variant="titleMd" color={colors.primary}>
              {breakEvenMonths === null
                ? 'Not profitable yet'
                : breakEvenMonths === 1
                  ? '1 Month'
                  : `${breakEvenMonths} Months`}
            </ThemedText>
          </View>
        </View>

        {/* Deep-dive gap reports */}
        <View style={styles.reportsSection}>
          <ThemedText variant="headline" color={colors.primary}>
            Deep-Dive Gap Reports
          </ThemedText>

          {reportsLoading && (reports?.length ?? 0) === 0 ? (
            <EmptyState
              compact
              icon="document-check"
              title="Loading reports…"
              message="Fetching published intelligence for this category."
            />
          ) : reportsError ? (
            <ErrorState
              title="Couldn't load reports"
              error={reportsError}
              onRetry={reloadReports}
            />
          ) : (reports?.length ?? 0) === 0 ? (
            <EmptyState
              icon="document-check"
              title="No reports published yet"
              message={
                hasCategory
                  ? `No deep-dive reports have been published for ${category}.`
                  : 'Deep-dive reports appear once a category network is live.'
              }
            />
          ) : (
            reports!.map(renderReport)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.marginMobile, paddingBottom: 120, gap: 16 },

  selectorCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: radii.xl,
    padding: spacing.sectionPadding,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    gap: 16,
    ...shadows.card,
  },
  selectRow: { flexDirection: 'row', gap: 16 },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectInputDisabled: { opacity: 0.6 },
  selectMenu: {
    marginTop: 4,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
    position: 'absolute',
    top: 74,
    left: 0,
    right: 0,
    zIndex: 50,
    elevation: 8,
    shadowColor: '#152a4a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  selectItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectItemActive: {
    backgroundColor: colors.surfaceContainer,
  },
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    height: 48,
  },
  analyzeBtnDisabled: { opacity: 0.6 },

  oppCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: radii.xl,
    padding: spacing.sectionPadding,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...shadows.card,
  },
  oppHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  track: {
    width: '100%',
    height: 12,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },

  estimatorCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: spacing.sectionPadding,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...shadows.card,
  },
  estimatorInput: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.onSurface,
    fontFamily: 'Inter_400Regular',
  },
  breakEvenBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: rgba(colors.outlineVariant, 0.3),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  reportsSection: { gap: 16 },
  reportCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
    ...shadows.card,
  },
  reportBody: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: rgba(colors.outlineVariant, 0.2),
    gap: 4,
  },
  reportTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTag: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  unlockedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tertiaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  reportPreview: {
    height: 200,
    backgroundColor: colors.surfaceBright,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blurredContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    gap: 12,
    opacity: 0.4,
  },
  shimmerBar: {
    height: 16,
    backgroundColor: colors.outlineVariant,
    borderRadius: 4,
  },
  shimmerBlock: {
    width: '100%',
    backgroundColor: colors.outlineVariant,
    borderRadius: 4,
    marginTop: 8,
  },
  lockOverlay: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: rgba(colors.surfaceContainerLowest, 0.5),
    alignSelf: 'center',
    padding: 16,
    borderRadius: radii.xl,
  },
  lockIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: rgba(colors.secondary, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
  },
});