import { Handler } from '@netlify/functions'
import { getSupabaseAdmin } from '../../services/supabaseAdmin'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
}

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: 'ok'
    }
  }

  try {
  // Secure admin client
  const supabase = getSupabaseAdmin()

    // Get all letters with user information
    const { data: letters, error } = await supabase
      .from('letters')
      .select(`
        *,
        profiles (
          email,
          role
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        letters: letters || []
      })
    }

  } catch (error) {
    console.error('Error fetching letters:', error)
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    }
  }
}