import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getUserContext } from "../../utils/auth.ts";

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

interface RequestBody {
  letterRequest?: LetterRequest;
  userId?: string;
  letterId?: string;
  title?: string;
  templateBody?: string;
  templateFields?: unknown;
  additionalContext?: string;
  tone?: string;
  length?: string;
}

interface Config {
  supabaseUrl: string;
  supabaseServiceKey: string;
  openAiApiKey: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_USER_ID = "adb39d17-16f5-44c7-968a-533fad7540c6";

// Configuration validation
function getConfig(): Config {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const openAiApiKey = Deno.env.get("OPENAI_API_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing required Supabase configuration");
  }

  if (!openAiApiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  return { supabaseUrl, supabaseServiceKey, openAiApiKey };
}

// Create a new letter in the database
async function createLetter(
  supabase: SupabaseClient,
  letterRequest: LetterRequest,
  userId: string,
  requestBody: RequestBody,
): Promise<string> {
  const { data: newLetter, error: createError } = await supabase
    .from("letters")
    .insert({
      title:
        `Letter to ${letterRequest.recipientName} - ${letterRequest.matter}`,
      letter_type: letterRequest.letterType || "general",
      status: "submitted",
      timeline_status: "received",
      user_id: userId,
      sender_name: letterRequest.senderName,
      sender_address: letterRequest.senderAddress,
      attorney_name: letterRequest.attorneyName,
      recipient_name: letterRequest.recipientName,
      matter: letterRequest.matter,
      desired_resolution: letterRequest.desiredResolution,
      priority: letterRequest.priority || "medium",
      content: JSON.stringify(requestBody),
    })
    .select()
    .single();

  if (createError) {
    console.error("Create letter error:", createError);
    throw createError;
  }

  // Create initial timeline entry
  await supabase.rpc("update_letter_timeline", {
    letter_id_param: newLetter.id,
    new_status: "received",
    message_param: "Letter request received and processing started",
  });

  return newLetter.id;
}

// Update an existing letter
async function updateLetterStatus(
  supabase: SupabaseClient,
  letterId: string,
): Promise<void> {
  await supabase
    .from("letters")
    .update({
      status: "submitted",
      timeline_status: "under_review",
    })
    .eq("id", letterId);

  await supabase.rpc("update_letter_timeline", {
    letter_id_param: letterId,
    new_status: "under_review",
    message_param: "Letter is under attorney review",
  });
}

// Update letter with AI draft
async function updateLetterWithDraft(
  supabase: SupabaseClient,
  letterId: string,
  aiDraft: string,
): Promise<void> {
  const { error: updateError } = await supabase
    .from("letters")
    .update({
      ai_draft: aiDraft,
      status: "completed",
      timeline_status: "posted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", letterId);

  if (updateError) {
    throw updateError;
  }

  await supabase.rpc("update_letter_timeline", {
    letter_id_param: letterId,
    new_status: "posted",
    message_param: "Letter draft completed and ready for review",
  });
}

// Generate prompt for OpenAI based on request type
function generatePrompt(requestBody: RequestBody): string {
  const { letterRequest, title, templateBody, additionalContext, tone, length } = requestBody;

  if (letterRequest) {
    return `
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
    `;
  }

  return `
You are a professional letter writer. Generate a ${tone || "formal"} letter based on the following information:

Title: ${title}
Template: ${templateBody}
Additional Context: ${additionalContext}
Tone: ${tone}
Length: ${length}

Please create a professional letter that incorporates the template and additional context.
Replace any placeholders in brackets with appropriate content based on the context provided.
Maintain a ${tone || "formal"} tone throughout.
    `;
}

// Call OpenAI API to generate letter draft
async function generateAIDraft(
  prompt: string,
  openAiApiKey: string,
): Promise<string> {
  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are OpenAI Codex assisting legal professionals by drafting polished, accurate, and compliant correspondence.",
          },
          { role: "user", content: prompt },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const aiDraft = data.choices?.[0]?.message?.content?.trim();

  if (!aiDraft) {
    throw new Error("Failed to generate AI draft");
  }

  return aiDraft;
}

// Validate request body
function validateRequestBody(requestBody: RequestBody): void {
  if (!requestBody.title && !requestBody.letterRequest) {
    throw new Error("Missing required fields: title or letterRequest");
  }
}

// Create success response
function createSuccessResponse(letterId: string, aiDraft: string): Response {
  return new Response(
    JSON.stringify({
      success: true,
      message: "Letter draft generated successfully",
      letterId,
      aiDraft,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    },
  );
}

// Create error response
function createErrorResponse(error: unknown): Response {
  console.error("Error generating draft:", error);
  const message = error instanceof Error
    ? error.message
    : "Internal Server Error";
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    },
  );
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // SECURITY: Require user authentication
    const { user: _user, profile: _profile } = await getUserContext(req);

    // Get configuration
    const config = getConfig();
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

    // Get and validate request body
    const requestBody: RequestBody = await req.json();
    console.log("Request body received:", requestBody);
    validateRequestBody(requestBody);

    // Extract request parameters
    const { letterRequest, userId, letterId } = requestBody;
    const effectiveUserId = userId || DEFAULT_USER_ID;

    // Create or update letter
    let currentLetterId = letterId;
    if (!letterId && letterRequest) {
      currentLetterId = await createLetter(
        supabase,
        letterRequest,
        effectiveUserId,
        requestBody,
      );
    } else if (letterId) {
      await updateLetterStatus(supabase, letterId);
    }

    // Generate AI draft
    const prompt = generatePrompt(requestBody);
    const aiDraft = await generateAIDraft(prompt, config.openAiApiKey);

    // Update letter with AI draft
    await updateLetterWithDraft(supabase, currentLetterId!, aiDraft);

    return createSuccessResponse(currentLetterId!, aiDraft);
  } catch (error: unknown) {
    return createErrorResponse(error);
  }
});
