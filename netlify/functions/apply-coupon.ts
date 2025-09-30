import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

interface CouponRequest {
  couponCode: string
  userId: string
  subscriptionType: string
  originalAmount: number
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
    const { couponCode, userId, subscriptionType, originalAmount }: CouponRequest = JSON.parse(event.body || '{}')

    if (!couponCode || !userId || !subscriptionType || !originalAmount) {
      throw new Error('Missing required fields')
    }

    // Validate and get discount code
    const { data: discountCode, error: codeError } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', couponCode)
      .eq('is_active', true)
      .single()

    if (codeError || !discountCode) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Invalid or inactive coupon code'
        })
      }
    }

    // Calculate discount and final amounts
    const discountPercentage = discountCode.discount_percentage
    const discountAmount = (originalAmount * discountPercentage) / 100
    const finalAmount = originalAmount - discountAmount
    const commissionAmount = (originalAmount * 5) / 100 // 5% commission for employee

    // Start a transaction
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_type: subscriptionType,
        amount: finalAmount,
        discount_code_id: discountCode.id,
        status: 'active'
      })
      .select()
      .single()

    if (subscriptionError) {
      throw subscriptionError
    }

    // Record discount usage
    const { error: usageError } = await supabase
      .from('discount_usage')
      .insert({
        discount_code_id: discountCode.id,
        user_id: userId,
        employee_id: discountCode.employee_id,
        subscription_amount: originalAmount,
        discount_amount: discountAmount,
        commission_amount: commissionAmount
      })

    if (usageError) {
      throw usageError
    }

    // Update discount code usage count
    const { error: updateCodeError } = await supabase
      .from('discount_codes')
      .update({
        usage_count: discountCode.usage_count + 1
      })
      .eq('id', discountCode.id)

    if (updateCodeError) {
      throw updateCodeError
    }

    // Update employee points (assuming a points column exists in profiles)
    // First get current points value
    const { data: employeeProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', discountCode.employee_id)
      .single()

    if (!fetchError && employeeProfile) {
      const currentPoints = employeeProfile.points || 0
      const { error: pointsError } = await supabase
        .from('profiles')
        .update({
          points: currentPoints + 1
        })
        .eq('id', discountCode.employee_id)

      if (pointsError) {
        console.warn('Failed to update employee points:', pointsError)
      }
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Coupon applied successfully',
        data: {
          subscriptionId: subscription.id,
          originalAmount,
          discountAmount,
          finalAmount,
          discountPercentage,
          commissionAmount
        }
      })
    }

  } catch (error) {
    console.error('Error applying coupon:', error)
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