import React from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedText from '../../components/ThemedText';
import Icon from '../../components/Icon';
import ErrorState from '../../components/ErrorState';
import EmptyState from '../../components/EmptyState';
import NotificationSheet from '../../components/NotificationSheet';
import CredibilityLadder from '../../components/CredibilityLadder';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme';
import { rgba } from '../../utils/color';
import { formatKsh, fmtDate } from '../../lib/format';
import { useMentorApplication, useProfile } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';

function ProfileSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.profileRow}>
        <View style={[styles.avatar, styles.skeletonBlock]} />
        <View style={{ flex: 1, gap: 8 }}>
          <View style={[styles.skeletonLine, { width: '60%' }]} />
          <View style={[styles.skeletonLine, { width: '80%', height: 12 }]} />
        </View>
      </View>
    </View>
  );
}

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const [notifOpen, setNotifOpen] = React.useState(false);
  const { signOut, user } = useAuth();

  const profileState = useProfile();
  const applicationState = useMentorApplication();

  const p = profileState.data;
  const verified = p?.tier === 'tier1' || p?.tier === 'tier2' || p?.tier === 'mentor';
  const email = p?.email ?? user?.email ?? '';

  const onSignOut = () => {
    void signOut();
  };

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 12, height: insets.top + 64 },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="map-pin" size={22} color={colors.primary} />
          <ThemedText variant="headline" color={colors.primary}>
            SokoCircle
          </ThemedText>
        </View>
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          style={styles.headerBtn}
          onPress={() => setNotifOpen(true)}
        >
          <Icon name="bell" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={profileState.loading}
            onRefresh={() => {
              profileState.reload();
              applicationState.reload();
            }}
            tintColor={colors.primary}
          />
        }
      >
        {profileState.loading && !p ? (
          <ProfileSkeleton />
        ) : profileState.error ? (
          <ErrorState
            title="Couldn't load your profile"
            error={profileState.error}
            onRetry={profileState.reload}
          />
        ) : p ? (
          <>
            <View style={[styles.card, { overflow: 'hidden' }]}>
              <View style={styles.profileGlow} />
              <View style={styles.profileRow}>
                <View style={styles.avatarWrap}>
                  {p.avatarUrl ? (
                    <Image source={{ uri: p.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View
                      style={[
                        styles.avatar,
                        {
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: colors.primaryContainer,
                        },
                      ]}
                    >
                      <ThemedText
                        variant="headline"
                        color={colors.primary}
                        style={{ fontSize: 20, fontWeight: '700' }}
                      >
                        {p.fullName
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </ThemedText>
                    </View>
                  )}
                  {verified && (
                    <View style={styles.verifyBadge}>
                      <Icon name="check-badge" size={10} color="#fff" variant="solid" />
                    </View>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText variant="headline" color={colors.primary} style={{ fontSize: 20 }}>
                    {p.fullName}
                  </ThemedText>
                  <ThemedText
                    variant="labelSm"
                    color={colors.outline}
                    style={{ fontSize: 12, marginTop: 1 }}
                  >
                    {p.businessType ?? 'Business type not set'}
                  </ThemedText>
                  <ThemedText
                    variant="labelSm"
                    color={colors.outline}
                    style={{ fontSize: 12 }}
                  >
                    {p.location ?? 'County not set'}
                  </ThemedText>
                  <View
                    style={[
                      styles.tierBadge,
                      !verified && { backgroundColor: colors.surfaceContainerHigh },
                    ]}
                  >
                    <Icon
                      name={verified ? 'shield-check' : 'document-check'}
                      size={12}
                      color={verified ? colors.success : colors.outline}
                      variant="solid"
                    />
                    <ThemedText
                      variant="labelSm"
                      color={verified ? colors.success : colors.outline}
                      style={{ fontSize: 11 }}
                    >
                      {p.tierName}
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <View style={[styles.metric, styles.metricPad]}>
                  <ThemedText variant="titleMd" color={colors.primary} style={{ textAlign: 'center' }}>
                    {p.communityPosts}
                  </ThemedText>
                  <ThemedText
                    variant="labelSm"
                    color={colors.outline}
                    style={{ fontSize: 11, textAlign: 'center' }}
                  >
                    Community Posts
                  </ThemedText>
                </View>
                <View style={[styles.metric, styles.metricSideBorders]}>
                  <ThemedText variant="titleMd" color={colors.primary} style={{ textAlign: 'center' }}>
                    {p.helpfulUpvotes}
                  </ThemedText>
                  <ThemedText
                    variant="labelSm"
                    color={colors.outline}
                    style={{ fontSize: 11, textAlign: 'center' }}
                  >
                    Helpful Upvotes
                  </ThemedText>
                </View>
                <View style={[styles.metric, styles.metricPad]}>
                  <ThemedText
                    variant="titleMd"
                    color={colors.gold}
                    style={{ textAlign: 'center', fontFamily: 'DMSans_500Medium' }}
                  >
                    {formatKsh(p.walletBalance, { compact: true })}
                  </ThemedText>
                  <ThemedText
                    variant="labelSm"
                    color={colors.outline}
                    style={{ fontSize: 11, textAlign: 'center' }}
                  >
                    Wallet Balance
                  </ThemedText>
                </View>
              </View>

              <View style={styles.metaRows}>
                <View style={styles.metaRow}>
                  <ThemedText variant="labelSm" color={colors.outline} style={{ fontSize: 11 }}>
                    Email
                  </ThemedText>
                  <ThemedText variant="labelSm" color={colors.primary} style={{ fontSize: 12 }}>
                    {email || 'Not available'}
                  </ThemedText>
                </View>
                {p.phone ? (
                  <View style={styles.metaRow}>
                    <ThemedText variant="labelSm" color={colors.outline} style={{ fontSize: 11 }}>
                      Phone
                    </ThemedText>
                    <ThemedText variant="labelSm" color={colors.primary} style={{ fontSize: 12 }}>
                      {p.phone}
                    </ThemedText>
                  </View>
                ) : null}
                <View style={styles.metaRow}>
                  <ThemedText variant="labelSm" color={colors.outline} style={{ fontSize: 11 }}>
                    Member since
                  </ThemedText>
                  <ThemedText variant="labelSm" color={colors.primary} style={{ fontSize: 12 }}>
                    {fmtDate(p.createdAt)}
                  </ThemedText>
                </View>
              </View>
            </View>

            <CredibilityLadder
              profile={p}
              application={applicationState.data ?? null}
              onApplied={() => {
                applicationState.reload();
                profileState.reload();
              }}
            />

            <View style={{ gap: 10 }}>
              <ThemedText
                variant="labelSm"
                color={colors.primary}
                style={styles.sectionTitle}
              >
                My Intelligence Assets
              </ThemedText>
              <EmptyState
                compact
                icon="chart-pie"
                title="No reports purchased yet"
                message="Unlock a GapMap report and it will appear here with its download link."
              />
            </View>
          </>
        ) : null}

        <Pressable
          style={styles.signOutBtn}
          accessibilityRole="button"
          accessibilityLabel={email ? `Sign out of ${email}` : 'Sign out'}
          onPress={onSignOut}
        >
          <Icon name="arrow-right-on-rectangle" size={16} color={colors.accent} />
          <ThemedText
            variant="labelSm"
            color={colors.accent}
            style={{ fontSize: 12, fontWeight: '700' }}
          >
            {email ? `Sign Out of Account (${email})` : 'Sign Out'}
          </ThemedText>
        </Pressable>

        <ThemedText
          variant="labelSm"
          color={colors.outline}
          style={{ fontSize: 10, textAlign: 'center' }}
        >
          SokoCircle v1.2.0 • Data protected under Kenya Data Protection Act 2019
        </ThemedText>
      </ScrollView>

      <NotificationSheet visible={notifOpen} onClose={() => setNotifOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(251,249,244,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: 16, paddingTop: 16, gap: 20 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...shadows.card,
    gap: 16,
  },
  profileGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 144,
    height: 144,
    borderRadius: 999,
    backgroundColor: rgba(colors.gold, 0.15),
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  verifyBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: rgba(colors.success, 0.1),
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  skeletonBlock: { backgroundColor: colors.surfaceContainerHigh },
  skeletonLine: {
    height: 14,
    borderRadius: 6,
    backgroundColor: colors.surfaceContainerHigh,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  metric: {
    flex: 1,
    gap: 4,
  },
  metricPad: { paddingHorizontal: 4 },
  metricSideBorders: {
    paddingHorizontal: 4,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  metaRows: {
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    paddingHorizontal: 4,
  },

  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: rgba(colors.accent, 0.2),
    backgroundColor: rgba(colors.accent, 0.05),
    paddingVertical: 14,
    minHeight: 48,
  },
});