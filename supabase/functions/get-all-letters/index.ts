// Follow this guide to deploy the function to your Supabase project:
// https://supabase.com/docs/guides/functions/deploy

import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '../../utils/auth.ts';

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // SECURITY: Require admin authentication
    const { user, profile } = await requireAdmin(req);

    // Create a Supabase client with the service_role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch all letters from the letters table
    const { data: letters, error } = await supabaseAdmin
      .from('letters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ 
      letters,
      requestedBy: { id: user.id, role: profile.role }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    let message = 'Internal Server Error';
    if (typeof error === 'object' && error !== null && 'message' in error) {
      message = String((error as { message?: unknown }).message);
    }
    console.error('Error fetching letters:', error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
