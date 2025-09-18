// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const MAILERSEND_API_URL = 'https://api.mailersend.com/v1/';
const MAILERSEND_API_KEY = 'mlsn.565957633da77bc68f8e5fa104bf2fef589f3a8141c0732f11333da440acc177';

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html, text, template_id, variables } = await req.json();

    const response = await fetch(`${MAILERSEND_API_URL}email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERSEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: {
          email: 'support@talktomylawyer.com',
          name: 'Talk to My Lawyer'
        },
        to: [{ email: to }],
        subject,
        html,
        text,
        template_id,
        variables
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email');
    }

    return new Response(JSON.stringify(result), {
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