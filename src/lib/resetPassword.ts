import { supabase } from './supabase';

/**
 * Password-recovery links arrive as `sokocircle://reset-password` plus either
 * a PKCE `?code=...` query or an implicit-flow `#access_token=...` fragment.
 *
 * Supabase-js is configured with `detectSessionInUrl: false` (React Native has
 * no DOM history to clean up), so we have to redeem the tokens ourselves.
 */

export const RESET_PASSWORD_PATH = 'reset-password';
export const RESET_PASSWORD_REDIRECT = `sokocircle://${RESET_PASSWORD_PATH}`;

export type RecoveryTokens = {
  code?: string;
  accessToken?: string;
  refreshToken?: string;
  errorCode?: string;
  errorDescription?: string;
};

/** Splits the URL into path + merged query/hash params. */
export function parseRecoveryUrl(rawUrl: string): {
  path: string;
  tokens: RecoveryTokens;
} {
  const [beforeHash = '', ...hashRest] = rawUrl.split('#');
  const hash = hashRest.join('#');
  const [pathPart = '', ...queryRest] = beforeHash.split('?');
  const query = queryRest.join('?');

  const params = new Map<string, string>();
  for (const chunk of [query, hash]) {
    if (!chunk) continue;
    for (const pair of chunk.split('&')) {
      if (!pair) continue;
      const eq = pair.indexOf('=');
      const key = eq === -1 ? pair : pair.slice(0, eq);
      const value = eq === -1 ? '' : pair.slice(eq + 1);
      try {
        params.set(decodeURIComponent(key), decodeURIComponent(value.replace(/\+/g, ' ')));
      } catch {
        params.set(key, value);
      }
    }
  }

  const path = pathPart.replace(/^[a-z0-9+.-]+:\/\//i, '').replace(/^\/+/, '');
  const tokens: RecoveryTokens = {
    code: params.get('code') ?? undefined,
    accessToken: params.get('access_token') ?? undefined,
    refreshToken: params.get('refresh_token') ?? undefined,
    errorCode: params.get('error_code') ?? params.get('error') ?? undefined,
    errorDescription: params.get('error_description') ?? undefined,
  };

  return { path, tokens };
}

export function isResetPasswordUrl(rawUrl: string): boolean {
  return parseRecoveryUrl(rawUrl).path === RESET_PASSWORD_PATH;
}

/**
 * Session tokens must never be forwarded into React Navigation state (they would
 * end up in devtools, logs and persisted navigation state). Instead the tokens
 * are redeemed here and only a `?status=` flag is passed on.
 *
 * `undefined` = nothing resolved yet, `null` = nothing to resolve.
 */
let cachedInitialUrl: string | null | undefined;

export function peekResolvedInitialUrl(): string | null | undefined {
  return cachedInitialUrl;
}

export async function resolveDeepLinkUrl(rawUrl: string): Promise<string> {
  if (!isResetPasswordUrl(rawUrl)) return rawUrl;

  const { tokens } = parseRecoveryUrl(rawUrl);
  const result = await redeemRecoveryTokens(tokens);

  if (result.ok) return `sokocircle://${RESET_PASSWORD_PATH}?status=ready`;

  const params = new URLSearchParams({
    status: result.expired ? 'expired' : 'error',
    message: result.error,
  });
  return `sokocircle://${RESET_PASSWORD_PATH}?${params.toString()}`;
}

/**
 * Warms the cache on cold start. Called once from `App` before the navigator
 * mounts so a launch-time recovery link is not missed.
 */
export async function primeRecoveryDeepLink(): Promise<string | null | undefined> {
  if (cachedInitialUrl !== undefined) return cachedInitialUrl;

  let raw: string | null = null;
  try {
    const { getInitialURL } = await import('expo-linking');
    raw = await getInitialURL();
  } catch {
    raw = null;
  }

  if (!raw) {
    cachedInitialUrl = null;
    return cachedInitialUrl;
  }

  cachedInitialUrl = await resolveDeepLinkUrl(raw);
  return cachedInitialUrl;
}

export type RecoveryResult = { ok: true } | { ok: false; error: string; expired: boolean };

/** Exchanges the recovery tokens for a real session. */
export async function redeemRecoveryTokens(tokens: RecoveryTokens): Promise<RecoveryResult> {
  if (tokens.errorCode) {
    const expired = tokens.errorCode === 'otp_expired' || tokens.errorCode === 'access_denied';
    return {
      ok: false,
      expired,
      error:
        tokens.errorDescription ??
        (expired
          ? 'This reset link has expired. Request a new one to continue.'
          : 'This reset link is no longer valid. Request a new one to continue.'),
    };
  }

  try {
    if (tokens.code) {
      const { error } = await supabase.auth.exchangeCodeForSession(tokens.code);
      if (error) return { ok: false, expired: true, error: error.message };
      return { ok: true };
    }

    if (tokens.accessToken && tokens.refreshToken) {
      const { error } = await supabase.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
      if (error) return { ok: false, expired: true, error: error.message };
      return { ok: true };
    }
  } catch (e) {
    return {
      ok: false,
      expired: true,
      error: e instanceof Error ? e.message : 'Could not validate the reset link.',
    };
  }

  return {
    ok: false,
    expired: true,
    error: 'This reset link is missing its security token. Request a new one to continue.',
  };
}

/**
 * Completes the flow by setting the new password on the recovered session. The
 * session stays active, so the user lands straight back in the app.
 */
export async function updatePassword(password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.updateUser({ password });
  return { error: error ? error.message : null };
}