import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  signInWithOtp, 
  signInWithEmailPassword, 
  signUpWithEmailPassword, 
  resetPasswordForEmail, 
  updatePassword, 
  upgradeAccountWithEmail 
} from './authService';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      signInWithOtp: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInAnonymously: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn()
    }
  }
}));

vi.mock('./adoptionService', () => ({
  isAccountAdopted: vi.fn().mockReturnValue(true),
  adoptLocalStateToCloud: vi.fn().mockResolvedValue({ success: true })
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInWithOtp (Passwordless / Magic Link)', () => {
    it('calls supabase signInWithOtp with email and redirect options', async () => {
      (supabase.auth.signInWithOtp as any).mockResolvedValue({ data: {}, error: null });

      const res = await signInWithOtp('commander@test.com');
      expect(res.success).toBe(true);
      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'commander@test.com',
        options: expect.objectContaining({
          emailRedirectTo: expect.any(String)
        })
      });
    });

    it('returns error message if supabase call fails', async () => {
      (supabase.auth.signInWithOtp as any).mockResolvedValue({ 
        data: {}, 
        error: new Error('Rate limit exceeded') 
      });

      const res = await signInWithOtp('commander@test.com');
      expect(res.success).toBe(false);
      expect(res.error).toBe('Rate limit exceeded');
    });
  });

  describe('signInWithEmailPassword', () => {
    it('signs in with email and password', async () => {
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: { id: 'u-123', email: 'c@test.com' } },
        error: null
      });

      const res = await signInWithEmailPassword('c@test.com', 'secret123');
      expect(res.success).toBe(true);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'c@test.com',
        password: 'secret123'
      });
    });
  });

  describe('signUpWithEmailPassword', () => {
    it('signs up with email and password and triggers user session', async () => {
      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: { id: 'u-456', email: 'c2@test.com' }, session: { access_token: 'token123' } },
        error: null
      });

      const res = await signUpWithEmailPassword('c2@test.com', 'secret123', 'Commander 2');
      expect(res.success).toBe(true);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'c2@test.com',
        password: 'secret123',
        options: {
          data: { name: 'Commander 2' }
        }
      });
    });
  });

  describe('resetPasswordForEmail', () => {
    it('calls supabase resetPasswordForEmail', async () => {
      (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({ data: {}, error: null });

      const res = await resetPasswordForEmail('c@test.com');
      expect(res.success).toBe(true);
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('c@test.com', {
        redirectTo: expect.any(String)
      });
    });
  });

  describe('updatePassword', () => {
    it('calls supabase updateUser with password', async () => {
      (supabase.auth.updateUser as any).mockResolvedValue({ data: {}, error: null });

      const res = await updatePassword('newSecret123');
      expect(res.success).toBe(true);
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newSecret123'
      });
    });
  });

  describe('upgradeAccountWithEmail', () => {
    it('links email without password', async () => {
      (supabase.auth.updateUser as any).mockResolvedValue({ data: {}, error: null });

      const res = await upgradeAccountWithEmail('c@test.com');
      expect(res.success).toBe(true);
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        email: 'c@test.com'
      });
    });

    it('links email with optional password', async () => {
      (supabase.auth.updateUser as any).mockResolvedValue({ data: {}, error: null });

      const res = await upgradeAccountWithEmail('c@test.com', 'newPassword123');
      expect(res.success).toBe(true);
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        email: 'c@test.com',
        password: 'newPassword123'
      });
    });
  });
});
