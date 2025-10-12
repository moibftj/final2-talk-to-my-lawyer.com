import { Handler } from '@netlify/functions'
import { getSupabaseAdmin } from '../../services/supabaseAdmin'
import { getUserContext, requireAdmin, jsonResponse } from './_auth'

interface StatusUpdateRequest {
  letterId: string
  status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'completed' | 'cancelled'
  lawyerNotes?: string
  assignedLawyerId?: string
  dueDate?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
    // SECURITY: Require admin or employee authentication for status updates
    const { user, profile } = await getUserContext(event)
    
    // Only admins and employees can update letter status
    if (!profile || !profile.role || !['admin', 'employee'].includes(profile.role)) {
      return jsonResponse(403, { 
        success: false, 
        error: 'Admin or employee role required to update letter status' 
      }, corsHeaders)
    }

    // Secure admin client (server-only) only after passing auth check
    const supabase = getSupabaseAdmin()

    // Get request body
    const { letterId, status, lawyerNotes, assignedLawyerId, dueDate }: StatusUpdateRequest = JSON.parse(event.body || '{}')

    if (!letterId || !status) {
      throw new Error('Missing required fields: letterId and status')
    }

    // Validate status
    const validStatuses = ['draft', 'submitted', 'in_review', 'approved', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status')
    }

    // Get current letter to validate
    const { data: currentLetter, error: fetchError } = await supabase
      .from('letters')
      .select('*')
      .eq('id', letterId)
      .single()

    if (fetchError || !currentLetter) {
      throw new Error('Letter not found')
    }

    // Prepare update data
    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString()
    }

    if (lawyerNotes) {
      updateData.lawyer_notes = lawyerNotes
    }

    if (assignedLawyerId) {
      updateData.assigned_lawyer_id = assignedLawyerId
    }

    if (dueDate) {
      updateData.due_date = dueDate
    }

    // Update letter status
    const { error: updateError } = await supabase
      .from('letters')
      .update(updateData)
      .eq('id', letterId)

    if (updateError) {
      throw updateError
    }

    // Add to status history if table exists
    try {
      await supabase
        .from('letter_status_history')
        .insert({
          letter_id: letterId,
          status: status,
          notes: lawyerNotes || `Status changed to ${status}`,
          lawyer_id: assignedLawyerId,
          created_at: new Date().toISOString()
        })
    } catch (historyError) {
      console.warn('Failed to log status history:', historyError)
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Letter status updated successfully',
        letterId: letterId,
        newStatus: status
      })
    }

  } catch (error) {
    console.error('Error updating letter status:', error)
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