import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFunctions() {
  try {
    // Test get-all-letters
    const { data: letters, error: lettersError } =
      await supabase.functions.invoke('get-all-letters');
    console.log('Get All Letters Result:', letters || lettersError);

    // Test get-all-users
    const { data: users, error: usersError } =
      await supabase.functions.invoke('get-all-users');
    console.log('Get All Users Result:', users || usersError);

    // Test generate-draft
    console.log('Testing generate-draft function...');
    try {
      const { data: draft, error } = await supabase.functions.invoke(
        'generate-draft',
        {
          body: {
            title: 'Complaint Letter',
            templateBody:
              'Dear [recipient],\n\nI am writing to express my concerns about [issue].',
            templateFields: {
              recipient: 'Property Manager',
              issue: 'maintenance delays',
              date: new Date().toISOString(),
            },
            additionalContext:
              'Multiple maintenance requests have been ignored for over a month.',
            tone: 'Formal',
            length: 'Medium',
          },
        }
      );

      console.log('Generate Draft Response:', {
        data: draft,
        error: error,
      });
    } catch (error) {
      console.error('Generate Draft Error:', error);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testFunctions();
