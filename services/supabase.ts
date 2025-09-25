import { createClient } from '@supabase/supabase-js';

// Production environment variables for Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be provided.'
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
