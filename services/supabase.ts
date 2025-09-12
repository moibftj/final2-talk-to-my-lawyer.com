import { createClient } from '@supabase/supabase-js';

// In a production environment, these keys would be stored securely as environment variables.
// For this self-contained demo, they are hardcoded here.
const supabaseUrl = "https://liepvjfiezgjrchbdwnb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZXB2amZpZXpnanJjaGJkd25iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyODMyNjYsImV4cCI6MjA3Mjg1OTI2Nn0.qNQdxdbA75p5MXTJimYfMEE9tt5BEpoAr_VTKNOLs0Y";

if (!supabaseUrl || !supabaseAnonKey) {
  // This check is kept as a safeguard, but should not be hit with hardcoded values.
  throw new Error("Supabase URL and Anon Key must be provided.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;