import React, { useState } from 'react';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import SignInScreen from './SignInScreen';
import SignUpScreen from './SignUpScreen';

export default function AuthFlow() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up' | 'forgot'>('sign-in');

  if (mode === 'sign-up') {
    return <SignUpScreen onSignIn={() => setMode('sign-in')} />;
  }
  if (mode === 'forgot') {
    return <ForgotPasswordScreen onBack={() => setMode('sign-in')} />;
  }
  return (
    <SignInScreen
      onForgot={() => setMode('forgot')}
      onSignUp={() => setMode('sign-up')}
    />
  );
}