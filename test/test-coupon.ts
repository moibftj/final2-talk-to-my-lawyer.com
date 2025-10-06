import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

if (
  !process.env.VITE_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL === 'your-supabase-url'
) {
  console.warn(
    '⚠️  Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before running this test.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCouponSystem() {
  try {
    console.log('Fetching active employee coupons...');
    const { data: coupons, error: couponsError } = await supabase
      .from('employee_coupons')
      .select('code, discount_percentage, is_active')
      .eq('is_active', true)
      .limit(1);

    if (couponsError) {
      throw couponsError;
    }

    if (!coupons || coupons.length === 0) {
      console.warn(
        'No active employee coupons found. Seed test data to fully exercise apply-coupon.'
      );
      return;
    }

    const testCoupon = coupons[0];
    console.log('Testing apply-coupon function with code:', testCoupon.code);

    const { data: couponResult, error: couponError } = await supabase.functions.invoke(
      'apply-coupon',
      {
        body: {
          couponCode: testCoupon.code,
          userId: 'adb39d17-16f5-44c7-968a-533fad7540c6',
          subscriptionType: 'monthly',
          originalAmount: 100,
        },
      }
    );

    if (couponError) {
      throw couponError;
    }

    if (!couponResult?.success) {
      throw new Error(`Expected success response but received: ${JSON.stringify(couponResult)}`);
    }

    const appliedDiscount = couponResult.data?.discountPercentage;
    if (typeof appliedDiscount !== 'number') {
      throw new Error('Coupon response missing discountPercentage.');
    }

    if (appliedDiscount !== testCoupon.discount_percentage) {
      throw new Error(
        `Discount mismatch. Expected ${testCoupon.discount_percentage} but received ${appliedDiscount}.`
      );
    }

    console.log('Apply Coupon Result:', couponResult);
    console.log('✅ Coupon test passed');
  } catch (error) {
    console.error('Coupon test failed:', error);
  }
}

testCouponSystem();