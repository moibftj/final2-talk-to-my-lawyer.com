import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://hevnbcyuqxirqwhekwse.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhldm5iY3l1cXhpcnF3aGVrd3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDU3MDUsImV4cCI6MjA3MzE4MTcwNX0.o_awyK7z7pHa06guTVGmsLANG4czQAvzJO1RP__Kwak';
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