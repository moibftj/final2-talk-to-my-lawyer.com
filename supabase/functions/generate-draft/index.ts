// FIX: Replaced unsupported 'lib' reference with a 'types' reference to a stable Deno types URL to resolve TypeScript errors.
/// <reference types="https://raw.githubusercontent.com/denoland/deno/v1.40.2/cli/dts/lib.deno.ns.d.ts" />

// Follow this guide to deploy the function to your Supabase project:
// https://supabase.com/docs/guides/functions/deploy

import { GoogleGenAI } from "@google/genai";

// Define interfaces for type safety
interface GenerateDraftPayload {
    title: string;
    templateBody: string;
    templateFields: Record<string, string>;
    additionalContext: string;
    tone?: 'Formal' | 'Aggressive' | 'Conciliatory' | 'Neutral';
    length?: 'Short' | 'Medium' | 'Long';
}

Deno.serve(async (req) => {
  // 1. Set up CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 2. Get the payload from the request body
    const payload: GenerateDraftPayload = await req.json();
    
    // 3. SECURELY get the Gemini API key from Supabase secrets
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable not set.");
    }

    // 4. Initialize the Gemini client and build the prompt
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const model = "gemini-2.5-flash";

    let styleInstructions = '';
    if (payload.tone || payload.length) {
        styleInstructions += '\n**Tone & Style Instructions:**\n';
        if (payload.tone) styleInstructions += `- **Tone:** The tone of the letter should be professional and ${payload.tone.toLowerCase()}.\n`;
        if (payload.length) {
            let lengthDesc = '';
            switch (payload.length) {
                case 'Short': lengthDesc = 'concise and to the point.'; break;
                case 'Medium': lengthDesc = 'standard, with sufficient detail.'; break;
                case 'Long': lengthDesc = 'comprehensive and highly detailed.'; break;
            }
            styleInstructions += `- **Length:** The filled-in sections should be relatively ${payload.length.toLowerCase()}, resulting in a letter that is ${lengthDesc}\n`;
        }
    }

    const prompt = `
        You are an expert legal assistant. Your task is to complete the following letter template using the user-provided details.
        The letter's subject is "${payload.title}".
        **Template to complete:**
        ---
        ${payload.templateBody}
        ---
        **User-provided details to fill in the placeholders:**
        ${Object.entries(payload.templateFields).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
        **Additional Context from the user (incorporate this where relevant):**
        ${payload.additionalContext || 'No additional context provided.'}
        ${styleInstructions}
        **Instructions:**
        1.  Carefully replace the placeholders (e.g., [Your Name], [Amount Owed]) in the template with the corresponding user-provided details.
        2.  If a detail for a placeholder is not provided, you MUST replace it with a clear indicator like "[Information Not Provided]" in the final letter. Do not leave the original placeholder (e.g., [Amount Owed]) in the text.
        3.  Incorporate the "Additional Context" where it seems most relevant within the letter body to add necessary detail or clarify points.
        4.  Ensure the final letter flows naturally and is grammatically correct after filling in the details.
        5.  Adhere strictly to the Tone & Style instructions when filling in the template.
        6.  The entire response should be ONLY the completed body of the letter. Do not include a subject line, greetings, sign-offs, or explanations outside of the letter's content itself.
    `;

    // 5. Call the Gemini API
    const response = await ai.models.generateContent({ model, contents: prompt });
    const draft = response.text;

    // 6. Return the successful response
    return new Response(JSON.stringify({ draft }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // 7. Handle any errors
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});