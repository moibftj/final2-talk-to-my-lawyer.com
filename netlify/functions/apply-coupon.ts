import { Handler } from '@netlify/functions';
import { getSupabaseAdmin } from '../../services/supabaseAdmin';
import { getUserContext, jsonResponse } from './_auth';

interface CouponRequest {
  couponCode: string;
  userId: string;
  subscriptionType: string;
  originalAmount: number;
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

    // Secure admin client (server-only) only after passing auth check
    const supabase = getSupabaseAdmin();

    // Get request body
    const {
      couponCode,
      userId,
      subscriptionType,
      originalAmount,
    }: CouponRequest = JSON.parse(event.body || '{}');

    if (!couponCode || !userId || !subscriptionType || !originalAmount) {
      return jsonResponse(400, { 
        success: false, 
        error: 'Missing required fields' 
      }, corsHeaders)
    }

    // SECURITY: Validate userId - ensure user can only apply coupons for themselves
    if (userId !== user.id && profile?.role !== 'admin') {
      return jsonResponse(403, {
        success: false,
        error: 'You can only apply coupons for yourself'
      }, corsHeaders)
    }

    // Validate and get discount code
    const { data: discountCode, error: codeError } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', couponCode)
      .eq('is_active', true)
      .single();

    if (codeError || !discountCode) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Invalid or inactive coupon code',
        }),
      };
    }

    // Calculate discount and final amounts
    const discountPercentage = discountCode.discount_percentage;
    const discountAmount = (originalAmount * discountPercentage) / 100;
    const finalAmount = originalAmount - discountAmount;
    const commissionAmount = (originalAmount * 5) / 100; // 5% commission for employee

    // Start a transaction
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_type: subscriptionType,
        amount: finalAmount,
        discount_code_id: discountCode.id,
        status: 'active',
      })
      .select()
      .single();

    if (subscriptionError) {
      throw subscriptionError;
    }

    // Record discount usage
    const { error: usageError } = await supabase.from('discount_usage').insert({
      discount_code_id: discountCode.id,
      user_id: userId,
      employee_id: discountCode.employee_id,
      subscription_amount: originalAmount,
      discount_amount: discountAmount,
      commission_amount: commissionAmount,
    });

    if (usageError) {
      throw usageError;
    }

    // Update discount code usage count
    const { error: updateCodeError } = await supabase
      .from('discount_codes')
      .update({
        usage_count: discountCode.usage_count + 1,
      })
      .eq('id', discountCode.id);

    if (updateCodeError) {
      throw updateCodeError;
    }

    // Update employee points (assuming a points column exists in profiles)
    // First get current points value
    const { data: employeeProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', discountCode.employee_id)
      .single();

    if (!fetchError && employeeProfile) {
      const currentPoints = employeeProfile.points || 0;
      const { error: pointsError } = await supabase
        .from('profiles')
        .update({
          points: currentPoints + 1,
        })
        .eq('id', discountCode.employee_id);

      if (pointsError) {
        console.warn('Failed to update employee points:', pointsError);
      }
    }

    return jsonResponse(200, {
      success: true,
      message: 'Coupon applied successfully',
      requestedBy: { id: user.id, role: profile?.role },
      data: {
        subscriptionId: subscription.id,
        originalAmount,
        discountAmount,
        finalAmount,
        discountPercentage,
        commissionAmount,
      }
    }, corsHeaders);
  } catch (error: unknown) {
    let status = 500;
    let message = 'Internal Server Error';

    if (typeof error === 'object' && error !== null) {
      if ('statusCode' in error && typeof (error as any).statusCode === 'number') {
        status = (error as any).statusCode;
      }
      if ('message' in error && typeof (error as any).message === 'string') {
        message = (error as any).message;
      }
    }

    if (status >= 500) {
      console.error('Error applying coupon:', error);
    }
    return jsonResponse(status, { success: false, error: message }, corsHeaders);
  }
};
