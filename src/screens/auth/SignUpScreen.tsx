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
  onSignIn: () => void;
};

export default function SignUpScreen({ onSignIn }: Props) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);

  const handleSignUp = async () => {
    Keyboard.dismiss();
    setFormError(null);
    const validName = fullName.trim().length >= 2;
    const validEmail = isValidEmail(email);
    const validPassword = password.length >= 6;
    setNameError(validName ? null : 'Enter your full name.');
    setEmailError(validEmail ? null : 'Enter a valid email address.');
    setPasswordError(validPassword ? null : 'Password must be at least 6 characters.');
    if (!validName || !validEmail || !validPassword) return;

    setSubmitting(true);
    const { error, needsEmailConfirmation } = await signUp(fullName.trim(), email.trim(), password);
    setSubmitting(false);
    if (error) {
      setFormError(error);
    } else if (needsEmailConfirmation) {
      setConfirmationEmail(email.trim());
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join verified MSME owners building trust across counties."
      footer={
        <AuthSwitch
          prompt="Already have an account?"
          link="Sign in"
          onPress={onSignIn}
        />
      }
    >
      {confirmationEmail ? (
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Icon name="check-circle" size={26} color={colors.success} variant="solid" />
          </View>
          <ThemedText variant="titleMd" color={colors.primary} style={styles.successTitle}>
            Check your inbox
          </ThemedText>
          <ThemedText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.successText}>
            We sent a confirmation link to {confirmationEmail}. Tap it to activate your
            account, then sign in.
          </ThemedText>
          <AuthButton label="Back to Sign In" onPress={onSignIn} />
        </View>
      ) : (
        <>
          {formError && <AuthErrorBanner message={formError} />}

          <AuthField
            label="Full Name"
            icon="user"
            value={fullName}
            onChangeText={(t) => {
              setFullName(t);
              if (nameError) setNameError(null);
              if (formError) setFormError(null);
            }}
            placeholder="e.g. Wanjiru Kamau"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            error={nameError}
          />

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
            returnKeyType="next"
            error={emailError}
          />

          <AuthField
            label="Password"
            icon="lock-closed"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (passwordError) setPasswordError(null);
              if (formError) setFormError(null);
            }}
            placeholder="At least 6 characters"
            secure
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={handleSignUp}
            error={passwordError}
          />

          <AuthButton
            label="Create Account"
            icon="arrow-right"
            onPress={handleSignUp}
            loading={submitting}
          />
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