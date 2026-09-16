import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
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
};

type Props = {
  title: string;
  leftIcon?: IconName;
  onLeftPress?: () => void;
  actions?: Action[];
  centerTitle?: boolean;
};

export default function TopAppBar({
  title,
  leftIcon,
  onLeftPress,
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
          {leftIcon && (
            <Pressable
              onPress={
                onLeftPress ??
                (() =>
                  Alert.alert(
                    'Change Location',
                    'Location selection is coming soon in the SokoCircle network.',
                  ))
              }
              hitSlop={8}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            >
              <Icon name={leftIcon} color={colors.primary} />
            </Pressable>
          )}
        </View>

        <ThemedText variant="headline" color={colors.primary} style={styles.title}>
          {title}
        </ThemedText>

        <View style={[styles.side, styles.right, { flex: centerTitle ? 1 : 0 }]}>
          {actions.map((a) => (
            <Pressable
              key={a.icon}
              onPress={() => handlePress(a)}
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
    padding: 6,
    borderRadius: 999,
  },
  pressed: {
    opacity: 0.6,
  },
});