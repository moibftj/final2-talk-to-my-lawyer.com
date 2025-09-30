/// <reference types="https://raw.githubusercontent.com/denoland/deno/v1.40.2/cli/dts/lib.deno.ns.d.ts" />

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
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const { couponCode, userId, subscriptionType, originalAmount }: CouponRequest = await req.json()

    if (!couponCode || !userId || !subscriptionType || !originalAmount) {
      throw new Error('Missing required fields')
    }

    // Validate and get employee coupon using new three-tier schema
    const { data: employeeCoupon, error: codeError } = await supabase
      .from('employee_coupons')
      .select(`
        *,
        profiles!employee_id (id, email, role)
      `)
      .eq('code', couponCode)
      .eq('is_active', true)
      .single()

    if (codeError || !employeeCoupon) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid or inactive coupon code'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Verify employee role
    if (employeeCoupon.profiles?.role !== 'employee') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Coupon is not associated with a valid employee'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Calculate discount and final amounts
    const discountPercentage = employeeCoupon.discount_percentage
    const discountAmount = (originalAmount * discountPercentage) / 100
    const finalAmount = originalAmount - discountAmount
    const commissionAmount = (originalAmount * 5) / 100 // 5% commission for employee

    // Create subscription with coupon details
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_type: subscriptionType,
        amount: finalAmount,
        original_amount: originalAmount,
        discount_applied: discountAmount,
        coupon_code: couponCode,
        employee_id: employeeCoupon.employee_id,
        status: 'active',
        letters_allowed: subscriptionType === 'one_letter_299' ? 1 :
                        subscriptionType === 'four_monthly_299' ? 4 : 8
      })
      .select()
      .single()

    if (subscriptionError) {
      throw subscriptionError
    }

    // Record commission payment using new schema
    const { error: commissionError } = await supabase
      .from('commission_payments')
      .insert({
        employee_id: employeeCoupon.employee_id,
        referred_user_id: userId,
        commission_amount: commissionAmount,
        points_awarded: 1,
        trigger_event: 'subscription',
        reference_id: subscription.id
      })

    if (commissionError) {
      throw commissionError
    }

    // Update employee coupon usage count
    const { error: updateCouponError } = await supabase
      .from('employee_coupons')
      .update({
        usage_count: employeeCoupon.usage_count + 1
      })
      .eq('id', employeeCoupon.id)

    if (updateCouponError) {
      throw updateCouponError
    }

    // Update employee profile with points and commission
    // First get current values
    const { data: employeeProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('points, commission_earned')
      .eq('id', employeeCoupon.employee_id)
      .single()

    if (!fetchError && employeeProfile) {
      const currentPoints = employeeProfile.points || 0
      const currentCommission = employeeProfile.commission_earned || 0
      
      const { error: updateEmployeeError } = await supabase
        .from('profiles')
        .update({
          points: currentPoints + 1,
          commission_earned: currentCommission + commissionAmount
        })
        .eq('id', employeeCoupon.employee_id)

      if (updateEmployeeError) {
        console.warn('Failed to update employee totals:', updateEmployeeError)
      }
    }

    // Update user subscription status
    const { error: updateUserError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active'
      })
      .eq('id', userId)

    if (updateUserError) {
      console.warn('Failed to update user subscription status:', updateUserError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Coupon applied successfully',
        data: {
          subscriptionId: subscription.id,
          originalAmount,
          discountAmount,
          finalAmount,
          discountPercentage,
          commissionAmount,
          employeeId: employeeCoupon.employee_id,
          lettersAllowed: subscription.letters_allowed
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error applying coupon:', error)
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