import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://hevnbcyuqxirqwhekwse.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhldm5iY3l1cXhpcnF3aGVrd3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDU3MDUsImV4cCI6MjA3MzE4MTcwNX0.o_awyK7z7pHa06guTVGmsLANG4czQAvzJO1RP__Kwak';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCouponSystem() {
  try {
    // First, let's check if we have any discount codes
    console.log('Checking for existing discount codes...');
    const { data: codes, error: codesError } = await supabase
      .from('discount_codes')
      .select('*')
      .limit(5);

    console.log('Discount codes:', codes || codesError);

    // Test apply-coupon function
    if (codes && codes.length > 0) {
      console.log('Testing apply-coupon function...');
      const testCode = codes[0];

      const { data: couponResult, error: couponError } = await supabase.functions.invoke(
        'apply-coupon',
        {
          body: {
            couponCode: testCode.code,
            userId: 'adb39d17-16f5-44c7-968a-533fad7540c6',
            subscriptionType: 'monthly',
            originalAmount: 100
          },
        }
      );

      console.log('Apply Coupon Result:', couponResult || couponError);
    }

  } catch (error) {
    console.error('Coupon test failed:', error);
  }
}

testCouponSystem();