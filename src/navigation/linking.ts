import type { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import {
  peekResolvedInitialUrl,
  primeRecoveryDeepLink,
  resolveDeepLinkUrl,
} from '../lib/resetPassword';
import type { RootStackParamList } from './types';

export const DEEP_LINK_PREFIXES = ['sokocircle://'];

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: DEEP_LINK_PREFIXES,
  config: {
    screens: {
      Tabs: {
        screens: {
          Home: 'home',
          Explore: 'explore',
          GapMap: 'gapmap',
          Suppliers: 'suppliers',
          Account: 'account',
        },
      },
      ResetPassword: 'reset-password',
    },
  },
  async getInitialURL() {
    // `App` already resolved the launch URL on mount (recovery tokens are
    // redeemed there); fall back to expo-linking if that never ran.
    const cached = peekResolvedInitialUrl();
    if (cached !== undefined) return cached ?? undefined;

    const url = await Linking.getInitialURL();
    return url ? resolveDeepLinkUrl(url) : undefined;
  },
  subscribe(listener) {
    let cancelled = false;
    let queue: Promise<void> = Promise.resolve();

    const subscription = Linking.addEventListener('url', ({ url }: { url: string }) => {
      queue = queue.then(async () => {
        const routeUrl = await resolveDeepLinkUrl(url);
        if (!cancelled) listener(routeUrl);
      });
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  },
};

export { primeRecoveryDeepLink };