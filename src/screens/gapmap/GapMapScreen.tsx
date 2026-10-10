import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import TopAppBar from '../../components/TopAppBar';
import ThemedText from '../../components/ThemedText';
import Icon, { IconName } from '../../components/Icon';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import { colors } from '../../theme/colors';
import { radii, shadows, spacing } from '../../theme';
import { rgba } from '../../utils/color';
import {
  useAnalytics,
  useCategories,
  useGapReports,
  useGeoLocations,
  useProfile,
} from '../../hooks/useData';
import { formatKsh } from '../../lib/format';
import { countyFromLocation } from '../../lib/locations';
import { CountyAnalytics, DataSource, GapReport, LocationOption } from '../../types';

const TOPO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCUYG67f8lTVhR53Yovg5IZu6ZaNAEbCFqbRpPVXvVt10NAiSMDO6RSQOZJY6Sr1F6APzKPy2hSw1jM-TyqwWFp7knaznJnCkzKSxVlDJ9xs_9ggLmHrbc1sd48-8ab20KIx1aOxwyYDzNIXtP8lOcSWT-TUvCJBv8k2ryvPxhHlfzv_j-FUD9hKQH0IAmIQLB1qec2iHlWsdyj1shm1LhdmniWn3gNnb3DTgaCJmmOV1NtuBGJNX8T';

const LEVEL_LABEL: Record<LocationOption['level'], string> = {
  county: 'County',
  subcounty: 'Sub-county',
  constituency: 'Constituency',
  ward: 'Ward',
  town: 'Town',
};

type SelectProps = {
  label: string;
  icon: IconName;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
};

