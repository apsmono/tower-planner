import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://placeholder.supabase.co';

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder-key';

export const isSupabaseConfigured = Boolean(
  (import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL) &&
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
   import.meta.env.VITE_SUPABASE_ANON_KEY ||
   import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
   import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

// Single singleton Supabase client for the entire application
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
