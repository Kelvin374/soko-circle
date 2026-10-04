import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Explore: { category?: string } | undefined;
  GapMap: { category?: string; location?: string } | undefined;
  Suppliers: { category?: string; county?: string } | undefined;
  Account: undefined;
};

/**
 * Every screen that can be pushed on top of the bottom tabs. Each entry is also
 * reachable through the `sokocircle://` deep-link map in `src/navigation/linking.ts`.
 */
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  ResetPassword: { status?: 'ready' | 'expired' | 'error'; message?: string } | undefined;
};

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}