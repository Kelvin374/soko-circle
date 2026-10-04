import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Icon, { IconName } from './Icon';
import ThemedText from './ThemedText';
import { colors } from '../theme/colors';
import { radii, shadows } from '../theme';

type Props = {
  title: string;
  message?: string;
  icon?: IconName;
  /** Optional primary call to action. Omit for read-only empty states. */
  actionLabel?: string;
  actionIcon?: IconName;
  onAction?: () => void;
  compact?: boolean;
};

/**
 * Honest "there is nothing here yet" state. Never used to paper over a failed
 * request — that is what `ErrorState` is for.
 */
export default function EmptyState({
  title,
  message,
  icon = 'squares-2x2',
  actionLabel,
  actionIcon = 'pencil-square',
  onAction,
  compact = false,
}: Props) {
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={26} color={colors.outline} variant="outline" />
      </View>
      <ThemedText variant="titleMd" color={colors.primary} style={styles.centered}>
        {title}
      </ThemedText>
      {message ? (
        <ThemedText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.centered}>
          {message}
        </ThemedText>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
        >
          <Icon name={actionIcon} size={16} color={colors.onSecondaryContainer} variant="solid" />
          <ThemedText variant="labelSm" color={colors.onSecondaryContainer}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
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
  wrapCompact: { paddingVertical: 24 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: { textAlign: 'center' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 6,
    minHeight: 44,
  },
  actionBtnPressed: { opacity: 0.85 },
});