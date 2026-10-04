import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedText from './ThemedText';
import Icon from './Icon';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import { colors } from '../theme/colors';
import { radii } from '../theme';
import { rgba } from '../utils/color';
import {
  fetchNotifications,
  markNotificationsRead,
  notificationIcon,
  type AppNotification,
} from '../lib/api';
import { useAsyncData } from '../hooks/useAsyncData';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function NotificationSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [marking, setMarking] = useState(false);
  const [actionError, setActionError] = useState<Error | null>(null);
  const { data, loading, error, reload } = useAsyncData<AppNotification[]>(
    async () => (visible ? await fetchNotifications() : []),
    [visible],
  );

  const items = data ?? [];
  const displayError = actionError ?? error;

  const handleMarkAllRead = async () => {
    setMarking(true);
    setActionError(null);
    try {
      await markNotificationsRead();
      reload();
    } catch (e) {
      setActionError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setMarking(false);
    }
  };

  const hasUnread = items.some((n) => !n.read_at);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <ThemedText variant="headline" color={colors.primary} style={{ fontSize: 18 }}>
            Notifications
          </ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {hasUnread && (
              <Pressable
                onPress={() => void handleMarkAllRead()}
                disabled={marking}
                accessibilityRole="button"
                accessibilityLabel="Mark all notifications as read"
                hitSlop={8}
                style={styles.markAllBtn}
              >
                {marking ? (
                  <ActivityIndicator size="small" color={colors.secondary} />
                ) : (
                  <ThemedText variant="labelSm" color={colors.secondary} style={{ fontWeight: '700' }}>
                    Mark all read
                  </ThemedText>
                )}
              </Pressable>
            )}
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <Icon name="chevron-down" size={22} color={colors.outline} />
            </Pressable>
          </View>
        </View>

        {loading && items.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : displayError ? (
          <ErrorState
            compact
            title="Couldn't load notifications"
            error={displayError}
            onRetry={reload}
          />
        ) : items.length === 0 ? (
          <EmptyState
            compact
            icon="bell"
            title="No notifications yet"
            message="Likes, comments and account updates will show up here."
          />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(n) => n.id}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.primary} />
            }
            renderItem={({ item }) => {
              const unread = !item.read_at;
              return (
                <View style={[styles.row, unread && styles.rowUnread]}>
                  <View style={[styles.iconWrap, unread && styles.iconUnread]}>
                    <Icon
                      name={notificationIcon(item.kind)}
                      size={18}
                      color={unread ? colors.onPrimary : colors.secondary}
                      variant="solid"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <ThemedText
                        variant="labelSm"
                        color={colors.primary}
                        style={{ fontSize: 13, flex: 1 }}
                      >
                        {item.title}
                      </ThemedText>
                      <ThemedText
                        variant="labelSm"
                        color={colors.outline}
                        style={{ fontSize: 11, marginLeft: 8 }}
                      >
                        {item.timeAgo}
                      </ThemedText>
                    </View>
                    <ThemedText
                      variant="bodyMd"
                      color={colors.onSurfaceVariant}
                      style={{ fontSize: 13, marginTop: 2 }}
                    >
                      {item.body}
                    </ThemedText>
                  </View>
                </View>
              );
            }}
          />
        )}
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
  markAllBtn: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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