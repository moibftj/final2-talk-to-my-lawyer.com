import { Handler } from '@netlify/functions';
import { getSupabaseAdmin } from '../../services/supabaseAdmin';
import { getUserContext, jsonResponse } from './_auth';

interface LetterRequest {
  senderName: string;
  senderAddress: string;
  attorneyName: string;
  recipient: string;
  subject: string;
  desiredResolution: string;
  letterType: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: 'ok',
    };
  }

  try {
    // SECURITY: Require user authentication
    const { user, profile } = await getUserContext(event)

    // Secure admin client & OpenAI key
    const openAiApiKey = process.env.OPENAI_API_KEY;

    if (!openAiApiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    const supabase = getSupabaseAdmin();

    // Get request body
    const requestBody = JSON.parse(event.body || '{}');
    console.log('Request body received:', requestBody);

    // Handle both test format and production format
    const {
      letterRequest,
      userId,
      letterId,
      title,
      templateBody,
      templateFields,
      additionalContext,
      tone,
      length,
    } = requestBody;

    if (!title && !letterRequest) {
      throw new Error('Missing required fields: title or letterRequest');
    }

    // Use test format if available, otherwise use production format
    const letterData = letterRequest || {
      title: title,
      content: templateBody,
      additionalContext: additionalContext,
      tone: tone || 'formal',
      length: length || 'medium',
    };

    // SECURITY: Validate userId - ensure user can only create letters for themselves
    const validatedUserId = userId || user.id;
    if (validatedUserId !== user.id && profile?.role !== 'admin') {
      return jsonResponse(403, {
        success: false,
        error: 'You can only create letters for yourself'
      }, corsHeaders)
    }

    // Create or update letter
    let currentLetterId = letterId;
    if (!letterId) {
      // Create a new letter for testing purposes
      const { data: newLetter, error: createError } = await supabase
        .from('letters')
        .insert({
          title: letterData.title,
          letter_type: 'general',
          status: 'submitted',
          user_id: userId || 'adb39d17-16f5-44c7-968a-533fad7540c6', // fallback for testing
          content: JSON.stringify(requestBody),
        })
        .select()
        .single();

      if (createError) {
        console.error('Create letter error:', createError);
      } else {
        currentLetterId = newLetter.id;
      }
    } else {
      // Update existing letter
      await supabase
        .from('letters')
        .update({ status: 'submitted' })
        .eq('id', letterId);
    }

    // Generate AI draft using OpenAI Codex API
    const prompt = letterRequest
      ? `
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
    `
      : `
You are a professional letter writer. Generate a ${tone} letter based on the following information:

Title: ${title}
Template: ${templateBody}
Additional Context: ${additionalContext}
Tone: ${tone}
Length: ${length}

Please create a professional letter that incorporates the template and additional context.
Replace any placeholders in brackets with appropriate content based on the context provided.
Maintain a ${tone} tone throughout.
    `;

    // Call OpenAI API
    const openAiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.4,
          messages: [
            {
              role: 'system',
              content:
                'You are OpenAI Codex assisting legal professionals by drafting polished, accurate, and compliant correspondence.',
            },
            { role: 'user', content: prompt },
          ],
        }),
      }
    );

    if (!openAiResponse.ok) {
      throw new Error(`OpenAI API error: ${openAiResponse.statusText}`);
    }

    const openAiData = await openAiResponse.json();
    const aiDraft = openAiData.choices?.[0]?.message?.content?.trim();

    if (!aiDraft) {
      throw new Error('Failed to generate AI draft');
    }

    // Update letter with AI draft and change status to 'in_review'
    const { error: updateError } = await supabase
      .from('letters')
      .update({
        ai_draft: aiDraft,
        status: 'in_review',
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentLetterId);

    if (updateError) {
      throw updateError;
    }

    return jsonResponse(200, {
      success: true,
      message: 'Letter draft generated successfully',
      letterId: currentLetterId,
      aiDraft,
      requestedBy: { id: user.id, role: profile?.role }
    }, corsHeaders);
  } catch (error: any) {
    const status = error?.statusCode || 500
    const message = error?.message || 'Internal Server Error'
    if (status >= 500) {
      console.error('Error generating draft:', error);
    }
    return jsonResponse(status, { success: false, error: message }, corsHeaders);
  }
};
