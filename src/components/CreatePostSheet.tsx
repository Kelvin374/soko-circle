import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import ThemedText from './ThemedText';
import Icon from './Icon';
import { colors } from '../theme/colors';
import { radii } from '../theme';
import { rgba } from '../utils/color';
import { createPost, uploadPostImage } from '../lib/api';

const CATEGORIES = ['Supply Chain', 'Mitumba', 'Electronics', 'Hardware', 'Financing'];

const MIN_TITLE = 3;
const MIN_BODY = 10;

type Props = {
  visible: boolean;
  authorName: string;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreatePostSheet({ visible, authorName, onClose, onCreated }: Props) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle('');
    setBody('');
    setCategory(null);
    setImageUri(null);
    setError(null);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const canSubmit = title.trim().length >= MIN_TITLE && body.trim().length >= MIN_BODY && !submitting;

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'Allow photo access so you can attach an image to your post.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      if (error) setError(null);
    }
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (trimmedTitle.length < MIN_TITLE) {
      setError(`Give your post a title of at least ${MIN_TITLE} characters.`);
      return;
    }
    if (trimmedBody.length < MIN_BODY) {
      setError(`Add a little more detail — at least ${MIN_BODY} characters.`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (imageUri) {
        const uploaded = await uploadPostImage(imageUri);
        if (!uploaded) {
          setError('Could not upload your image. Check your connection, or remove the photo and post without it.');
          return;
        }
        imageUrl = uploaded;
      }
      await createPost({
        author_name: authorName,
        title: trimmedTitle,
        body: trimmedBody,
        category: category ?? undefined,
        image_url: imageUrl,
      });
      reset();
      onCreated();
    } catch {
      setError('Could not publish your post. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}
      >
        <View style={styles.handle} />

        <View style={styles.header}>
          <ThemedText variant="headline" color={colors.primary} style={{ fontSize: 18 }}>
            New Post
          </ThemedText>
          <Pressable onPress={handleClose} hitSlop={8} style={styles.closeBtn} disabled={submitting}>
            <Icon name="chevron-down" size={22} color={colors.outline} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error && (
            <View style={styles.errorBanner}>
              <Icon name="exclamation-triangle" size={18} color={colors.error} />
              <ThemedText variant="labelSm" color={colors.error} style={styles.errorText}>
                {error}
              </ThemedText>
            </View>
          )}

          <View style={styles.field}>
            <ThemedText variant="labelSm" color={colors.onSurfaceVariant} style={styles.fieldLabel}>
              Title
            </ThemedText>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (error) setError(null);
              }}
              placeholder="e.g. Where to source quality mtumba bales"
              placeholderTextColor={colors.outline}
              returnKeyType="next"
              maxLength={120}
            />
          </View>

          <View style={styles.field}>
            <ThemedText variant="labelSm" color={colors.onSurfaceVariant} style={styles.fieldLabel}>
              Details
            </ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={body}
              onChangeText={(t) => {
                setBody(t);
                if (error) setError(null);
              }}
              placeholder="Share prices, suppliers, negotiation tactics or a question..."
              placeholderTextColor={colors.outline}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <ThemedText variant="labelSm" color={colors.onSurfaceVariant} style={styles.fieldLabel}>
              Photo (optional)
            </ThemedText>
            {imageUri ? (
              <View style={styles.imagePreviewWrap}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <Pressable
                  style={styles.removeImageBtn}
                  hitSlop={8}
                  disabled={submitting}
                  onPress={() => setImageUri(null)}
                >
                  <ThemedText variant="labelSm" color={colors.onPrimary} style={{ fontSize: 12, fontWeight: '700' }}>
                    Remove
                  </ThemedText>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.attachBtn} onPress={pickImage} disabled={submitting}>
                <View style={styles.attachIcon}>
                  <Icon name="cpu-chip" size={20} color={colors.primary} variant="outline" />
                </View>
                <ThemedText variant="labelSm" color={colors.primary} style={{ fontSize: 13 }}>
                  Add a photo
                </ThemedText>
              </Pressable>
            )}
          </View>

          <View style={styles.field}>
            <ThemedText variant="labelSm" color={colors.onSurfaceVariant} style={styles.fieldLabel}>
              Category (optional)
            </ThemedText>
            <View style={styles.chipWrap}>
              {CATEGORIES.map((c) => {
                const active = category === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setCategory(active ? null : c)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <ThemedText
                      variant="labelSm"
                      color={active ? colors.onPrimary : colors.onSurfaceVariant}
                      style={{ fontSize: 12 }}
                    >
                      {c}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <>
                <ThemedText variant="labelSm" color={colors.onPrimary} style={{ fontWeight: '700' }}>
                  Publish
                </ThemedText>
                <Icon name="paper-airplane" size={18} color={colors.onPrimary} variant="solid" />
              </>
            )}
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
    maxHeight: '90%',
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
  content: {
    padding: 20,
    gap: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.errorContainer,
    borderRadius: radii.lg,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.onSurface,
    fontFamily: 'Inter_400Regular',
  },
  textArea: {
    minHeight: 120,
    maxHeight: 200,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 72,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
  },
  attachIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePreviewWrap: {
    height: 180,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerHigh,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,21,51,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: rgba(colors.outlineVariant, 0.5),
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: rgba(colors.outlineVariant, 0.2),
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
  },
  submitBtnDisabled: {
    backgroundColor: colors.outlineVariant,
  },
});
