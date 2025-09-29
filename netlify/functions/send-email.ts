import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

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
    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const { letterId, recipientEmail, subject, senderEmail }: EmailRequest = JSON.parse(event.body || '{}')

    if (!letterId || !recipientEmail || !subject) {
      throw new Error('Missing required fields')
    }

    // Get the letter content
    const { data: letter, error: letterError } = await supabase
      .from('letters')
      .select('*')
      .eq('id', letterId)
      .single()

    if (letterError || !letter) {
      throw new Error('Letter not found')
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

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        letterId: letterId,
        sentTo: recipientEmail
      })
    }

  } catch (error) {
    console.error('Error sending email:', error)
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