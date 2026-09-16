import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ThemedText from './ThemedText';
import Icon from './Icon';
import { colors } from '../theme/colors';
import { radii } from '../theme';
import { rgba } from '../utils/color';
import { PostComment } from '../types';
import { addComment, fetchComments } from '../lib/api';

const MOCK_COMMENTS: PostComment[] = [
  {
    id: 'mock-comment-1',
    authorName: 'Omondi A.',
    body: 'Ksh 800 per unit for grade A? That is a good price, thanks for sharing!',
    createdAt: '1h ago',
  },
  {
    id: 'mock-comment-2',
    authorName: 'Faith N.',
    body: 'Could you share the negotiation tactics as a follow-up post? Would really help.',
    createdAt: '3h ago',
  },
];

type Props = {
  visible: boolean;
  postId: string;
  onClose: () => void;
};

export default function PostComments({ visible, postId, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!visible || !postId) return;
    setLoading(true);
    fetchComments(postId)
      .then(setComments)
      .catch(() => setComments(MOCK_COMMENTS))
      .finally(() => setLoading(false));
  }, [visible, postId]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setComments((prev) => [
      ...prev,
      { id: Date.now().toString(), authorName: 'You', body: trimmed, createdAt: 'Just now' },
    ]);
    setText('');
    try {
      await addComment(postId, 'You', trimmed);
    } catch {
      // offline / demo mode: comment stays local
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}
      >
        <View style={styles.handle} />

        <View style={styles.header}>
          <ThemedText variant="headline" color={colors.primary} style={{ fontSize: 18 }}>
            Comments
          </ThemedText>
          <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
            <Icon name="chevron-down" size={22} color={colors.outline} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : comments.length === 0 ? (
          <View style={styles.centered}>
            <Icon name="chat-bubble-left-right" size={36} color={colors.outlineVariant} />
            <ThemedText variant="bodyMd" color={colors.outline} style={{ marginTop: 8 }}>
              No comments yet. Be the first to reply.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <View style={styles.commentAvatar}>
                  <ThemedText variant="labelSm" color={colors.primary} style={{ fontSize: 11, fontWeight: '700' }}>
                    {item.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <ThemedText variant="labelSm" color={colors.primary} style={{ fontSize: 13 }}>
                      {item.authorName}
                    </ThemedText>
                    <ThemedText variant="labelSm" color={colors.outline} style={{ fontSize: 11 }}>
                      {item.createdAt}
                    </ThemedText>
                  </View>
                  <ThemedText variant="bodyMd" color={colors.onSurfaceVariant} style={{ marginTop: 2, fontSize: 14 }}>
                    {item.body}
                  </ThemedText>
                </View>
              </View>
            )}
          />
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor={colors.outline}
            value={text}
            onChangeText={setText}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={[styles.sendBtn, (!text.trim() || sending) && { opacity: 0.4 }]}
          >
            <Icon name="paper-airplane" size={18} color={colors.onPrimary} variant="solid" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: 16,
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: rgba(colors.outlineVariant, 0.2),
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.onSurface,
    maxHeight: 80,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
