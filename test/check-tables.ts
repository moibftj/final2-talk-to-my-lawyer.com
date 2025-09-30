import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    console.log('Checking available tables...');

    // Check users/profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(3);
    console.log('Profiles table:', profiles ? 'EXISTS' : profilesError?.message);

    // Check letters
    const { data: letters, error: lettersError } = await supabase
      .from('letters')
      .select('*')
      .limit(3);
    console.log('Letters table:', letters ? 'EXISTS' : lettersError?.message);

    // Check discount_codes
    const { data: discountCodes, error: discountError } = await supabase
      .from('discount_codes')
      .select('*')
      .limit(3);
    console.log('Discount_codes table:', discountCodes ? 'EXISTS' : discountError?.message);

    // Check subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(3);
    console.log('Subscriptions table:', subscriptions ? 'EXISTS' : subsError?.message);

    // Check discount_usage
    const { data: usage, error: usageError } = await supabase
      .from('discount_usage')
      .select('*')
      .limit(3);
    console.log('Discount_usage table:', usage ? 'EXISTS' : usageError?.message);

  } catch (error) {
    console.error('Check tables failed:', error);
  }
}

checkTables();