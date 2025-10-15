# Stripe Setup Guide

This guide will help you configure the Stripe payment system with your live API keys.

## 🚀 Quick Setup

### 1. Set Environment Variables

Create a `.env.local` file in your project root:

```bash
# Frontend Environment Variables
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51MhGNYHO5lTe0n28FNpzACFeovzKZ6SGE68lBDiF8BSLiOvg7p7jwIYN8tQdyDbkO2AGI8x3hAku7OHsrkpCAHqx00S8VNdGZl
```

Set Supabase secrets:

```bash
# Backend Environment Variables
supabase secrets set STRIPE_SECRET_KEY=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
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. Install Stripe Dependencies

```bash
# Frontend
npm install @stripe/stripe-js

# Already installed for backend (Edge Functions run on Deno)
```

### 3. Create Stripe Products

In your Stripe Dashboard, create these products:

#### Basic Plan - One Letter ($19.99)
- **Name**: Basic Plan - One Letter
- **Description**: Single legal letter generation with basic features
- **Price**: $19.99 USD
- **Billing**: One-time
- **Price ID**: `price_one_letter`

#### Professional Plan - Monthly ($49.99)
- **Name**: Professional Plan - Monthly
- **Description**: 4 legal letters per month with priority support
- **Price**: $49.99 USD
- **Billing**: Monthly recurring
- **Price ID**: `price_four_monthly`

#### Premium Plan - Yearly ($199.99)
- **Name**: Premium Plan - Yearly
- **Description**: 8 legal letters per month with premium features
- **Price**: $199.99 USD
- **Billing**: Yearly recurring
- **Price ID**: `price_eight_yearly`

### 4. Configure Webhooks

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-project.supabase.co/functions/v1/handle-stripe-webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret
5. Set it as environment variable:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
   ```

### 5. Update Price IDs in Code

Edit `/services/stripeService.ts` and `/supabase/functions/create-checkout-session/index.ts`:

```typescript
export const STRIPE_PRICES = {
  ONE_LETTER: 'price_one_letter', // Replace with actual Stripe price ID
  FOUR_MONTHLY: 'price_four_monthly', // Replace with actual Stripe price ID
  EIGHT_YEARLY: 'price_eight_yearly', // Replace with actual Stripe price ID
} as const;
```

### 6. Test the Integration

```bash
# Start development server
npm run dev

# Test subscription flow
# 1. Go to subscription page
# 2. Select a plan
# 3. Click "Subscribe Now"
# 4. Should redirect to Stripe Checkout
```

## 🔧 Configuration Details

### Frontend Configuration

The frontend uses the publishable key to initialize Stripe:

```typescript
// services/stripeService.ts
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
```

### Backend Configuration

Edge functions use the secret key for API calls:

```typescript
// supabase/functions/create-checkout-session/index.ts
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
```

### Database Tables

The system uses these tables:
- `subscriptions` - Track active subscriptions
- `discount_codes` - Employee referral codes
- `coupon_usage` - Track discount usage
- `commission_transactions` - Track affiliate commissions

## 🛡️ Security Notes

1. **Never expose secret keys** in frontend code
2. **Always use HTTPS** in production
3. **Verify webhook signatures** for all incoming webhooks
4. **Set up proper CORS** in your Stripe account
5. **Monitor transactions** in Stripe Dashboard

## 📊 What Happens During Subscription

1. User clicks "Subscribe Now"
2. Frontend calls `/create-checkout-session` edge function
3. Edge function creates Stripe Checkout session
4. User is redirected to Stripe's secure payment page
5. After payment, Stripe sends webhook to `/handle-stripe-webhook`
6. Webhook creates subscription record in database
7. User is redirected back to dashboard with active subscription

## 🧪 Testing

### Test Mode

For testing, switch to test keys:

```bash
# Test keys (safer for development)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Testing Scenarios

1. **Successful Payment**: Complete checkout flow
2. **Failed Payment**: Use Stripe's test cards for failures
3. **Subscription Cancellation**: Test webhook handling
4. **Discount Codes**: Test affiliate code functionality

## 🚨 Troubleshooting

### Common Issues

1. **"No such price ID"**
   - Check that price IDs match exactly in Stripe dashboard
   - Ensure you're using live or test mode consistently

2. **"Webhook signature verification failed"**
   - Verify webhook secret is set correctly
   - Check that webhook URL is accessible

3. **"CORS error"**
   - Ensure your domain is added to Stripe's CORS settings
   - Check that you're using HTTPS in production

4. **"Redirect loop"**
   - Check user authentication state
   - Verify subscription status in database

### Getting Help

- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- Check browser console for detailed error messages
- Review Supabase function logs for debugging

## ✅ Verification Checklist

- [ ] Environment variables set correctly
- [ ] Stripe products created with correct prices
- [ ] Webhook endpoint configured and accessible
- [ ] Test payment flow works end-to-end
- [ ] Database tables created and working
- [ ] Commission calculations working for employee referrals
- [ ] Email notifications configured (if needed)

Your Stripe payment system is now ready for production use! 💳