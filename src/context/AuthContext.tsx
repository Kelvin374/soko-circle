import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type ResetPasswordResult = { ok: true } | { ok: false; error: string };

export type OnboardingInput = {
  fullName: string;
  businessType: string;
  location: string;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  initializing: boolean;
  onboardingChecked: boolean;
  needsOnboarding: boolean;
  fullName: string;
  email: string;
  completeOnboarding: (input: OnboardingInput) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<ResetPasswordResult>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const RESET_PASSWORD_REDIRECT = 'sokocircle://reset-password';

function rateLimitMessage(operation: string): string {
  return (
    `Too many ${operation} attempts from this network (Supabase rate limit). ` +
    'Wait about 30–60 minutes, or in Supabase go to Authentication → Sign In / ' +
    'Providers → Email and turn off "Confirm email" so sign-ups succeed instantly.'
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const userId = session?.user?.id ?? null;
  const fullName =
    (session?.user?.user_metadata?.full_name as string | undefined) || '';
  const email = session?.user?.email ?? '';

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setInitializing(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setOnboardingChecked(false);
      setNeedsOnboarding(false);
      return;
    }
    let active = true;
    setOnboardingChecked(false);
    const checkOnboarding = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('business_type')
          .eq('auth_uid', userId)
          .maybeSingle();
        if (active) {
          setNeedsOnboarding(!data || !data.business_type);
        }
      } catch {
        if (active) {
          setNeedsOnboarding(false);
        }
      } finally {
        if (active) setOnboardingChecked(true);
      }
    };
    checkOnboarding();
    return () => {
      active = false;
    };
  }, [userId]);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) return null;
    return error.status === 429
      ? rateLimitMessage('sign-in')
      : error.message;
  }, []);

  const signUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        return {
          error: error.status === 429 ? rateLimitMessage('sign-up') : error.message,
          needsEmailConfirmation: false,
        };
      }

      if (data.session) {
        try {
          await supabase.from('profiles').insert({
            auth_uid: data.user!.id,
            full_name: fullName,
          });
        } catch {
          // profile row is created lazily on sign-in when unavailable
        }
        return { error: null, needsEmailConfirmation: false };
      }

      return { error: null, needsEmailConfirmation: true };
    },
    [],
  );

  const completeOnboarding = useCallback(
    async (input: OnboardingInput): Promise<string | null> => {
      if (!session?.user?.id) return 'You need to be signed in to complete this step.';
      try {
        const { error } = await supabase.rpc('upsert_my_profile', {
          p_business_type: input.businessType,
          p_location: input.location,
          p_full_name: input.fullName.trim(),
        });
        if (error) throw error;
      } catch {
        try {
          const { error } = await supabase.from('profiles').upsert(
            {
              auth_uid: session.user.id,
              full_name: input.fullName.trim(),
              business_type: input.businessType,
              location: input.location,
            },
            { onConflict: 'auth_uid' },
          );
          if (error) return `Could not save your business details: ${error.message}`;
        } catch (e) {
          return `Could not save your business details: ${
            e instanceof Error ? e.message : String(e)
          }`;
        }
      }
      setNeedsOnboarding(false);
      setOnboardingChecked(true);
      return null;
    },
    [session],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<ResetPasswordResult> => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: RESET_PASSWORD_REDIRECT,
      });
      if (error) {
        return error.status === 429
          ? { ok: false, error: rateLimitMessage('password-reset') }
          : { ok: false, error: error.message };
      }
      return { ok: true };
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      initializing,
      onboardingChecked,
      needsOnboarding,
      fullName,
      email,
      completeOnboarding,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }),
    [
      session,
      initializing,
      onboardingChecked,
      needsOnboarding,
      fullName,
      email,
      completeOnboarding,
      signIn,
      signUp,
      signOut,
      resetPassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}