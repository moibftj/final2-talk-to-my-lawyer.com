import { createClient } from '@supabase/supabase-js';

// Production environment variables for Supabase configuration
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL?.trim() ||
  import.meta.env.VITE_SUPABASE_ANON_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage =
    'Missing required environment variables: set VITE_SUPABASE_URL (or VITE_SUPABASE_ANON_URL) and VITE_SUPABASE_ANON_KEY at build time';
  console.error(errorMessage);
  console.error('supabaseUrl:', supabaseUrl || 'MISSING');
  console.error('supabaseAnonKey:', supabaseAnonKey ? 'Set' : 'MISSING');
  throw new Error(errorMessage);
}

// Create Supabase client with enhanced error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    // Reduce noisy error logging for expired tokens
    debug: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'law-letter-ai-web',
    },
  },
});

export default supabase;
