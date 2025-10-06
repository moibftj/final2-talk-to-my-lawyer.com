/// <reference types="https://raw.githubusercontent.com/denoland/deno/v1.40.2/cli/dts/lib.deno.ns.d.ts" />

import { createClient } from '@supabase/supabase-js';

interface LetterRequest {
  senderName: string;
  senderAddress: string;
  attorneyName: string;
  recipientName: string;
  matter: string;
  desiredResolution: string;
  letterType: string;
  priority?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAiApiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const requestBody = await req.json();
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

    // Create or update letter with enhanced three-tier schema
    let currentLetterId = letterId;
    if (!letterId && letterRequest) {
      // Create a new letter with all enhanced fields
      const { data: newLetter, error: createError } = await supabase
        .from('letters')
        .insert({
          title: `Letter to ${letterRequest.recipientName} - ${letterRequest.matter}`,
          letter_type: letterRequest.letterType || 'general',
          status: 'submitted',
          timeline_status: 'received',
          user_id: userId || 'adb39d17-16f5-44c7-968a-533fad7540c6', // fallback for testing
          sender_name: letterRequest.senderName,
          sender_address: letterRequest.senderAddress,
          attorney_name: letterRequest.attorneyName,
          recipient_name: letterRequest.recipientName,
          matter: letterRequest.matter,
          desired_resolution: letterRequest.desiredResolution,
          priority: letterRequest.priority || 'medium',
          content: JSON.stringify(requestBody),
        })
        .select()
        .single();

      if (createError) {
        console.error('Create letter error:', createError);
        throw createError;
      } else {
        currentLetterId = newLetter.id;

        // Create initial timeline entry
        await supabase.rpc('update_letter_timeline', {
          letter_id_param: newLetter.id,
          new_status: 'received',
          message_param: 'Letter request received and processing started',
        });
      }
    } else if (letterId) {
      // Update existing letter status
      await supabase
        .from('letters')
        .update({
          status: 'submitted',
          timeline_status: 'under_review',
        })
        .eq('id', letterId);

      // Update timeline
      await supabase.rpc('update_letter_timeline', {
        letter_id_param: letterId,
        new_status: 'under_review',
        message_param: 'Letter is under attorney review',
      });
    }

    // Generate AI draft using OpenAI Codex API
    const prompt = letterRequest
      ? `
You are a professional legal letter writer. Generate a formal legal letter based on the following information:

Sender: ${letterRequest.senderName}
Sender Address: ${letterRequest.senderAddress}
Attorney/Law Firm: ${letterRequest.attorneyName}
Recipient: ${letterRequest.recipientName}
Subject/Matter: ${letterRequest.matter}
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

    // Update letter with AI draft and change status to 'posted'
    const { error: updateError } = await supabase
      .from('letters')
      .update({
        ai_draft: aiDraft,
        status: 'completed',
        timeline_status: 'posted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentLetterId);

    if (updateError) {
      throw updateError;
    }

    // Update timeline to 'posted' status
    await supabase.rpc('update_letter_timeline', {
      letter_id_param: currentLetterId,
      new_status: 'posted',
      message_param: 'Letter draft completed and ready for review',
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Letter draft generated successfully',
        letterId: currentLetterId,
        aiDraft,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating draft:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
