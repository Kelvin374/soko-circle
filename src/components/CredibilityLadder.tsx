import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Icon, { IconName } from './Icon';
import ThemedText from './ThemedText';
import { colors } from '../theme/colors';
import { shadows } from '../theme';
import { rgba } from '../utils/color';
import { UserProfile } from '../types';
import { applyForMentor, MentorApplication } from '../lib/api';

const POSTS_NEEDED = 10;
const UPVOTES_NEEDED = 50;

type Criterion = {
  key: string;
  icon: IconName;
  title: string;
  todo: string;
  met: (p: UserProfile) => boolean;
  metText: (p: UserProfile) => string;
  /** Explains exactly what to do. Rendered inline, never as an alert. */
  guide: string;
};

const CRITERIA: Criterion[] = [
  {
    key: 'activity',
    icon: 'chat-bubble-left-right',
    title: 'Active in SokoCircle',
    todo: `Publish ${POSTS_NEEDED}+ community posts from the Home feed.`,
    met: (p) => p.communityPosts >= POSTS_NEEDED,
    metText: (p) => `${p.communityPosts} community posts`,
    guide: `Open the Home tab, tap the compose button and publish ${POSTS_NEEDED} posts. Your counter is maintained automatically from your posts.`,
  },
  {
    key: 'reputation',
    icon: 'hand-thumb-up',
    title: 'Earned community reputation',
    todo: `Reach ${UPVOTES_NEEDED}+ helpful upvotes on your contributions.`,
    met: (p) => p.helpfulUpvotes >= UPVOTES_NEEDED,
    metText: (p) => `${p.helpfulUpvotes} helpful upvotes`,
    guide: `Upvotes are counted when another trader finds your post helpful, so publish actionable trade insights: prices, suppliers and negotiation tactics. ${UPVOTES_NEEDED} upvotes from other traders unlocks this.`,
  },
  {
    key: 'profile',
    icon: 'shield-check',
    title: 'Verified business profile',
    todo: 'Keep your business type and county on file.',
    met: (p) => Boolean(p.businessType && p.location),
    metText: () => 'Business details on file',
    guide: 'Add your business type and county from Account → Edit Profile so reviewers can identify your business.',
  },
];

type Props = {
  profile: UserProfile;
  /** Existing application, if any. `null` means they have never applied. */
  application: MentorApplication | null;
  /** Called after a successful submission so the parent can refetch. */
  onApplied: () => void;
};

