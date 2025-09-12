// FIX: Replaced unsupported 'lib' reference with a 'types' reference to a stable Deno types URL to resolve TypeScript errors.
/// <reference types="https://raw.githubusercontent.com/denoland/deno/v1.40.2/cli/dts/lib.deno.ns.d.ts" />

// Follow this guide to deploy the function to your Supabase project:
// https://supabase.com/docs/guides/functions/deploy

import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Create a Supabase client with the service_role key
    // This will bypass all RLS policies and allow you to read all data.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 2. Fetch all users from the auth schema
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      throw error;
    }

    // 3. Fetch corresponding profiles to get the role for each user
    const userIds = users.map(user => user.id);
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .in('id', userIds);

    if (profileError) {
      throw profileError;
    }

    // 4. Combine user and profile data
    const combinedUsers = users.map(user => {
      const profile = profiles.find(p => p.id === user.id);
      return {
        id: user.id,
        email: user.email,
        role: profile?.role || 'user', // Default to 'user' if no profile found
      };
    });

    // 5. Return the list of users
    return new Response(JSON.stringify({ users: combinedUsers }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});