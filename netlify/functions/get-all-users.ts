import { Handler } from '@netlify/functions'
import { getSupabaseAdmin } from '../../services/supabaseAdmin'
import { requireAdmin, jsonResponse } from './_auth'

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
    // Auth & authorization
    const { user, profile } = await requireAdmin(event)

    // Secure admin client (server-only) only after passing admin check
    const supabase = getSupabaseAdmin()

    // Get all users with their profiles
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return jsonResponse(200, {
      success: true,
      requestedBy: { id: user.id, role: profile?.role },
      users: users || []
    }, corsHeaders)

  } catch (error: any) {
    const status = error?.statusCode || 500
    const message = error?.message || 'Internal Server Error'
    if (status >= 500) {
      console.error('Error fetching users:', error)
    }
    return jsonResponse(status, { success: false, error: message }, corsHeaders)
  }
}