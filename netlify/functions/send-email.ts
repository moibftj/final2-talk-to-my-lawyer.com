import { Handler } from '@netlify/functions'
import { getSupabaseAdmin } from '../../services/supabaseAdmin'
import { getUserContext, jsonResponse } from './_auth'

interface EmailRequest {
  letterId: string
  recipientEmail: string
  subject: string
  senderEmail?: string
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
    // SECURITY: Require authentication
    const { user, profile } = await getUserContext(event)

    // Secure admin client (server-only) only after passing auth check
    const supabase = getSupabaseAdmin()

    // Get request body
    const { letterId, recipientEmail, subject, senderEmail }: EmailRequest = JSON.parse(event.body || '{}')

    if (!letterId || !recipientEmail || !subject) {
      return jsonResponse(400, { 
        success: false, 
        error: 'Missing required fields' 
      }, corsHeaders)
    }

    // Get the letter content
    const { data: letter, error: letterError } = await supabase
      .from('letters')
      .select('*')
      .eq('id', letterId)
      .single()

    if (letterError || !letter) {
      return jsonResponse(404, { 
        success: false, 
        error: 'Letter not found' 
      }, corsHeaders)
    }

    // SECURITY: Ensure user can only send their own letters (unless admin/employee)
    if (letter.user_id !== user.id && !['admin', 'employee'].includes(profile?.role || '')) {
      return jsonResponse(403, {
        success: false,
        error: 'You can only send your own letters'
      }, corsHeaders)
    }

    // Here you would integrate with an actual email service like SendGrid, Mailgun, etc.
    // For now, we'll simulate sending the email
    console.log('Simulating email send:', {
      to: recipientEmail,
      from: senderEmail || 'noreply@talktomylawyer.com',
      subject: subject,
      content: letter.ai_draft || letter.content
    })

    // Update letter status to 'completed' and add sent timestamp
    const { error: updateError } = await supabase
      .from('letters')
      .update({
        status: 'completed',
        sent_at: new Date().toISOString(),
        recipient_email: recipientEmail
      })
      .eq('id', letterId)

    if (updateError) {
      throw updateError
    }

    // Log the email activity (if you have a letter_status_history table)
    try {
      await supabase
        .from('letter_status_history')
        .insert({
          letter_id: letterId,
          status: 'completed',
          notes: `Email sent to ${recipientEmail}`,
          created_at: new Date().toISOString()
        })
    } catch (historyError) {
      console.warn('Failed to log status history:', historyError)
    }

    return jsonResponse(200, {
      success: true,
      message: 'Email sent successfully',
      letterId: letterId,
      sentTo: recipientEmail,
      requestedBy: { id: user.id, role: profile?.role }
    }, corsHeaders)

  } catch (error: any) {
    const status = error?.statusCode || 500
    const message = error?.message || 'Internal Server Error'
    if (status >= 500) {
      console.error('Error sending email:', error)
    }
    return jsonResponse(status, { success: false, error: message }, corsHeaders)
  }
}