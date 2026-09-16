import React, { useState } from 'react';
import {
  Alert,
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
import { colors } from '../../theme/colors';
import { radii, shadows, spacing } from '../../theme';
import { rgba } from '../../utils/color';
import { useAnalytics, useGapReports } from '../../hooks/useData';
import { GapReport } from '../../types';

const TOPO_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCUYG67f8lTVhR53Yovg5IZu6ZaNAEbCFqbRpPVXvVt10NAiSMDO6RSQOZJY6Sr1F6APzKPy2hSw1jM-TyqwWFp7knaznJnCkzKSxVlDJ9xs_9ggLmHrbc1sd48-8ab20KIx1aOxwyYDzNIXtP8lOcSWT-TUvCJBv8k2ryvPxhHlfzv_j-FUD9hKQH0IAmIQLB1qec2iHlWsdyj1shm1LhdmniWn3gNnb3DTgaCJmmOV1NtuBGJNX8T';

const CATEGORIES = ['Electronics', 'Agro-Vet', 'Hardware', 'Fashion'];
const LOCATIONS = ['Kayole, Nairobi', 'Kibera, Nairobi', 'Thika Town, Kiambu'];

type SelectProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
};

function Select({ label, options, value, onChange }: SelectProps) {
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
        onPress={() => setOpen((v) => !v)}
        style={styles.selectInput}
      >
        <ThemedText variant="bodyMd" color={colors.onSurface}>
          {value}
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
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const pct = parseInt(value, 10);
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
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function GapMapScreen() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [capital, setCapital] = useState('500000');
  const [overhead, setOverhead] = useState('45000');
  const [revenue, setRevenue] = useState('130000');
  const { data: reports } = useGapReports();
  const { data: analytics, reload: reloadAnalytics } = useAnalytics(category, location);

  const reportList = reports ?? [];

  const capitalN = parseFloat(capital) || 0;
  const overheadN = parseFloat(overhead) || 0;
  const revenueN = parseFloat(revenue) || 0;
  const monthlyProfit = revenueN - overheadN;
  const breakEvenMonths =
    monthlyProfit > 0 && capitalN > 0
      ? Math.max(1, Math.ceil(capitalN / monthlyProfit))
      : null;

  const handleAnalyze = () => {
    reloadAnalytics();
    Alert.alert('Analysis Complete', `${category} in ${location.split(',')[0]} shows a strong opportunity score.`);
  };

  const handleUnlock = (report: GapReport) => {
    Alert.alert(
      'Unlock Report',
      `Pay KSh ${report.price} via M-Pesa (Paybill 889201) to unlock "${report.title}".`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Now', onPress: () => Alert.alert('Payment Successful', `"${report.title}" has been unlocked. Check your intelligence assets.`) },
      ],
    );
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
              options={CATEGORIES}
              value={category}
              onChange={setCategory}
            />
            <Select
              label="Location (County/Ward)"
              options={LOCATIONS}
              value={location}
              onChange={setLocation}
            />
          </View>

          <Pressable style={styles.analyzeBtn} onPress={handleAnalyze}>
            <Icon name="magnifying-glass" size={18} color={colors.onPrimary} />
            <ThemedText variant="labelSm" color={colors.onPrimary}>
              Analyze Gap
            </ThemedText>
          </Pressable>
        </View>

        {/* Analytics grid */}
        <View style={{ gap: 16 }}>
          {/* Opportunity Score */}
          <View style={styles.oppCard}>
            <View style={styles.oppHeader}>
              <View style={{ gap: 2 }}>
                <ThemedText variant="titleMd" color={colors.primary}>
                  Opportunity Score
                </ThemedText>
                <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
                  {category} in {location.split(',')[0]}
                </ThemedText>
              </View>
              <View style={styles.strongBadge}>
                <Icon name="check-badge" size={16} color={colors.onTertiaryContainer} variant="solid" />
                <ThemedText variant="labelSm" color={colors.onTertiaryContainer}>
                  Strong Opportunity
                </ThemedText>
              </View>
            </View>

            <View style={{ gap: 24 }}>
              <StatBar
                label="Consumer Demand"
                value={analytics?.demandLabel ?? '84% (High)'}
                color={analytics?.demandColor ?? colors.primary}
              />
              <StatBar
                label="Market Saturation"
                value={analytics?.saturationLabel ?? '32% (Low)'}
                color={analytics?.saturationColor ?? colors.secondary}
              />
            </View>
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
        </View>

        {/* Deep-dive gap reports */}
        <View style={styles.reportsSection}>
          <ThemedText variant="headline" color={colors.primary}>
            Deep-Dive Gap Reports
          </ThemedText>

          {reportList.map((report: GapReport) => (
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
                  <Icon name={report.icon} size={20} color={colors.outline} />
                </View>
                <ThemedText variant="titleMd" color={colors.primary}>
                  {report.title}
                </ThemedText>
                <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
                  {report.description}
                </ThemedText>
              </View>
              <View style={styles.reportPreview}>
                {report.previewImageUrl ? (
                  <>
                    <Image source={{ uri: report.previewImageUrl }} style={StyleSheet.absoluteFill} />
                    <View style={[styles.lockOverlay, report.isUnlocked && { display: 'none' }]}>
                      <View style={styles.lockIconWrap}>
                        <Icon name="lock-closed" size={22} color={colors.secondary} variant="solid" />
                      </View>
                      <ThemedText variant="labelSm" color={colors.onSurface} style={{ marginVertical: 12 }}>
                        Premium Intelligence Data
                      </ThemedText>
                      <Pressable style={styles.unlockBtn} onPress={() => handleUnlock(report)}>
                        <ThemedText variant="labelSm" color={colors.onPrimary}>
                          Pay KSh {report.price} to Unlock
                        </ThemedText>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <>
                    {/* blurred placeholder content */}
                    <View style={styles.blurredContent}>
                      <View style={[styles.shimmerBar, { width: '75%' }]} />
                      <View style={[styles.shimmerBar, { width: '50%' }]} />
                      <View style={[styles.shimmerBlock, { flex: 1 }]} />
                    </View>
                    <View style={styles.lockOverlay}>
                      <View style={styles.lockIconWrap}>
                        <Icon name="lock-closed" size={22} color={colors.secondary} variant="solid" />
                      </View>
                      <ThemedText variant="labelSm" color={colors.onSurface} style={{ marginVertical: 12 }}>
                        Premium Intelligence Data
                      </ThemedText>
                      <Pressable style={styles.unlockBtn} onPress={() => handleUnlock(report)}>
                        <ThemedText variant="labelSm" color={colors.onPrimary}>
                          Pay KSh {report.price} to Unlock
                        </ThemedText>
                      </Pressable>
                    </View>
                  </>
                )}
                {report.isUnlocked && (
                  <View style={styles.lockOverlay}>
                    <Pressable style={styles.unlockBtn} onPress={() => handleUnlock(report)}>
                      <ThemedText variant="labelSm" color={colors.onPrimary}>
                        View Report
                      </ThemedText>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          ))}
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
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
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
    marginBottom: 24,
  },
  strongBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tertiaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
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
  reportPreview: {
    height: 240,
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
  unlockBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radii.md,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
});