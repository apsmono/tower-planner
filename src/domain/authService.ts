import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useStore, type UserProfile } from './store';
import { isAccountAdopted, adoptLocalStateToCloud } from './adoptionService';

export interface AuthState {
  userId: string | null;
  email: string | null;
  isAnonymous: boolean;
  isInitialized: boolean;
}

let isAuthInitialized = false;

/**
 * Initializes Supabase auth flow:
 * 1. Checks existing session.
 * 2. If no session, tries to sign in anonymously (if enabled on project).
 * 3. Triggers adoption if this user account hasn't been adopted yet.
 */
export async function initAuth(): Promise<void> {
  if (isAuthInitialized || !isSupabaseConfigured) return;
  isAuthInitialized = true;

  try {
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) {
      console.warn('Supabase getSession error:', sessionErr);
    }

    let session = sessionData?.session;

    if (!session) {
      const { data: anonData, error: anonErr } = await supabase.auth.signInAnonymously();
      if (anonErr) {
        console.info('Anonymous sign-in not enabled on project. User can sign in with Email in the Auth modal.', anonErr.message);
      } else {
        session = anonData.session;
      }
    }

    if (session?.user) {
      await handleUserSession(session.user);
    }

    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (newSession?.user) {
        await handleUserSession(newSession.user);
      } else {
        const store = useStore.getState();
        store.setUser(null);
      }
    });
  } catch (err) {
    console.warn('initAuth caught error:', err);
  }
}

export async function handleUserSession(user: { id: string; email?: string; is_anonymous?: boolean; user_metadata?: Record<string, any> }) {
  const store = useStore.getState();
  const isAnon = Boolean(user.is_anonymous);
  const email = user.email || (isAnon ? 'Anonymous Commander' : 'commander@tower-planner.io');
  const name = user.user_metadata?.name || (isAnon ? 'Anonymous Commander' : email.split('@')[0]);

  const profile: UserProfile = {
    id: user.id,
    email,
    name,
    isLoggedIn: true,
    lastSyncedAt: new Date().toISOString()
  };

  store.setUser(profile);

  // Adopt local data if not yet marked adopted for this user ID
  if (!isAccountAdopted(user.id)) {
    const res = await adoptLocalStateToCloud(user.id);
    if (res.success) {
      console.log('Successfully adopted local state to cloud for user:', user.id);
    } else {
      console.warn('Adoption error:', res.error);
    }
  }
}

/**
 * Sign in with email and password.
 */
export async function signInWithEmailPassword(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      await handleUserSession(data.user);
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Sign up with email and password.
 */
export async function signUpWithEmailPassword(email: string, password: string, name?: string): Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name || email.split('@')[0] }
      }
    });
    if (error) throw error;
    if (data.user && data.session) {
      await handleUserSession(data.user);
      return { success: true };
    }
    return { success: true, needsEmailConfirmation: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

function getOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost:3000';
}

/**
 * Sign in with Magic Link / Email OTP (passwordless).
 */
export async function signInWithOtp(email: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getOrigin()
      }
    });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Sends a password reset email to the user.
 */
export async function resetPasswordForEmail(email: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getOrigin()
    });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Updates or sets the password for the current authenticated user.
 */
export async function updatePassword(password: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured' };
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Upgrades anonymous user to permanent account via email OTP / Magic Link,
 * with an optional initial password.
 * Preserves user_id so zero data re-parenting is needed.
 */
export async function upgradeAccountWithEmail(email: string, password?: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const attributes: { email: string; password?: string } = { email };
    if (password && password.trim().length >= 6) {
      attributes.password = password.trim();
    }
    const { error } = await supabase.auth.updateUser(attributes);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Sign out from Supabase. Local browser state is preserved.
 */
export async function signOutUser(): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Sign out error:', err);
  }
}

