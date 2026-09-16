import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedText from './ThemedText';
import Icon, { IconName } from './Icon';
import { colors } from '../theme/colors';
import { radii } from '../theme';
import { rgba } from '../utils/color';

type NotificationItem = {
  id: string;
  icon: IconName;
  title: string;
  body: string;
  timeAgo: string;
  unread?: boolean;
};

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    icon: 'hand-thumb-up',
    title: 'Your post was upvoted',
    body: 'Wanjiru K. and 12 others found your supplier guide helpful.',
    timeAgo: '5m ago',
    unread: true,
  },
  {
    id: 'notif-2',
    icon: 'chat-bubble-left-right',
    title: 'New comment on your post',
    body: 'Omondi A.: "Ksh 800 per unit for grade A? That is a good price..."',
    timeAgo: '1h ago',
    unread: true,
  },
  {
    id: 'notif-3',
    icon: 'check-badge',
    title: 'Verification approved',
    body: 'Your business KYC documents passed. Tier 1 badge is now live.',
    timeAgo: '1d ago',
  },
  {
    id: 'notif-4',
    icon: 'credit-card',
    title: 'M-Pesa payment received',
    body: 'KES 500.00 received for "Target Audience Spending Power" report.',
    timeAgo: '2d ago',
  },
  {
    id: 'notif-5',
    icon: 'sparkles',
    title: 'New mentor available',
    body: 'John M. (Electronics Importer) is now taking bookings.',
    timeAgo: '3d ago',
  },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function NotificationSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <ThemedText variant="headline" color={colors.primary} style={{ fontSize: 18 }}>
            Notifications
          </ThemedText>
          <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
            <Icon name="chevron-down" size={22} color={colors.outline} />
          </Pressable>
        </View>

        <FlatList
          data={NOTIFICATIONS}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.row,
                item.unread && styles.rowUnread,
              ]}
            >
              <View style={[styles.iconWrap, item.unread && styles.iconUnread]}>
                <Icon name={item.icon} size={18} color={item.unread ? colors.onPrimary : colors.secondary} variant="solid" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <ThemedText variant="labelSm" color={colors.primary} style={{ fontSize: 13, flex: 1 }}>
                    {item.title}
                  </ThemedText>
                  <ThemedText variant="labelSm" color={colors.outline} style={{ fontSize: 11, marginLeft: 8 }}>
                    {item.timeAgo}
                  </ThemedText>
                </View>
                <ThemedText variant="bodyMd" color={colors.onSurfaceVariant} style={{ fontSize: 13, marginTop: 2 }}>
                  {item.body}
                </ThemedText>
              </View>
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.outlineVariant,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: rgba(colors.outlineVariant, 0.2),
  },
  closeBtn: {
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  rowUnread: {
    backgroundColor: rgba(colors.secondaryContainer, 0.25),
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: rgba(colors.secondary, 0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUnread: {
    backgroundColor: colors.primary,
  },
});