function Select({ label, icon, options, value, onChange, disabled }: SelectProps) {
  const [open, setOpen] = useState(false);
  const canOpen = !disabled && options.length > 0;

  return (
    <View style={[styles.fieldWrap, open && styles.fieldWrapOpen]}>
      <ThemedText
        variant="labelSm"
        color={colors.onSurfaceVariant}
        style={styles.fieldLabel}
      >
        {label}
      </ThemedText>
      <Pressable
        onPress={() => canOpen && setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || 'none selected'}`}
        accessibilityState={{ disabled: !canOpen, expanded: open }}
        style={[
          styles.selectInput,
          open && styles.selectInputOpen,
          disabled && styles.selectInputDisabled,
        ]}
      >
        <View style={[styles.selectIconWrap, open && styles.selectIconWrapOpen]}>
          <Icon
            name={icon}
            size={16}
            color={open ? colors.onPrimary : colors.primary}
          />
        </View>
        <ThemedText
          variant="bodyMd"
          color={value ? colors.onSurface : colors.outline}
          numberOfLines={1}
          style={{ flex: 1 }}
        >
          {value || 'None'}
        </ThemedText>
        <Icon
          name="chevron-down"
          size={18}
          color={open ? colors.primary : colors.outline}
          style={open ? styles.chevronOpen : undefined}
        />
      </Pressable>

      {open ? (
        <View style={styles.selectMenu}>
          <View style={styles.menuHeader}>
            <ThemedText variant="labelSm" color={colors.onSurfaceVariant} style={styles.menuHeaderText}>
              {label}
            </ThemedText>
          </View>
          <ScrollView
            style={styles.menuScroll}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {options.map((opt) => {
              const active = opt === value;
              return (
                <Pressable
                  key={opt}
                  onPress={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  style={[styles.selectItem, active && styles.selectItemActive]}
                >
                  <ThemedText
                    variant="bodyMd"
                    color={active ? colors.primary : colors.onSurface}
                    numberOfLines={1}
                    style={{ flex: 1 }}
                  >
                    {opt}
                  </ThemedText>
                  {active ? (
                    <Icon name="check-badge" size={16} color={colors.primary} variant="solid" />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

type LocationPickerProps = {
  options: LocationOption[];
  value: LocationOption | null;
  onChange: (value: LocationOption) => void;
  loading?: boolean;
  error?: Error | null;
};

/**
 * Searchable picker over the geo reference tables. Every option carries the
 * county it resolves to, so granular picks still query county-keyed data.
 */
function LocationPicker({ options, value, onChange, loading, error }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q
      ? options.filter(
          (o) => o.label.toLowerCase().includes(q) || o.county.toLowerCase().includes(q),
        )
      : options;
    return pool.slice(0, 80);
  }, [options, query]);

  const disabled = !!loading || !!error || options.length === 0;
  const title = value
    ? `${value.label}, ${value.county}`
    : loading
      ? 'Loading…'
      : error
        ? 'Unavailable'
        : 'None';

  return (
    <View style={[styles.fieldWrap, open && styles.fieldWrapOpen]}>
      <ThemedText
        variant="labelSm"
        color={colors.onSurfaceVariant}
        style={styles.fieldLabel}
      >
        Location
      </ThemedText>
      <Pressable
        onPress={() => !disabled && setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={`Location: ${title}`}
        accessibilityState={{ disabled, expanded: open }}
        style={[
          styles.selectInput,
          open && styles.selectInputOpen,
          disabled && styles.selectInputDisabled,
        ]}
      >
        <View style={[styles.selectIconWrap, open && styles.selectIconWrapOpen]}>
          <Icon name="map-pin" size={16} color={open ? colors.onPrimary : colors.primary} />
        </View>
        <ThemedText
          variant="bodyMd"
          color={value ? colors.onSurface : colors.outline}
          numberOfLines={1}
          style={{ flex: 1 }}
        >
          {title}
        </ThemedText>
        <Icon
          name="chevron-down"
          size={18}
          color={open ? colors.primary : colors.outline}
          style={open ? styles.chevronOpen : undefined}
        />
      </Pressable>

      {open && !disabled ? (
        <View style={styles.locationMenu}>
          <View style={styles.locationSearchWrap}>
            <Icon name="magnifying-glass" size={16} color={colors.outline} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search county, ward, town…"
              placeholderTextColor={colors.outline}
              autoCorrect={false}
              autoCapitalize="none"
              style={styles.locationSearch}
              accessibilityLabel="Search locations"
            />
          </View>
          {results.length === 0 ? (
            <View style={styles.locationEmpty}>
              <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
                No matching locations.
              </ThemedText>
            </View>
          ) : (
            <ScrollView
              style={styles.locationList}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {results.map((opt) => {
                const active = opt.value === value?.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      onChange(opt);
                      setOpen(false);
                      setQuery('');
                    }}
                    style={[styles.locationItem, active && styles.selectItemActive]}
                  >
                    <View style={{ flex: 1, gap: 3 }}>
                      <ThemedText
                        variant="bodyMd"
                        color={active ? colors.primary : colors.onSurface}
                        numberOfLines={1}
                      >
                        {opt.label}
                      </ThemedText>
                      <View style={styles.locationMetaRow}>
                        <View style={styles.levelPill}>
                          <ThemedText
                            variant="labelSm"
                            color={colors.onSurfaceVariant}
                            style={{ fontSize: 10 }}
                          >
                            {LEVEL_LABEL[opt.level]}
                          </ThemedText>
                        </View>
                        <ThemedText
                          variant="labelSm"
                          color={colors.onSurfaceVariant}
                          style={{ fontSize: 11 }}
                          numberOfLines={1}
                        >
                          {opt.county}
                        </ThemedText>
                      </View>
                    </View>
                    {active ? (
                      <Icon name="check-badge" size={16} color={colors.primary} variant="solid" />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      ) : null}
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

function signalValue(value: number | null, unit = ''): string {
  if (value == null) return '—';
  const rounded = Number.isInteger(value) ? value : Math.round(value * 100) / 100;
  return `${rounded.toLocaleString('en-KE')}${unit}`;
}

/** County structural signals shown in place of the sector demand bars. */
function CountySignals({
  analytics,
  onOpenSource,
}: {
  analytics: CountyAnalytics;
  onOpenSource: (source: DataSource) => void;
}) {
  const signals = [
    { label: 'Population (2023 proj.)', value: signalValue(analytics.population2023Proj) },
    { label: 'GDP (USD bn, 2024)', value: signalValue(analytics.gdpUsdBn2024) },
    { label: 'GDP per capita (USD)', value: signalValue(analytics.gdpPerCapitaUsd2024) },
    {
      label: 'GDP p.c. vs national',
      value:
        analytics.gdpPerCapitaVsNational == null
          ? '—'
          : `${signalValue(analytics.gdpPerCapitaVsNational)}×`,
    },
    {
      label: 'GDP growth 2020–24',
      value:
        analytics.avgGdpGrowthPct == null ? '—' : `${signalValue(analytics.avgGdpGrowthPct)}%`,
    },
    {
      label: 'Formal inclusion (2024)',
      value:
        analytics.formalInclusionPct2024 == null
          ? '—'
          : `${signalValue(analytics.formalInclusionPct2024)}%`,
    },
    {
      label: 'MSME share (2016)',
      value:
        analytics.msmeSharePct2016 == null ? '—' : `${signalValue(analytics.msmeSharePct2016)}%`,
    },
    {
      label: 'MSME vs pop share',
      value:
        analytics.msmeShareToPopShare == null
          ? '—'
          : `${signalValue(analytics.msmeShareToPopShare)}×`,
    },
  ].filter((s) => s.value !== '—');

  const badges = [
    analytics.highGrowth ? 'High growth' : null,
    analytics.caipPhase1 ? 'CAIP Phase 1 (2025)' : null,
    analytics.caipNearComplete ? 'CAIP near-complete' : null,
  ].filter((b): b is string => b !== null);

  return (
    <View style={{ gap: 20 }}>
      {analytics.archetype ? (
        <View style={styles.archetypeCard}>
          <View style={styles.archetypeHeader}>
            <Icon name="sparkles" size={16} color={colors.secondary} variant="solid" />
            <ThemedText
              variant="labelSm"
              color={colors.secondary}
              style={{ textTransform: 'uppercase', letterSpacing: 1 }}
            >
              {analytics.archetype.label}
            </ThemedText>
          </View>
          <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
            {analytics.archetype.typicalGaps}
          </ThemedText>
        </View>
      ) : null}

      {signals.length > 0 ? (
        <View style={styles.signalGrid}>
          {signals.map((s) => (
            <View key={s.label} style={styles.signalTile}>
              <ThemedText variant="titleMd" color={colors.primary}>
                {s.value}
              </ThemedText>
              <ThemedText
                variant="labelSm"
                color={colors.onSurfaceVariant}
                style={{ fontSize: 11 }}
              >
                {s.label}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}

      {badges.length > 0 ? (
        <View style={styles.badgeRow}>
          {badges.map((b) => (
            <View key={b} style={styles.badge}>
              <ThemedText variant="labelSm" color={colors.secondary} style={{ fontSize: 11 }}>
                {b}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}

      {analytics.documentedNotes ? (
        <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
          {analytics.documentedNotes}
        </ThemedText>
      ) : null}

      {analytics.sources.length > 0 ? (
        <View style={{ gap: 8 }}>
          <ThemedText
            variant="labelSm"
            color={colors.onSurfaceVariant}
            style={{ textTransform: 'uppercase', letterSpacing: 1 }}
          >
            Sources
          </ThemedText>
          {analytics.sources.map((source) => (
            <Pressable
              key={source.id}
              disabled={!source.url}
              onPress={() => onOpenSource(source)}
              accessibilityRole="link"
              accessibilityLabel={`Open source: ${source.title}`}
              style={styles.sourceRow}
            >
              <Icon name="globe-alt" size={14} color={colors.secondary} />
              <ThemedText
                variant="labelSm"
                color={colors.secondary}
                numberOfLines={2}
                style={{ flex: 1, fontSize: 11 }}
              >
                {source.title}
                {source.publisher ? ` · ${source.publisher}` : ''}
                {source.year ? ` (${source.year})` : ''}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      ) : null}

      <ThemedText variant="labelSm" color={colors.onSurfaceVariant} style={{ fontSize: 11 }}>
        County-level structural signal — not a sector-specific demand score.
      </ThemedText>
    </View>
  );
}

export default function GapMapScreen() {
  const { data: profile } = useProfile();
  const { data: categories } = useCategories();
  const locationsState = useGeoLocations();

  const categoryOptions = useMemo(
    () => (categories ?? []).map((c) => c.title),
    [categories],
  );

  const locationOptions = useMemo(() => locationsState.data ?? [], [locationsState.data]);

  const [locationChoice, setLocationChoice] = useState<LocationOption | null>(null);
  const [categoryChoice, setCategoryChoice] = useState<string | null>(null);
  const [capital, setCapital] = useState('500000');
  const [overhead, setOverhead] = useState('45000');
  const [revenue, setRevenue] = useState('130000');

  const defaultLocation = useMemo<LocationOption | null>(() => {
    const target = countyFromLocation(profile?.location);
    return (
      locationOptions.find((o) => o.level === 'county' && o.label === target) ??
      locationOptions.find((o) => o.county === target) ??
      locationOptions.find((o) => o.level === 'county') ??
      null
    );
  }, [locationOptions, profile?.location]);

  const locationOption = locationChoice ?? defaultLocation;
  const queryLocation = locationOption?.county ?? 'Nairobi';
  const locationDisplay = locationOption
    ? `${locationOption.label}, ${locationOption.county}`
    : queryLocation;

  const category = categoryChoice ?? categoryOptions[0] ?? '';

  // `gap_analytics`/`gap_reports` are keyed by the category's short label
  // (e.g. "Electronics"), while the dropdown shows the longer title
  // (e.g. "Gadgets & Repairs"). Query by label, display the title.
  const categoryKey = useMemo(() => {
    const match = (categories ?? []).find((c) => c.title === category);
    return match?.label || category;
  }, [categories, category]);

  const {
    data: analytics,
    loading: analyticsLoading,
    error: analyticsError,
    reload: reloadAnalytics,
  } = useAnalytics(categoryKey || '__none__', queryLocation);

  const {
    data: reports,
    loading: reportsLoading,
    error: reportsError,
    reload: reloadReports,
  } = useGapReports({ category: categoryKey || null, location: queryLocation });

  const handleOpenSource = useCallback(async (source: DataSource) => {
    if (!source.url) return;
    try {
      await Linking.openURL(source.url);
    } catch {
      // A malformed/unsupported URL should not crash the screen.
    }
  }, []);

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
              icon="squares-2x2"
              options={categoryOptions}
              value={category}
              onChange={setCategoryChoice}
              disabled={!hasCategory}
            />
            <LocationPicker
              options={locationOptions}
              value={locationOption}
              onChange={setLocationChoice}
              loading={locationsState.loading}
              error={locationsState.error}
            />
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
                {category || 'No category'} in {locationDisplay}
              </ThemedText>
            </View>
          </View>

          {analyticsError ? (
            <ErrorState
              title="Couldn't load the analysis"
              error={analyticsError}
              onRetry={reloadAnalytics}
            />
          ) : analytics ? (
            analytics.kind === 'county' ? (
              <CountySignals analytics={analytics} onOpenSource={handleOpenSource} />
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
            )
          ) : !hasCategory ? (
            <EmptyState
              compact
              icon="squares-2x2"
              title="No categories published yet"
              message="Opportunity scores appear once a category network is live."
            />
          ) : (
            <EmptyState
              compact
              icon="chart-bar"
              title="No data for this selection yet"
              message={`We have no demand or saturation figures for ${category} in ${locationDisplay}. Try another location.`}
            />
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
              message={`No deep-dive reports have been published for ${category ? `${category} in ` : ''}${locationDisplay}.`}
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
    // Keep the whole selector (and its dropdown menus) above the cards below.
    zIndex: 10,
    elevation: 6,
  },
  selectRow: { flexDirection: 'row', gap: 12 },
  fieldWrap: { flex: 1, zIndex: 1 },
  fieldWrapOpen: { zIndex: 60 },
  fieldLabel: {
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
    fontWeight: '600',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 50,
  },
  selectInputOpen: {
    borderColor: colors.primary,
  },
  selectInputDisabled: { opacity: 0.55 },
  selectIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
  },
  selectIconWrapOpen: { backgroundColor: colors.primary },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  selectMenu: {
    marginTop: 6,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
    position: 'absolute',
    top: 78,
    left: 0,
    right: 0,
    zIndex: 50,
    elevation: 8,
    shadowColor: '#152a4a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
  },
  menuHeader: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  menuHeaderText: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  menuScroll: { maxHeight: 240 },
  selectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  selectItemActive: {
    backgroundColor: colors.surfaceContainer,
  },
  locationMenu: {
    marginTop: 6,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
    position: 'absolute',
    top: 78,
    right: 0,
    width: 300,
    zIndex: 50,
    elevation: 8,
    shadowColor: '#152a4a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
  },
  locationSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  locationSearch: {
    flex: 1,
    paddingVertical: 2,
    fontSize: 15,
    color: colors.onSurface,
    fontFamily: 'Inter_400Regular',
  },
  locationList: { maxHeight: 280 },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  locationMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  levelPill: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  locationEmpty: { padding: 16 },

  archetypeCard: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.md,
    padding: 12,
    gap: 6,
  },
  archetypeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  signalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  signalTile: {
    flexBasis: '46%',
    flexGrow: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 2,
  },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    backgroundColor: rgba(colors.secondary, 0.12),
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sourceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
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