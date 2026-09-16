import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { IconName } from './Icon';
import Icon from './Icon';
import ThemedText from './ThemedText';
import { colors } from '../theme/colors';
import { radii, shadows } from '../theme';
import { rgba } from '../utils/color';
import { UserProfile } from '../types';
import { upgradeProfileTier } from '../lib/api';

type Criterion = {
  key: string;
  icon: IconName;
  title: string;
  todo: string;
  met: (p: UserProfile) => boolean;
  metText: (p: UserProfile) => string;
  guide: () => void;
};

const POSTS_NEEDED = 10;
const UPVOTES_NEEDED = 50;

const CRITERIA: Criterion[] = [
  {
    key: 'activity',
    icon: 'chat-bubble-left-right',
    title: 'Active in SokoCircle',
    todo: `Publish ${POSTS_NEEDED}+ community posts from the Home feed.`,
    met: (p) => p.communityPosts >= POSTS_NEEDED,
    metText: (p) => `${p.communityPosts} community posts`,
    guide: () =>
      Alert.alert(
        'Build Activity',
        `Publish ${POSTS_NEEDED}+ quality posts from the Home feed to unlock this criterion. You currently have fewer than ${POSTS_NEEDED}.`,
      ),
  },
  {
    key: 'reputation',
    icon: 'hand-thumb-up',
    title: 'Earned community reputation',
    todo: `Reach ${UPVOTES_NEEDED}+ helpful upvotes on your contributions.`,
    met: (p) => p.helpfulUpvotes >= UPVOTES_NEEDED,
    metText: (p) => `${p.helpfulUpvotes} helpful upvotes`,
    guide: () =>
      Alert.alert(
        'Earn Reputation',
        `Gain ${UPVOTES_NEEDED}+ helpful upvotes from the community by sharing actionable trade insights.`,
      ),
  },
  {
    key: 'profile',
    icon: 'shield-check',
    title: 'Verified business profile',
    todo: 'Keep your business type and county on file.',
    met: (p) => Boolean(p.businessType && p.location),
    metText: () => 'Business details on file',
    guide: () =>
      Alert.alert(
        'Verify Your Business',
        'Complete your business profile (business type + county) during onboarding so we can verify you.',
      ),
  },
];

type Props = {
  profile: UserProfile;
  onUpgraded?: () => void;
};

export default function CredibilityLadder({ profile, onUpgraded }: Props) {
  const [applying, setApplying] = useState(false);
  const applied = profile.tierName === 'Verified Mentor';

  const criteria = CRITERIA;
  const metCount = criteria.filter((c) => c.met(profile)).length;
  const total = criteria.length;
  const pct = Math.round((metCount / total) * 100);
  const eligible = metCount === total;
  const unmet = criteria.filter((c) => !c.met(profile));

  const doApply = async () => {
    setApplying(true);
    try {
      await upgradeProfileTier();
      Alert.alert('Application Submitted', 'Welcome aboard! Your profile now shows Verified Mentor.');
      onUpgraded?.();
    } catch (e) {
      Alert.alert(
        'Could Not Apply',
        e instanceof Error && e.message === 'sign-in-required'
          ? 'Sign in to submit your mentor application.'
          : 'We could not update your tier right now. Please try again.',
      );
    } finally {
      setApplying(false);
    }
  };

  const handleApply = () => {
    Alert.alert('Confirm Application', "You've met every criterion. Submit your Verified Mentor application?", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Apply', onPress: doApply },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <View style={styles.tag}>
            <Icon name="sparkles" size={12} color={colors.gold} variant="solid" />
            <ThemedText variant="labelSm" color={colors.gold} style={styles.tagText}>
              Credibility Ladder
            </ThemedText>
          </View>
          <ThemedText variant="titleMd" color="#fff" style={styles.title}>
            {applied ? 'You are a Verified Mentor' : 'Upgrade to Verified Mentor'}
          </ThemedText>
          <ThemedText variant="bodyMd" color="rgba(255,255,255,0.75)" style={styles.subtitle}>
            Unlock paid 1:1 direct consultations and earn KES 1,500+ per consultation session.
          </ThemedText>
        </View>
        <View style={styles.iconWrap}>
          <Icon name="trophy" size={22} color={colors.gold} variant="solid" />
        </View>
      </View>

      {applied ? (
        <Pressable
          style={styles.verifiedRow}
          onPress={() => Alert.alert('Verified Mentor', 'Your mentor badges, consultation slot and pricing are active. Viewable across SokoCircle.')}
        >
          <Icon name="check-badge" size={18} color={colors.gold} variant="solid" />
          <ThemedText variant="labelSm" color="rgba(255,255,255,0.9)" style={{ fontWeight: '700' }}>
            Mentor status active — you can now be booked for 1:1 sessions.
          </ThemedText>
        </Pressable>
      ) : (
        <>
          <View style={styles.progressRow}>
            <ThemedText variant="labelSm" color="rgba(255,255,255,0.8)" style={{ fontWeight: '500' }}>
              {metCount} of {total} criteria met
            </ThemedText>
            <ThemedText variant="labelSm" color={eligible ? colors.gold : 'rgba(255,255,255,0.6)'} style={{ fontWeight: '700' }}>
              {eligible ? 'Ready to apply' : `${total - metCount} remaining`}
            </ThemedText>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>

          <View style={styles.criteria}>
            {criteria.map((c) => {
              const met = c.met(profile);
              return (
                <Pressable
                  key={c.key}
                  disabled={met}
                  onPress={c.guide}
                  style={styles.criterionRow}
                >
                  <View style={[styles.criterionIcon, met && styles.criterionIconMet]}>
                    <Icon
                      name={met ? 'check-circle' : c.icon}
                      size={18}
                      color={met ? colors.success : 'rgba(255,255,255,0.6)'}
                      variant={met ? 'solid' : 'outline'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="labelSm" color="#fff" style={{ fontWeight: '600' }}>
                      {c.title}
                    </ThemedText>
                    <ThemedText variant="labelSm" color={met ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)'} style={{ fontSize: 11, marginTop: 2 }}>
                      {met ? c.metText(profile) : c.todo}
                    </ThemedText>
                  </View>
                  {!met && (
                    <View style={styles.actionChip}>
                      <ThemedText variant="labelSm" color={colors.gold} style={{ fontSize: 11, fontWeight: '700' }}>
                        Do This
                      </ThemedText>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <View style={{ flex: 1 }}>
              <ThemedText variant="labelSm" color="rgba(255,255,255,0.8)" style={{ fontSize: 12, fontWeight: '500' }}>
                {eligible
                  ? 'You are eligible to apply.'
                  : `Unlock the remaining ${unmet.length} ${
                      unmet.length === 1 ? 'criterion' : 'criteria'
                    } to apply.`}
              </ThemedText>
            </View>
            <Pressable
              disabled={!eligible || applying}
              onPress={handleApply}
              style={[styles.applyBtn, !eligible && styles.applyBtnDisabled]}
            >
              {applying ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <ThemedText variant="labelSm" color={colors.primary} style={{ fontWeight: '700' }}>
                    Apply Now
                  </ThemedText>
                  <Icon name="arrow-right" size={16} color={colors.primary} />
                </>
              )}
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    ...shadows.card,
    gap: 12,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontWeight: '700',
    marginTop: 6,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  criteria: {
    gap: 2,
  },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  criterionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  criterionIconMet: {
    backgroundColor: rgba(colors.success, 0.18),
  },
  actionChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 112,
    borderRadius: 8,
  },
  applyBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});