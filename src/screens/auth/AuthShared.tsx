import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Icon from '../../components/Icon';
import ThemedText from '../../components/ThemedText';
import { colors } from '../../theme/colors';
import { radii } from '../../theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function AuthErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.errorBanner}>
      <Icon name="exclamation-triangle" size={18} color={colors.error} />
      <ThemedText
        variant="bodyMd"
        color={colors.error}
        style={[styles.bannerText, { flex: 1 }]}
      >
        {message}
      </ThemedText>
    </View>
  );
}

export function AuthSwitch({
  prompt,
  link,
  onPress,
}: {
  prompt: string;
  link: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.switchRow}>
      <ThemedText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.switchPrompt}>
        {prompt}
      </ThemedText>
      <Pressable onPress={onPress} hitSlop={8}>
        <ThemedText variant="labelSm" color={colors.secondary} style={styles.switchLink}>
          {link}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.errorContainer,
    borderRadius: radii.lg,
    padding: 12,
  },
  bannerText: {
    fontSize: 13,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  switchPrompt: {
    fontSize: 14,
  },
  switchLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});