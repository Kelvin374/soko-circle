import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
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
import NavIcon from './src/components/NavIcon';
import { IconName } from './src/components/Icon';
import ThemedText from './src/components/ThemedText';
import { colors } from './src/theme/colors';
import AuthFlow from './src/screens/auth/AuthFlow';
import BusinessOnboardingScreen from './src/screens/onboarding/BusinessOnboardingScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import HomeScreen from './src/screens/home/HomeScreen';
import ExploreScreen from './src/screens/explore/ExploreScreen';
import GapMapScreen from './src/screens/gapmap/GapMapScreen';
import SuppliersScreen from './src/screens/suppliers/SuppliersScreen';
import AccountScreen from './src/screens/account/AccountScreen';

const Tab = createBottomTabNavigator();

type TabConfig = {
  name: string;
  component: React.ComponentType;
  icon: IconName;
  outline: IconName;
};

const TABS: TabConfig[] = [
  { name: 'Home', component: HomeScreen, icon: 'home', outline: 'home' },
  { name: 'Explore', component: ExploreScreen, icon: 'globe-alt', outline: 'globe-alt' },
  { name: 'GapMap', component: GapMapScreen, icon: 'map', outline: 'map' },
  { name: 'Suppliers', component: SuppliersScreen, icon: 'cube', outline: 'cube' },
  { name: 'Account', component: AccountScreen, icon: 'user', outline: 'user' },
];

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

function MainApp() {
  const { user, initializing, onboardingChecked, needsOnboarding } = useAuth();

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
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.onSecondaryContainer,
          tabBarInactiveTintColor: colors.onSurfaceVariant,
          tabBarLabelStyle: styles.tabLabel,
          tabBarHideOnKeyboard: true,
        }}
      >
        {TABS.map((tab) => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={tab.component}
            options={{
              tabBarIcon: ({ focused, color }) => (
                <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                  <NavIcon
                    name={tab.icon}
                    outline={tab.outline}
                    focused={focused}
                    size={24}
                    color={focused ? colors.primary : color}
                  />
                </View>
              ),
              tabBarLabel: ({ focused, color }) => (
                <View style={[styles.labelWrap, focused && styles.labelWrapActive]}>
                  <ThemedText
                    variant="labelSm"
                    color={focused ? colors.primary : color}
                    style={[styles.tabLabel, focused && styles.tabLabelActive]}
                  >
                    {tab.name}
                  </ThemedText>
                </View>
              ),
            }}
          />
        ))}
      </Tab.Navigator>
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
  tabBar: {
    backgroundColor: 'rgba(251, 249, 244, 0.8)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 84,
    paddingTop: 8,
    paddingBottom: 18,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#152a4a',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 10,
    position: 'absolute',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
  },
  iconWrapActive: {
    backgroundColor: colors.secondaryContainer,
  },
  labelWrap: {
    alignItems: 'center',
  },
  labelWrapActive: {},
  tabLabel: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});