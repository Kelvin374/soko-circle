import React, { useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import Icon from '../../components/Icon';
import ThemedText from '../../components/ThemedText';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import AuthButton from './AuthButton';
import AuthField from './AuthField';
import AuthLayout from './AuthLayout';
import { AuthErrorBanner, AuthSwitch, isValidEmail } from './AuthShared';

type Props = {
  onBack: () => void;
};

export default function ForgotPasswordScreen({ onBack }: Props) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSend = async () => {
    Keyboard.dismiss();
    setFormError(null);
    const valid = isValidEmail(email);
    setEmailError(valid ? null : 'Enter a valid email address.');
    if (!valid) return;

    setSubmitting(true);
    const result = await resetPassword(email.trim());
    setSubmitting(false);
    if (result.ok) {
      setSentTo(email.trim());
    } else {
      setFormError(result.error);
    }
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="We'll email you a secure link to set a new password."
      footer={<AuthSwitch prompt="Remembered it?" link="Back to Sign In" onPress={onBack} />}
    >
      {sentTo ? (
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Icon name="envelope" size={26} color={colors.success} variant="solid" />
          </View>
          <ThemedText variant="titleMd" color={colors.primary} style={styles.successTitle}>
            Reset link sent
          </ThemedText>
          <ThemedText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.successText}>
            Check {sentTo} for a link to reset your password. It expires in 30 minutes.
          </ThemedText>
          <AuthButton label="Back to Sign In" onPress={onBack} />
        </View>
      ) : (
        <>
          {formError && <AuthErrorBanner message={formError} />}

          <AuthField
            label="Email"
            icon="envelope"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (emailError) setEmailError(null);
              if (formError) setFormError(null);
            }}
            placeholder="you@business.co.ke"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="go"
            onSubmitEditing={handleSend}
            error={emailError}
          />

          <AuthButton label="Send Reset Link" icon="paper-airplane" onPress={handleSend} loading={submitting} />
        </>
      )}
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  successCard: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(31, 110, 74, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 20,
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
});