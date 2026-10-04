import React, { useMemo, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedText from '../../components/ThemedText';
import ErrorState from '../../components/ErrorState';
import AuthButton from './AuthButton';
import AuthField from './AuthField';
import { AuthErrorBanner } from './AuthShared';
import { updatePassword } from '../../lib/resetPassword';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';

const MIN_PASSWORD = 8;

type Nav = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
type ResetRoute = RouteProp<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<ResetRoute>();

  const status = params?.status ?? 'ready';
  const message = params?.message;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const canSubmit = useMemo(
    () => password.length >= MIN_PASSWORD && password === confirm && !submitting,
    [password, confirm, submitting],
  );

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setFormError(null);

    const pError =
      password.length < MIN_PASSWORD ? `Use at least ${MIN_PASSWORD} characters.` : null;
    const cError = confirm !== password ? 'Passwords do not match.' : null;
    setPasswordError(pError);
    setConfirmError(cError);
    if (pError || cError) return;

    setSubmitting(true);
    const { error } = await updatePassword(password);
    setSubmitting(false);

    if (error) {
      setFormError(error);
      return;
    }
    setDone(true);
  };

  if (status === 'expired' || status === 'error') {
    return (
      <SafeAreaView style={styles.screen} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ErrorState
            icon="exclamation-triangle"
            title={status === 'expired' ? 'This link has expired' : 'We could not verify that link'}
            message={
              message ??
              'Password reset links are single-use and short-lived. Request a fresh one from the sign-in screen.'
            }
          />
          <AuthButton
            label="Back to Sign In"
            icon="arrow-left"
            onPress={goBack}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={styles.screen} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <ThemedText variant="titleMd" color={colors.success}>
                ✓
              </ThemedText>
            </View>
            <ThemedText variant="headline" color={colors.primary} style={styles.centered}>
              Password updated
            </ThemedText>
<ThemedText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.centered}>
                Your new password is live and you are signed in on this device.
              </ThemedText>
            <AuthButton
              label="Continue to SokoCircle"
              onPress={goBack}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <ThemedText variant="titleMd" color={colors.primary}>
            Choose a new password
          </ThemedText>
          <ThemedText variant="bodyMd" color={colors.onSurfaceVariant}>
            Use at least {MIN_PASSWORD} characters. You will stay signed in on this device
            afterwards.
          </ThemedText>
        </View>

        {formError && <AuthErrorBanner message={formError} />}

        <AuthField
          label="New password"
          icon="lock-closed"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setPasswordError(null);
            setFormError(null);
          }}
          secure
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          error={passwordError}
        />

        <AuthField
          label="Confirm password"
          icon="lock-closed"
          value={confirm}
          onChangeText={(t) => {
            setConfirm(t);
            setConfirmError(null);
            setFormError(null);
          }}
          secure
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          error={confirmError}
        />

        <AuthButton
          label="Update Password"
          icon="shield-check"
          onPress={handleSubmit}
          loading={submitting}
          disabled={!canSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 16, flexGrow: 1, justifyContent: 'center' },
  header: { gap: 6 },
  centered: { textAlign: 'center' },
  successCard: { alignItems: 'center', gap: 12 },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(31, 110, 74, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});