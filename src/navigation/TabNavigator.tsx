import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import NavIcon from '../components/NavIcon';
import ThemedText from '../components/ThemedText';
import { IconName } from '../components/Icon';
import { colors } from '../theme/colors';
import HomeScreen from '../screens/home/HomeScreen';
import ExploreScreen from '../screens/explore/ExploreScreen';
import GapMapScreen from '../screens/gapmap/GapMapScreen';
import SuppliersScreen from '../screens/suppliers/SuppliersScreen';
import AccountScreen from '../screens/account/AccountScreen';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

type TabConfig = {
  name: keyof TabParamList;
  component: React.ComponentType;
  title: string;
  icon: IconName;
  outline: IconName;
};

const TABS: TabConfig[] = [
  { name: 'Home', component: HomeScreen, title: 'Home', icon: 'home', outline: 'home' },
  { name: 'Explore', component: ExploreScreen, title: 'Explore', icon: 'globe-alt', outline: 'globe-alt' },
  { name: 'GapMap', component: GapMapScreen, title: 'GapMap', icon: 'map', outline: 'map' },
  { name: 'Suppliers', component: SuppliersScreen, title: 'Suppliers', icon: 'cube', outline: 'cube' },
  { name: 'Account', component: AccountScreen, title: 'Account', icon: 'user', outline: 'user' },
];

const styles = StyleSheet.create({
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
  tabLabel: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});

const screenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarStyle: styles.tabBar,
  tabBarActiveTintColor: colors.onSecondaryContainer,
  tabBarInactiveTintColor: colors.onSurfaceVariant,
  tabBarHideOnKeyboard: true,
};

export default function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            title: tab.title,
            tabBarAccessibilityLabel: `${tab.title} tab`,
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
              <ThemedText
                variant="labelSm"
                color={focused ? colors.primary : color}
                style={[styles.tabLabel, focused && styles.tabLabelActive]}
              >
                {tab.title}
              </ThemedText>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
