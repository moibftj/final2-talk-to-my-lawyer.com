/// <reference types="https://raw.githubusercontent.com/denoland/deno/v1.40.2/cli/dts/lib.deno.ns.d.ts" />

import { createClient } from '@supabase/supabase-js'

interface LetterRequest {
  senderName: string
  senderAddress: string
  attorneyName: string
  recipient: string
  subject: string
  desiredResolution: string
  letterType: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const requestBody = await req.json()
    console.log('Request body received:', requestBody)

    // Handle both test format and production format
    const { letterRequest, userId, letterId, title, templateBody, templateFields, additionalContext, tone, length } = requestBody

    if (!title && !letterRequest) {
      throw new Error('Missing required fields: title or letterRequest')
    }

    // Use test format if available, otherwise use production format
    const letterData = letterRequest || {
      title: title,
      content: templateBody,
      additionalContext: additionalContext,
      tone: tone || 'formal',
      length: length || 'medium'
    }

    // Create or update letter
    let currentLetterId = letterId
    if (!letterId) {
      // Create a new letter for testing purposes
      const { data: newLetter, error: createError } = await supabase
        .from('letters')
        .insert({
          title: letterData.title,
          letter_type: 'general',
          status: 'submitted',
          user_id: userId || 'adb39d17-16f5-44c7-968a-533fad7540c6', // fallback for testing
          content: JSON.stringify(requestBody)
        })
        .select()
        .single()

      if (createError) {
        console.error('Create letter error:', createError)
      } else {
        currentLetterId = newLetter.id
      }
    } else {
      // Update existing letter
      await supabase
        .from('letters')
        .update({ status: 'submitted' })
        .eq('id', letterId)
    }

    // Generate AI draft using Gemini API
    const prompt = letterRequest ? `
You are a professional legal letter writer. Generate a formal legal letter based on the following information:

Sender: ${letterRequest.senderName}
Sender Address: ${letterRequest.senderAddress}
Attorney/Law Firm: ${letterRequest.attorneyName}
Recipient: ${letterRequest.recipient}
Subject/Matter: ${letterRequest.subject}
Desired Resolution: ${letterRequest.desiredResolution}
Letter Type: ${letterRequest.letterType}

Please create a professional, formal legal letter that:
1. Uses appropriate legal language and formatting
2. Clearly states the issue/matter
3. Requests the desired resolution
4. Maintains a professional but firm tone
5. Includes proper legal disclaimers if applicable
6. Is formatted as a complete business letter with proper headers

The letter should be comprehensive but concise, typically 1-2 pages when printed.
    ` : `
You are a professional letter writer. Generate a ${tone} letter based on the following information:

Title: ${title}
Template: ${templateBody}
Additional Context: ${additionalContext}
Tone: ${tone}
Length: ${length}

Please create a professional letter that incorporates the template and additional context.
Replace any placeholders in brackets with appropriate content based on the context provided.
Maintain a ${tone} tone throughout.
    `

    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`)
    }

    const geminiData = await geminiResponse.json()
    const aiDraft = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiDraft) {
      throw new Error('Failed to generate AI draft')
    }

    // Update letter with AI draft and change status to 'in_review'
    const { error: updateError } = await supabase
      .from('letters')
      .update({
        ai_draft: aiDraft,
        status: 'in_review',
        updated_at: new Date().toISOString()
      })
      .eq('id', currentLetterId)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Letter draft generated successfully',
        letterId: currentLetterId,
        aiDraft
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error generating draft:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})