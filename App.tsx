import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { colors } from './src/theme/colors';
import AuthFlow from './src/screens/auth/AuthFlow';
import BusinessOnboardingScreen from './src/screens/onboarding/BusinessOnboardingScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { linking, primeRecoveryDeepLink } from './src/navigation/linking';

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

function MainApp() {
  const { user, initializing, onboardingChecked, needsOnboarding } = useAuth();

  // Redeems a launch-time `sokocircle://reset-password` link before the
  // navigator mounts, so the recovery session is ready by the time we render.
  useEffect(() => {
    void primeRecoveryDeepLink();
  }, []);

  if (initializing || (user && !onboardingChecked)) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <>
        <StatusBar style="dark" />
        <AuthFlow />
      </>
    );
  }

  if (needsOnboarding) {
    return (
      <>
        <StatusBar style="dark" />
        <BusinessOnboardingScreen />
      </>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});