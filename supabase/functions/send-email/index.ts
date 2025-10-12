import { createClient } from "@supabase/supabase-js";
import { getUserContext } from "../../utils/auth.ts";

interface EmailRequest {
  letterId: string;
  recipientEmail: string;
  senderEmail?: string;
  attorneyEmail?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // SECURITY: Require user authentication
    const { user, profile } = await getUserContext(req);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const { letterId, recipientEmail, senderEmail, attorneyEmail }:
      EmailRequest = await req.json();

    if (!letterId || !recipientEmail) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: letterId or recipientEmail",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get the letter content
    const { data: letter, error: letterError } = await supabase
      .from("letters")
      .select("*")
      .eq("id", letterId)
      .single();

    if (letterError || !letter) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Letter not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // SECURITY: Ensure user can only send their own letters (unless admin/employee)
    if (
      letter.user_id !== user.id &&
      !["admin", "employee"].includes(profile?.role || "")
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "You can only send your own letters",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get additional letter details with user profile
    const { data: letterWithProfile, error: profileError } = await supabase
      .from("letters")
      .select(`
        *,
        profiles:user_id (email)
      `)
      .eq("id", letterId)
      .single();

    if (profileError || !letterWithProfile) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Error fetching letter details",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!letterWithProfile.ai_draft) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Letter draft not available",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Prepare email content
    const subject = `Legal Letter: ${letter.title}`;
    const emailBody = `
Dear Recipient,

Please find below the legal letter prepared by our attorney:

${letter.ai_draft}

---
This letter was generated through our legal letter service.
If you have any questions, please contact the sender or attorney directly.

Best regards,
Talk to My Lawyer Service
    `;

    // For demo purposes, we'll simulate sending the email
    // In production, integrate with a real email service like SendGrid, Mailgun, or AWS SES
    console.log("Simulating email send:", {
      to: recipientEmail,
      from: attorneyEmail || senderEmail || "noreply@talktomylawyer.com",
      subject,
      body: emailBody,
    });

    // Update letter status to 'sent'
    const { error: updateError } = await supabase
      .from("letters")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", letterId);

    if (updateError) {
      throw updateError;
    }

    // Log the email sending activity
    const { error: logError } = await supabase
      .from("letter_status_history")
      .insert({
        letter_id: letterId,
        old_status: "approved",
        new_status: "completed",
        changed_by: letter.user_id,
        notes: `Email sent to ${recipientEmail}`,
      });

    if (logError) {
      console.warn("Failed to log email activity:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        data: {
          letterId,
          recipientEmail,
          subject,
          status: "sent",
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

/*
TODO: Integrate with a real email service provider
Example with SendGrid:

import { SendGridAPI } from 'https://deno.land/x/sendgrid@0.0.3/mod.ts'

const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')!
const sendGrid = new SendGridAPI(sendGridApiKey)

const emailData = {
  to: recipientEmail,
  from: 'noreply@talktomylawyer.com',
  subject: subject,
  text: emailBody,
  html: emailBody.replace(/\n/g, '<br>')
}

const response = await sendGrid.send(emailData)
*/
