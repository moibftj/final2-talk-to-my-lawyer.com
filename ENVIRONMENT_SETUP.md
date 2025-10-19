# Environment Variables Setup

This document outlines all the environment variables needed to run the Talk-to-My-Lawyer application.

## 🔐 Security Notice
**NEVER commit your actual secret keys to version control.** Always use environment variables and `.env` files that are included in `.gitignore`.

## Stripe Configuration

### Required Environment Variables

```bash
# Frontend (Vite) - .env.local
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51MhGNYHO5lTe0n28FNpzACFeovzKZ6SGE68lBDiF8BSLiOvg7p7jwIYN8tQdyDbkO2AGI8x3hAku7OHsrkpCAHqx00S8VNdGZl

# Backend/Edge Functions - Supabase Secrets
STRIPE_SECRET_KEY=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
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Setup Instructions

1. **Set Frontend Environment Variable:**
   ```bash
   # Create .env.local in the project root
   echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51MhGNYHO5lTe0n28FNpzACFeovzKZ6SGE68lBDiF8BSLiOvg7p7jwIYN8tQdyDbkO2AGI8x3hAku7OHsrkpCAHqx00S8VNdGZl" > .env.local
   ```

2. **Set Supabase Secrets:**
   ```bash
   # Using Supabase CLI
   supabase secrets set STRIPE_SECRET_KEY=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
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

3. **Configure Stripe Webhooks:**
   - Log into your Stripe Dashboard
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-project.supabase.co/functions/v1/handle-stripe-webhook`
   - Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
   - Copy the webhook signing secret and set it as `STRIPE_WEBHOOK_SECRET`

## Required Environment Variables

### Frontend (.env.local)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Optional API Configuration
VITE_API_URL=/api
```

### Backend (Supabase Secrets)
```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Email Configuration (if using email service)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
```

## Testing vs Production

### For Testing (Recommended)
Use Stripe test keys first:
```bash
# Test keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### For Production
Use the live keys you provided:
```bash
# Live keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51MhGNYHO5lTe0n28FNpzACFeovzKZ6SGE68lBDiF8BSLiOvg7p7jwIYN8tQdyDbkO2AGI8x3hAku7OHsrkpCAHqx00S8VNdGZl
STRIPE_SECRET_KEY=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
```

## Stripe Product Setup

You need to create the following products in your Stripe Dashboard:

### 1. Basic Plan - One Letter
- **Product ID:** `prod_basic_one_letter`
- **Price ID:** `price_one_letter`
- **Amount:** $19.99 USD
- **Billing:** One-time
- **Features:**
  - 1 legal letter draft
  - Basic document review
  - Email support
  - PDF download

### 2. Professional Plan - Monthly
- **Product ID:** `prod_professional_monthly`
- **Price ID:** `price_four_monthly`
- **Amount:** $49.99 USD
- **Billing:** Monthly recurring
- **Features:**
  - 4 legal letter drafts per month
  - Priority document review
  - Phone and email support
  - Document storage
  - PDF download

### 3. Premium Plan - Yearly
- **Product ID:** `prod_premium_yearly`
- **Price ID:** `price_eight_yearly`
- **Amount:** $199.99 USD
- **Billing:** Yearly recurring
- **Features:**
  - 8 legal letter drafts per month
  - Priority document review
  - Phone and email support
  - Document storage
  - PDF download
  - Save 15% compared to monthly

## Verification Commands

### Verify Environment Variables
```bash
# Check frontend variables
echo $VITE_STRIPE_PUBLISHABLE_KEY

# Check Supabase secrets
supabase secrets list
```

### Test Stripe Integration
```bash
# Test the create-checkout-session function
curl -X POST https://your-project.supabase.co/functions/v1/create-checkout-session \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"planId": "ONE_LETTER", "userId": "test-user-id"}'
```

## Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Use HTTPS** everywhere in production
3. **Validate webhook signatures** for all Stripe webhooks
4. **Monitor Stripe Dashboard** for suspicious activity
5. **Set up alerts** for failed payments and subscription cancellations
6. **Regularly rotate API keys** if compromised

## Troubleshooting

### Common Issues

1. **"Stripe is not defined"**
   - Make sure you're using the publishable key, not the secret key
   - Check that the Stripe SDK is properly loaded

2. **"Webhook signature verification failed"**
   - Ensure the webhook secret matches exactly
   - Check that the webhook URL is correct and accessible

3. **"Invalid API key"**
   - Verify the API key is correct for the environment (test vs live)
   - Make sure there are no extra spaces or characters

4. **"Cross-origin request blocked"**
   - Ensure your domain is added to Stripe's CORS settings
   - Check that you're using HTTPS in production

For more help, consult the [Stripe Documentation](https://stripe.com/docs) or [Supabase Documentation](https://supabase.com/docs).