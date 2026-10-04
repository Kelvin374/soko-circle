import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon, { IconName } from './Icon';
import ThemedText from './ThemedText';
import NotificationSheet from './NotificationSheet';
import { colors } from '../theme/colors';
import { type } from '../theme/typography';

type Action = {
  icon: IconName;
  onPress?: () => void;
  color?: string;
  /** Defaults to the action `icon` when omitted. */
  accessibilityLabel?: string;
};

type Props = {
  title: string;
  leftIcon?: IconName;
  /** When omitted the leading icon is decorative (non-interactive). */
  onLeftPress?: () => void;
  leftAccessibilityLabel?: string;
  actions?: Action[];
  centerTitle?: boolean;
};

export default function TopAppBar({
  title,
  leftIcon,
  onLeftPress,
  leftAccessibilityLabel,
  actions = [],
  centerTitle = true,
}: Props) {
  const insets = useSafeAreaInsets();
  const [notifOpen, setNotifOpen] = useState(false);

  const handlePress = (a: Action) => {
    if (a.onPress) {
      a.onPress();
    } else if (a.icon === 'bell') {
      setNotifOpen(true);
    }
  };

  return (
    <>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 12, height: insets.top + 64 },
        ]}
      >
        <View style={[styles.side, { flex: centerTitle ? 1 : 0 }]}>
          {leftIcon &&
            (onLeftPress ? (
              <Pressable
                onPress={onLeftPress}
                accessibilityRole="button"
                accessibilityLabel={leftAccessibilityLabel ?? title}
                hitSlop={8}
                style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              >
                <Icon name={leftIcon} color={colors.primary} />
              </Pressable>
            ) : (
              <View style={styles.iconBtn} accessibilityElementsHidden>
                <Icon name={leftIcon} color={colors.primary} />
              </View>
            ))}
        </View>

        <ThemedText variant="headline" color={colors.primary} style={styles.title}>
          {title}
        </ThemedText>

        <View style={[styles.side, styles.right, { flex: centerTitle ? 1 : 0 }]}>
          {actions.map((a) => (
            <Pressable
              key={a.icon}
              onPress={() => handlePress(a)}
              accessibilityRole="button"
              accessibilityLabel={a.accessibilityLabel ?? a.icon}
              hitSlop={8}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            >
              <Icon name={a.icon} color={a.color ?? colors.primary} />
            </Pressable>
          ))}
        </View>
      </View>

      <NotificationSheet visible={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(251,249,244,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  right: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  title: {
    textAlign: 'center',
    fontFamily: type.headline.fontFamily,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.6,
  },
});