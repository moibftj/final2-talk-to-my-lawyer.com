import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateStatusRequest {
  letterId: string;
  newStatus: 'draft' | 'submitted' | 'in_review' | 'approved' | 'completed' | 'cancelled';
  lawyerId?: string;
  adminNotes?: string;
  notifyUser?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user authentication
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { letterId, newStatus, lawyerId, adminNotes, notifyUser = true }: UpdateStatusRequest = await req.json();

    if (!letterId || !newStatus) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: letterId, newStatus' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current letter to check permissions and current status
    const { data: letter, error: fetchError } = await supabaseClient
      .from('letters')
      .select(`
        *,
        profiles:user_id (role, email)
      `)
      .eq('id', letterId)
      .single();

    if (fetchError || !letter) {
      return new Response(
        JSON.stringify({ error: 'Letter not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check permissions - only admins and the letter owner can update status
    const userProfile = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userProfile.data?.role === 'admin';
    const isOwner = letter.user_id === user.id;
    const isLawyer = userProfile.data?.role === 'lawyer'; // If you have lawyer role

    if (!isAdmin && !isOwner && !isLawyer) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      'draft': ['submitted', 'cancelled'],
      'submitted': ['in_review', 'cancelled'],
      'in_review': ['approved', 'submitted', 'cancelled'], // Can go back to submitted for revisions
      'approved': ['completed', 'in_review'], // Can go back for further review
      'completed': [], // Final state
      'cancelled': ['submitted'] // Can be reactivated
    };

    const currentStatus = letter.status;
    if (!validTransitions[currentStatus]?.includes(newStatus) && !isAdmin) {
      return new Response(
        JSON.stringify({
          error: `Invalid status transition from ${currentStatus} to ${newStatus}`,
          validTransitions: validTransitions[currentStatus] || []
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the letter status
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    if (lawyerId) {
      updateData.lawyer_id = lawyerId;
    }

    if (adminNotes) {
      // Store admin notes in a JSONB field or separate table
      updateData.admin_notes = adminNotes;
    }

    const { data: updatedLetter, error: updateError } = await supabaseClient
      .from('letters')
      .update(updateData)
      .eq('id', letterId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating letter:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update letter status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create status history record
    const { error: historyError } = await supabaseClient
      .from('letter_status_history')
      .insert({
        letter_id: letterId,
        old_status: currentStatus,
        new_status: newStatus,
        changed_by: user.id,
        notes: adminNotes,
        changed_at: new Date().toISOString()
      });

    if (historyError) {
      console.error('Error creating status history:', historyError);
      // Don't fail the request, just log the error
    }

    // Send real-time notification
    await supabaseClient
      .channel('letter_updates')
      .send({
        type: 'broadcast',
        event: 'status_updated',
        payload: {
          letterId,
          oldStatus: currentStatus,
          newStatus,
          updatedBy: user.id,
          timestamp: new Date().toISOString()
        }
      });

    // Send email notification to user if requested
    if (notifyUser && letter.profiles?.email) {
      try {
        const emailSubject = `Letter Status Update: ${letter.title}`;
        const emailBody = generateStatusUpdateEmail(letter.title, currentStatus, newStatus, letter.id);

        await supabaseClient.functions.invoke('send-email', {
          body: {
            to: letter.profiles.email,
            subject: emailSubject,
            body: emailBody
          }
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        letter: updatedLetter,
        message: `Letter status updated from ${currentStatus} to ${newStatus}`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in update-letter-status function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateStatusUpdateEmail(letterTitle: string, oldStatus: string, newStatus: string, letterId: string): string {
  const statusMessages: Record<string, string> = {
    'submitted': 'Your letter has been submitted and is queued for review.',
    'in_review': 'Your letter is currently being reviewed by our legal team.',
    'approved': 'Great news! Your letter has been approved and is ready for download.',
    'completed': 'Your letter has been successfully delivered.',
    'cancelled': 'Your letter request has been cancelled.'
  };

  const statusActions: Record<string, string> = {
    'submitted': 'We will notify you once the review begins.',
    'in_review': 'Our attorneys are carefully reviewing your letter to ensure it meets all legal requirements.',
    'approved': 'You can now download your letter and send it to the recipient.',
    'completed': 'Your legal matter is progressing as planned.',
    'cancelled': 'If this was done in error, please contact our support team.'
  };

  return `
    <h2>Letter Status Update</h2>

    <p>Dear Valued Client,</p>

    <p>The status of your letter "<strong>${letterTitle}</strong>" has been updated.</p>

    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p><strong>Previous Status:</strong> ${oldStatus.replace('_', ' ').toUpperCase()}</p>
      <p><strong>Current Status:</strong> ${newStatus.replace('_', ' ').toUpperCase()}</p>
    </div>

    <p>${statusMessages[newStatus] || 'Your letter status has been updated.'}</p>

    <p>${statusActions[newStatus] || 'Please check your dashboard for more details.'}</p>

    <p>You can view your letter and track its progress by logging into your account.</p>

    <hr>

    <p><small>This is an automated notification. If you have any questions, please contact our support team.</small></p>
  `;
}