import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Icon, { IconName } from '../../components/Icon';
import ThemedText from '../../components/ThemedText';
import { colors } from '../../theme/colors';
import { radii } from '../../theme';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
};

export default function AuthButton({ label, onPress, loading, disabled, icon }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && !isDisabled && styles.pressed]}
    >
      <LinearGradient
        colors={disabled ? [colors.outlineVariant, colors.outlineVariant] : [colors.primaryContainer, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <View style={styles.row}>
            <ThemedText
              variant="labelSm"
              color={disabled ? colors.onSurfaceVariant : colors.onPrimary}
              style={styles.label}
            >
              {label}
            </ThemedText>
            {icon && <Icon name={icon} size={18} color={colors.onPrimary} />}
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
  },
  gradient: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 15,
    letterSpacing: 0.3,
    fontWeight: '700',
  },
});