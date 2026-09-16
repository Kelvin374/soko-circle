import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedText from '../../components/ThemedText';
import Icon, { IconName } from '../../components/Icon';
import NotificationSheet from '../../components/NotificationSheet';
import CredibilityLadder from '../../components/CredibilityLadder';
import { colors } from '../../theme/colors';
import { radii, shadows, spacing } from '../../theme';
import { rgba } from '../../utils/color';
import { useProfile } from '../../hooks/useData';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';

type MenuItemProps = {
  icon: IconName;
  title: string;
  subtitle: string;
  success?: boolean;
  onPress?: () => void;
};

function MenuItem({ icon, title, subtitle, success, onPress }: MenuItemProps) {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPress={onPress ?? (() => Alert.alert(title, 'This feature is coming soon in the SokoCircle network.'))}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.menuItem, pressed && styles.menuItemPressed]}
    >
      <View style={styles.menuIcon}>
        <Icon name={icon} size={20} color={pressed ? colors.onPrimary : colors.primary} variant="solid" />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText variant="bodyMd" color={colors.primary} style={{ fontSize: 15, fontWeight: '600' }}>
          {title}
        </ThemedText>
        <ThemedText variant="labelSm" color={success ? colors.success : colors.outline} style={{ fontSize: 11 }}>
          {subtitle}
        </ThemedText>
      </View>
      <Icon name="chevron-right" size={18} color={colors.outline} />
    </Pressable>
  );
}

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const [notifOpen, setNotifOpen] = useState(false);
  const { signOut } = useAuth();
  const { data: profile, reload: reloadProfile } = useProfile();
  const p: UserProfile = profile ?? {
    id: 'demo',
    fullName: 'David Kamau',
    avatarUrl: null,
    businessType: 'Electronics Retailer',
    location: 'Kayole, Nairobi',
    tierName: 'Tier 1: Verified Trader',
    communityPosts: 24,
    helpfulUpvotes: 142,
    walletBalance: 12400,
    email: '+254 712 *** 890',
    upvotedVerified: false,
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            height: insets.top + 64,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="map-pin" size={22} color={colors.primary} />
          <ThemedText variant="headline" color={colors.primary}>
            SokoCircle
          </ThemedText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Pressable
          hitSlop={8}
          style={styles.headerBtn}
          onPress={() => Alert.alert('Settings', 'Account settings coming soon.')}
        >
            <Icon name="cog-6-tooth" size={22} color={colors.primary} />
          </Pressable>
          <Pressable hitSlop={8} style={styles.headerBtn} onPress={() => setNotifOpen(true)}>
            <Icon name="bell" size={22} color={colors.primary} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header card */}
        <View style={[styles.card, { overflow: 'hidden' }]}>
          <View style={styles.profileGlow} />
          <View style={styles.profileRow}>
            <View style={styles.avatarWrap}>
              {p.avatarUrl ? (
                <Image source={{ uri: p.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryContainer }]}>
                  <ThemedText variant="headline" color={colors.primary} style={{ fontSize: 20, fontWeight: '700' }}>
                    {p.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </ThemedText>
                </View>
              )}
              <View style={styles.verifyBadge}>
                <Icon name="check-badge" size={10} color="#fff" variant="solid" />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText variant="headline" color={colors.primary} style={{ fontSize: 20 }}>
                {p.fullName}
              </ThemedText>
              <ThemedText variant="labelSm" color={colors.outline} style={{ fontSize: 12, marginTop: 1 }}>
                {p.businessType} • {p.location}
              </ThemedText>
              <View style={styles.tierBadge}>
                <Icon name="shield-check" size={12} color={colors.success} variant="solid" />
                <ThemedText variant="labelSm" color={colors.success} style={{ fontSize: 11 }}>
                  {p.tierName}
                </ThemedText>
              </View>
            </View>
            <Pressable
              hitSlop={8}
              style={styles.editBtn}
              onPress={() => Alert.alert('Edit Profile', 'Editing your business profile is coming soon.')}
            >
              <Icon name="pencil-square" size={20} color={colors.outline} />
            </Pressable>
          </View>

          <View style={styles.metricsRow}>
            <View style={[styles.metric, styles.metricPad]}>
              <ThemedText variant="titleMd" color={colors.primary} style={{ textAlign: 'center' }}>
                {p.communityPosts}
              </ThemedText>
              <ThemedText variant="labelSm" color={colors.outline} style={{ fontSize: 11, textAlign: 'center' }}>
                Community Posts
              </ThemedText>
            </View>
            <View style={[styles.metric, styles.metricSideBorders]}>
              <ThemedText variant="titleMd" color={colors.primary} style={{ textAlign: 'center' }}>
                {p.helpfulUpvotes}
              </ThemedText>
              <ThemedText variant="labelSm" color={colors.outline} style={{ fontSize: 11, textAlign: 'center' }}>
                Helpful Upvotes
              </ThemedText>
            </View>
            <View style={[styles.metric, styles.metricPad]}>
              <ThemedText variant="titleMd" color={colors.gold} style={{ textAlign: 'center', fontFamily: 'DMSans_500Medium' }}>
                KES {(p.walletBalance / 1000).toFixed(1)}k
              </ThemedText>
              <ThemedText variant="labelSm" color={colors.outline} style={{ fontSize: 11, textAlign: 'center' }}>
                Wallet Balance
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Credibility ladder */}
        <CredibilityLadder profile={p} onUpgraded={reloadProfile} />

        {/* My Intelligence Assets */}
        <View style={{ gap: 10 }}>
          <View style={styles.sectionHeader}>
            <ThemedText variant="labelSm" color={colors.primary} style={{ textTransform: 'uppercase', letterSpacing: 1.2 }}>
              My Intelligence Assets
            </ThemedText>
            <ThemedText
              variant="labelSm"
              color={colors.secondary}
              style={{ fontWeight: '700' }}
              onPress={() => Alert.alert('Intelligence Assets', 'Viewing all 4 of your purchased intelligence assets.')}
            >
              View All (4)
            </ThemedText>
          </View>

          {/* Unlocked gap report */}
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.assetIcon}>
                  <Icon name="chart-pie" size={20} color={colors.secondary} variant="solid" />
                </View>
                <View>
                  <ThemedText variant="bodyMd" color={colors.primary} style={{ fontSize: 14, fontWeight: '700' }}>
                    Kayole Electronics Demand Gap
                  </ThemedText>
                  <ThemedText variant="labelSm" color={colors.outline} style={{ fontSize: 11 }}>
                    Purchased 14 Feb 2025 • Full Access
                  </ThemedText>
                </View>
              </View>
              <View style={styles.gapBadge}>
                <ThemedText variant="labelSm" color={colors.success} style={{ fontSize: 11, fontWeight: '700' }}>
                  84% Gap
                </ThemedText>
              </View>
            </View>
            <View style={styles.breakEvenRow}>
              <ThemedText variant="labelSm" color={colors.outline} style={{ fontSize: 11 }}>
                Break-even horizon:{' '}
                <ThemedText variant="labelSm" color={colors.primary} style={{ fontSize: 11, fontWeight: '700' }}>
                  6 Months
                </ThemedText>
              </ThemedText>
              <Pressable
                style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
                onPress={() => Alert.alert('Download PDF', 'Preparing your Kayole Electronics Demand Gap report for download.')}
              >
                <ThemedText variant="labelSm" color={colors.primary} style={{ fontSize: 12, fontWeight: '700' }}>
                  Download PDF
                </ThemedText>
                <Icon name="arrow-down-tray" size={16} color={colors.primary} />
              </Pressable>
            </View>
          </View>

          {/* Paid mentor inbox */}
          <View style={styles.card}>
            <View style={styles.inboxHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="chat-bubble-left-right" size={18} color={colors.primary} variant="solid" />
                <ThemedText variant="bodyMd" color={colors.primary} style={{ fontSize: 14, fontWeight: '700' }}>
                  Paid Mentor Inbox
                </ThemedText>
              </View>
              <View style={styles.activeBadge}>
                <ThemedText variant="labelSm" color={colors.accent} style={{ fontSize: 11, fontWeight: '700' }}>
                  1 Active Session
                </ThemedText>
              </View>
            </View>

            <View style={styles.inboxRow}>
              <View style={styles.inboxAvatar}>
                <ThemedText variant="labelSm" color={colors.primary} style={{ fontSize: 12, fontWeight: '700' }}>
                  JM
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText variant="labelSm" color={colors.primary} style={{ fontSize: 12, fontWeight: '700' }}>
                  John M. (Electronics Importer)
                </ThemedText>
                <ThemedText variant="labelSm" color={colors.outline} style={{ fontSize: 11 }} numberOfLines={1}>
                  "Sourcing quote sent from Shenzhen hub..."
                </ThemedText>
              </View>
              <Pressable
                style={styles.replyBtn}
                onPress={() => Alert.alert('Mentor Inbox', 'Open your conversation with John M. to reply.')}
              >
                <ThemedText variant="labelSm" color="#fff" style={{ fontSize: 11, fontWeight: '700' }}>
                  Reply
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Management & Activity */}
        <View style={{ gap: 10 }}>
          <ThemedText variant="labelSm" color={colors.primary} style={styles.sectionTitle}>
            Management & Activity
          </ThemedText>
          <View style={[styles.card, styles.menuCard]}>
            <MenuItem
              icon="bookmark"
              title="Saved Suppliers & Bookmarks"
              subtitle="5 vetted businesses saved"
            />
            <View style={styles.divider} />
            <MenuItem
              icon="building-storefront"
              title="Supplier Dashboard"
              subtitle="Manage catalog & pending inquiries"
            />
            <View style={styles.divider} />
            <MenuItem
              icon="user-group"
              title="My Trade Circles"
              subtitle="Kamkunji Hardware Circle, Eastleigh Hub"
            />
            <View style={styles.divider} />
            <MenuItem
              icon="credit-card"
              title="Billing & M-Pesa Receipts"
              subtitle="Paybill 889201 • Transacted KES 3,500"
            />
            <View style={styles.divider} />
            <MenuItem
              icon="document-check"
              title="Business KYC & Compliance"
              subtitle="KRA PIN Verified • Site Inspection Done"
              success
            />
          </View>
        </View>

        {/* Sign out */}
        <View style={{ gap: 8, marginTop: 8 }}>
          <Pressable
          style={styles.signOutBtn}
          onPress={() =>
            Alert.alert('Sign Out', `Sign out of ${p.email}?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: () => { void signOut(); } },
            ])
          }
        >
            <Icon name="arrow-right-on-rectangle" size={16} color={colors.accent} />
            <ThemedText variant="labelSm" color={colors.accent} style={{ fontSize: 12, fontWeight: '700' }}>
              Sign Out of Account ({p.email})
            </ThemedText>
          </Pressable>
          <ThemedText variant="labelSm" color={colors.outline} style={{ fontSize: 10, textAlign: 'center' }}>
            SokoCircle v1.2.0 • Data protected under Kenya Data Protection Act 2019
          </ThemedText>
        </View>
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
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
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
  editBtn: {
    padding: 8,
    borderRadius: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    marginTop: 4,
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

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    paddingHorizontal: 4,
  },
  assetIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: rgba(colors.secondary, 0.15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  gapBadge: {
    backgroundColor: rgba(colors.success, 0.1),
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  breakEvenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 10,
    padding: 10,
  },
  inboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeBadge: {
    backgroundColor: rgba(colors.accent, 0.1),
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  inboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  inboxAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: rgba(colors.primary, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },

  menuCard: { gap: 0, padding: 4 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  menuItemPressed: {
    backgroundColor: colors.surfaceContainerLow,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 12,
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
    paddingVertical: 12,
  },
});