export default function CredibilityLadder({ profile, application, onApplied }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isMentor = profile.tier === 'mentor';
  const pending = application?.status === 'pending';
  const rejected = application?.status === 'rejected';

  const metCount = CRITERIA.filter((c) => c.met(profile)).length;
  const total = CRITERIA.length;
  const pct = Math.round((metCount / total) * 100);
  const eligible = metCount === total && !isMentor && !pending;
  const unmet = CRITERIA.filter((c) => !c.met(profile));

  const handleApply = async () => {
    setSubmitting(true);
    setFormError(null);
    try {
      await applyForMentor();
      onApplied();
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : 'We could not submit your application. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
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
            {isMentor ? 'You are a Verified Mentor' : 'Apply to become a Verified Mentor'}
          </ThemedText>
          <ThemedText variant="bodyMd" color="rgba(255,255,255,0.75)" style={styles.subtitle}>
            Mentor traders unlock paid 1:1 consultations and set their own session price.
          </ThemedText>
        </View>
        <View style={styles.iconWrap}>
          <Icon name="trophy" size={22} color={colors.gold} variant="solid" />
        </View>
      </View>

      {isMentor ? (
        <View style={styles.verifiedRow}>
          <Icon name="check-badge" size={18} color={colors.gold} variant="solid" />
          <ThemedText variant="labelSm" color="rgba(255,255,255,0.9)" style={{ fontWeight: '700' }}>
            Mentor status is active — traders can now book 1:1 sessions with you.
          </ThemedText>
        </View>
      ) : (
        <>
          <View style={styles.progressRow}>
            <ThemedText
              variant="labelSm"
              color="rgba(255,255,255,0.8)"
              style={{ fontWeight: '500' }}
            >
              {metCount} of {total} criteria met
            </ThemedText>
            <ThemedText
              variant="labelSm"
              color={pending ? colors.gold : 'rgba(255,255,255,0.6)'}
              style={{ fontWeight: '700' }}
            >
              {pending
                ? 'Under review'
                : eligible
                  ? 'Ready to apply'
                  : `${total - metCount} remaining`}
            </ThemedText>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>

          {rejected && (
            <View style={styles.noteRow}>
              <Icon name="exclamation-triangle" size={16} color={colors.secondaryContainer} />
              <ThemedText variant="labelSm" color="rgba(255,255,255,0.9)" style={{ flex: 1 }}>
                {application?.review_note
                  ? `Previous application declined: ${application.review_note}`
                  : 'Your previous application was declined. Meet every criterion and apply again.'}
              </ThemedText>
            </View>
          )}

          <View style={styles.criteria}>
            {CRITERIA.map((c) => {
              const met = c.met(profile);
              const open = expanded === c.key;
              return (
                <View key={c.key} style={styles.criterionWrap}>
                  <Pressable
                    onPress={() => setExpanded(open ? null : c.key)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: open }}
                    accessibilityLabel={c.title}
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
                      <ThemedText
                        variant="labelSm"
                        color={met ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)'}
                        style={{ fontSize: 11, marginTop: 2 }}
                      >
                        {met ? c.metText(profile) : c.todo}
                      </ThemedText>
                    </View>
                    {!met && (
                      <View style={styles.actionChip}>
                        <ThemedText
                          variant="labelSm"
                          color={colors.gold}
                          style={{ fontSize: 11, fontWeight: '700' }}
                        >
                          How?
                        </ThemedText>
                      </View>
                    )}
                  </Pressable>
                  {open && !met && (
                    <ThemedText variant="labelSm" color="rgba(255,255,255,0.7)" style={styles.guide}>
                      {c.guide}
                    </ThemedText>
                  )}
                </View>
              );
            })}
          </View>

          {formError && (
            <View style={styles.noteRow}>
              <Icon name="exclamation-triangle" size={16} color={colors.errorContainer} />
              <ThemedText variant="labelSm" color={colors.errorContainer} style={{ flex: 1 }}>
                {formError}
              </ThemedText>
            </View>
          )}

          <View style={styles.footer}>
            <View style={{ flex: 1 }}>
              <ThemedText
                variant="labelSm"
                color="rgba(255,255,255,0.8)"
                style={{ fontSize: 12, fontWeight: '500' }}
              >
                {pending
                  ? 'Our team is reviewing your application.'
                  : eligible
                    ? 'You are eligible to apply.'
                    : `Unlock the remaining ${unmet.length} ${
                        unmet.length === 1 ? 'criterion' : 'criteria'
                      } to apply.`}
              </ThemedText>
            </View>
            <Pressable
              disabled={!eligible || submitting}
              onPress={() => void handleApply()}
              accessibilityRole="button"
              accessibilityLabel="Apply to become a Verified Mentor"
              style={[styles.applyBtn, !eligible && styles.applyBtnDisabled]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <ThemedText
                    variant="labelSm"
                    color={eligible ? colors.primary : 'rgba(255,255,255,0.6)'}
                    style={{ fontWeight: '700' }}
                  >
                    {pending ? 'Applied' : 'Apply Now'}
                  </ThemedText>
                  {eligible && <Icon name="arrow-right" size={16} color={colors.primary} />}
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
  criterionWrap: {
    borderRadius: 10,
  },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    minHeight: 44,
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
  guide: {
    fontSize: 11,
    paddingHorizontal: 4,
    paddingBottom: 10,
    lineHeight: 16,
  },
  actionChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
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
    minHeight: 44,
    borderRadius: 8,
  },
  applyBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});