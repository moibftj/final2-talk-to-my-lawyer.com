import { createClient } from '@supabase/supabase-js';

// Production environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be provided.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
