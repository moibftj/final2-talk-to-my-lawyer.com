import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApplyCouponRequest {
  discountCode: string;
  planType: 'one_letter' | 'four_monthly' | 'eight_yearly';
  subscriptionAmount: number;
  paymentMethodId?: string;
  billingDetails?: {
    name: string;
    email: string;
    address?: any;
  };
}

interface SubscriptionResponse {
  success: boolean;
  subscription?: any;
  discountUsage?: any;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  error?: string;
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

    const {
      discountCode,
      planType,
      subscriptionAmount,
      paymentMethodId,
      billingDetails
    }: ApplyCouponRequest = await req.json();

    if (!planType || !subscriptionAmount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: planType, subscriptionAmount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let discountAmount = 0;
    let discountUsage = null;
    let validatedDiscount = null;

    // Validate and apply discount code if provided
    if (discountCode) {
      // Get discount code details
      const { data: discountData, error: discountError } = await supabaseClient
        .from('discount_codes')
        .select(`
          *,
          profiles:employee_id (email, raw_user_meta_data)
        `)
        .eq('code', discountCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (discountError || !discountData) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid or expired discount code',
            totalAmount: subscriptionAmount,
            discountAmount: 0,
            finalAmount: subscriptionAmount
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      validatedDiscount = discountData;
      discountAmount = (subscriptionAmount * discountData.discount_percentage) / 100;

      // Calculate employee commission (5% of original subscription amount)
      const commissionAmount = (subscriptionAmount * 5) / 100;

      // Record discount usage and commission
      const { data: usageData, error: usageError } = await supabaseClient
        .from('discount_usage')
        .insert({
          discount_code_id: discountData.id,
          user_id: user.id,
          employee_id: discountData.employee_id,
          subscription_amount: subscriptionAmount,
          discount_amount: discountAmount,
          commission_amount: commissionAmount
        })
        .select()
        .single();

      if (usageError) {
        console.error('Error recording discount usage:', usageError);
        return new Response(
          JSON.stringify({ error: 'Failed to apply discount code' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      discountUsage = usageData;

      // Update discount code usage count
      await supabaseClient
        .from('discount_codes')
        .update({
          usage_count: discountData.usage_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', discountData.id);

      // Add points to employee (1 point per successful referral)
      await supabaseClient
        .from('employee_points')
        .insert({
          employee_id: discountData.employee_id,
          points_earned: 1,
          source: 'referral',
          reference_id: usageData.id,
          description: `Referral bonus for discount code ${discountCode}`,
          earned_at: new Date().toISOString()
        });
    }

    const finalAmount = subscriptionAmount - discountAmount;

    // Create subscription record
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_type: planType,
        amount: finalAmount,
        original_amount: subscriptionAmount,
        discount_amount: discountAmount,
        discount_code_id: validatedDiscount?.id || null,
        status: 'active',
        payment_method_id: paymentMethodId,
        billing_details: billingDetails
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);

      // Rollback discount usage if subscription creation fails
      if (discountUsage) {
        await supabaseClient
          .from('discount_usage')
          .delete()
          .eq('id', discountUsage.id);
      }

      return new Response(
        JSON.stringify({ error: 'Failed to create subscription' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update user's letter credit count based on plan
    const letterCredits: Record<string, number> = {
      'one_letter': 1,
      'four_monthly': 4,
      'eight_yearly': 8
    };

    const creditsToAdd = letterCredits[planType] || 0;

    // Add credits to user profile or separate credits table
    await supabaseClient
      .from('user_credits')
      .upsert({
        user_id: user.id,
        total_credits: creditsToAdd,
        remaining_credits: creditsToAdd,
        plan_type: planType,
        subscription_id: subscription.id,
        expires_at: planType === 'one_letter' ? null : getExpirationDate(planType)
      });

    // Send confirmation email
    try {
      await supabaseClient.functions.invoke('send-email', {
        body: {
          to: user.email,
          subject: 'Subscription Confirmation - Talk to My Lawyer',
          body: generateSubscriptionConfirmationEmail({
            planType,
            amount: finalAmount,
            originalAmount: subscriptionAmount,
            discountAmount,
            discountCode: validatedDiscount?.code,
            letterCredits: creditsToAdd
          })
        }
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Send commission notification to employee
    if (validatedDiscount && discountUsage) {
      try {
        await supabaseClient.functions.invoke('send-email', {
          body: {
            to: validatedDiscount.profiles.email,
            subject: 'Commission Earned - Referral Bonus',
            body: generateCommissionEmail({
              discountCode: validatedDiscount.code,
              commissionAmount: discountUsage.commission_amount,
              referredUserEmail: user.email
            })
          }
        });
      } catch (emailError) {
        console.error('Failed to send commission email:', emailError);
      }
    }

    const response: SubscriptionResponse = {
      success: true,
      subscription,
      discountUsage,
      totalAmount: subscriptionAmount,
      discountAmount,
      finalAmount
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in apply-coupon function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getExpirationDate(planType: string): string {
  const now = new Date();
  switch (planType) {
    case 'four_monthly':
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
    case 'eight_yearly':
      return new Date(now.setFullYear(now.getFullYear() + 1)).toISOString();
    default:
      return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
  }
}

function generateSubscriptionConfirmationEmail(details: {
  planType: string;
  amount: number;
  originalAmount: number;
  discountAmount: number;
  discountCode?: string;
  letterCredits: number;
}): string {
  const planNames: Record<string, string> = {
    'one_letter': 'Single Letter Plan',
    'four_monthly': 'Monthly Plan (4 Letters)',
    'eight_yearly': 'Yearly Plan (8 Letters/month)'
  };

  return `
    <h2>Welcome to Talk to My Lawyer!</h2>

    <p>Thank you for subscribing to our legal letter service. Your subscription has been confirmed.</p>

    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Subscription Details</h3>
      <p><strong>Plan:</strong> ${planNames[details.planType] || details.planType}</p>
      <p><strong>Letter Credits:</strong> ${details.letterCredits}</p>
      ${details.discountCode ? `<p><strong>Discount Code Used:</strong> ${details.discountCode}</p>` : ''}
      ${details.originalAmount !== details.amount ? `<p><strong>Original Amount:</strong> $${details.originalAmount.toFixed(2)}</p>` : ''}
      ${details.discountAmount > 0 ? `<p><strong>Discount Applied:</strong> -$${details.discountAmount.toFixed(2)}</p>` : ''}
      <p><strong>Amount Charged:</strong> $${details.amount.toFixed(2)}</p>
    </div>

    <p>You can now start creating AI-generated legal letters through your dashboard.</p>

    <p>If you have any questions, please don't hesitate to contact our support team.</p>

    <p>Best regards,<br>The Talk to My Lawyer Team</p>
  `;
}

function generateCommissionEmail(details: {
  discountCode: string;
  commissionAmount: number;
  referredUserEmail: string;
}): string {
  return `
    <h2>Commission Earned!</h2>

    <p>Congratulations! You've earned a commission from a successful referral.</p>

    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Commission Details</h3>
      <p><strong>Discount Code:</strong> ${details.discountCode}</p>
      <p><strong>Commission Amount:</strong> $${details.commissionAmount.toFixed(2)}</p>
      <p><strong>Referred User:</strong> ${details.referredUserEmail}</p>
      <p><strong>Points Earned:</strong> 1 point</p>
    </div>

    <p>This commission will be included in your next payout. You can track all your earnings in your employee dashboard.</p>

    <p>Keep sharing your discount code to earn more commissions!</p>

    <p>Best regards,<br>The Talk to My Lawyer Team</p>
  `;
}