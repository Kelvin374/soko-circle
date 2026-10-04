import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Icon, { IconName } from './Icon';
import ThemedText from './ThemedText';
import { colors } from '../theme/colors';
import { radii, shadows } from '../theme';

type Props = {
  /** Shown as the headline. Keep it specific — "Couldn't load suppliers". */
  title?: string;
  /** Optional detail line. Defaults to the error message when omitted. */
  message?: string;
  /** Human-readable error text. Falls back to a generic line. */
  error?: Error | string | null;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: IconName;
  compact?: boolean;
};

/**
 * Single source of truth for "the request failed" across every tab. Always
 * pair it with a real `onRetry` that re-runs the query.
 */
export default function ErrorState({
  title = 'Something went wrong',
  message,
  error,
  onRetry,
  retryLabel = 'Try again',
  icon = 'exclamation-triangle',
  compact = false,
}: Props) {
  const detail =
    message ??
    (typeof error === 'string'
      ? error
      : error?.message) ??
    'We could not reach SokoCircle. Check your connection and try again.';

  return (
    <View
      accessibilityRole="alert"
      style={[styles.wrap, compact && styles.wrapCompact]}
    >
      <View style={styles.iconWrap}>
        <Icon name={icon} size={26} color={colors.error} variant="outline" />
      </View>
      <ThemedText variant="titleMd" color={colors.primary} style={styles.centered}>
        {title}
      </ThemedText>
      <ThemedText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.centered}>
        {detail}
      </ThemedText>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          style={({ pressed }) => [styles.retryBtn, pressed && styles.retryBtnPressed]}
        >
          <ThemedText variant="labelSm" color={colors.onPrimary}>
            {retryLabel}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

export function ErrorStateLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} />
      <ThemedText variant="labelSm" color={colors.onSurfaceVariant}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(21,42,74,0.06)',
    ...shadows.card,
  },
  wrapCompact: {
    paddingVertical: 24,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: { textAlign: 'center' },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 6,
    minHeight: 44,
  },
  retryBtnPressed: { opacity: 0.85 },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 32,
  },
});