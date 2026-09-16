import { LinearGradient } from 'expo-linear-gradient';
import React, { ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedText from '../../components/ThemedText';
import { colors } from '../../theme/colors';
import { radii, shadows } from '../../theme';

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthLayout({ title, subtitle, children, footer }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.outer,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primaryContainer, colors.primary, '#000814']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.brand}
        >
          <View style={styles.brandGlow} />
          <View style={styles.logoWrap}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <ThemedText variant="headline" color={colors.onPrimary} style={styles.brandName}>
            SokoCircle
          </ThemedText>
          <ThemedText variant="bodyMd" color={colors.primaryFixedDim} style={styles.brandTag}>
            Kenya's marketplace for MSME networks
          </ThemedText>
          <ThemedText variant="titleMd" color={colors.gold} style={styles.screenTitle}>
            {title}
          </ThemedText>
          <ThemedText variant="bodyMd" color={colors.primaryFixedDim} style={styles.screenSub}>
            {subtitle}
          </ThemedText>
        </LinearGradient>

        <View style={styles.card}>{children}</View>

        {footer}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  outer: { paddingHorizontal: 20 },

  brand: {
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    overflow: 'hidden',
    alignItems: 'center',
    ...shadows.card,
  },
  brandGlow: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(226, 162, 56, 0.12)',
  },
  logoWrap: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  logo: { width: 52, height: 52 },
  brandName: {
    fontSize: 26,
    marginBottom: 2,
  },
  brandTag: {
    fontSize: 13,
    opacity: 0.9,
    marginBottom: 22,
  },
  screenTitle: {
    fontSize: 22,
    marginBottom: 4,
  },
  screenSub: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.9,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radii['2xl'],
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    marginTop: -14,
    padding: 24,
    paddingBottom: 8,
    gap: 16,
    ...shadows.card,
  },
});