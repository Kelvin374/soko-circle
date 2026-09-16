import React, { useState } from 'react';
import { Keyboard, Pressable, StyleSheet } from 'react-native';
import ThemedText from '../../components/ThemedText';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import AuthButton from './AuthButton';
import AuthField from './AuthField';
import AuthLayout from './AuthLayout';
import { AuthErrorBanner, AuthSwitch, isValidEmail } from './AuthShared';

type Props = {
  onForgot: () => void;
  onSignUp: () => void;
};

export default function SignInScreen({ onForgot, onSignUp }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async () => {
    Keyboard.dismiss();
    setFormError(null);
    setEmailError(isValidEmail(email) ? null : 'Enter a valid email address.');
    setPasswordError(password ? null : 'Enter your password.');
    if (!isValidEmail(email) || !password) return;

    setSubmitting(true);
    const error = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) setFormError(error);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your trade network — your market waits."
      footer={
        <AuthSwitch
          prompt="New to SokoCircle?"
          link="Create an account"
          onPress={onSignUp}
        />
      }
    >
      {formError && <AuthErrorBanner message={formError} />}

      <AuthField
        label="Email"
        icon="envelope"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          if (emailError) setEmailError(null);
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
        }}
        placeholder="••••••••"
        secure
        autoCapitalize="none"
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSignIn}
        error={passwordError}
      />

      <Pressable onPress={onForgot} hitSlop={8} style={styles.forgotWrap}>
        <ThemedText variant="labelSm" color={colors.secondary} style={styles.forgot}>
          Forgot password?
        </ThemedText>
      </Pressable>

      <AuthButton label="Sign In" icon="arrow-right" onPress={handleSignIn} loading={submitting} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: -6,
  },
  forgot: {
    fontSize: 13,
    fontWeight: '700',
  },
});