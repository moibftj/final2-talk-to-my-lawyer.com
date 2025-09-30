import { createClient } from '@supabase/supabase-js';

// Production environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = 'Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set at build time';
  console.error(errorMessage);
  console.error('supabaseUrl:', supabaseUrl || 'MISSING');
  console.error('supabaseAnonKey:', supabaseAnonKey ? 'Set' : 'MISSING');
  throw new Error(errorMessage);
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
