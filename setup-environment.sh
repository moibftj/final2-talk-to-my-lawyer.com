#!/bin/bash

# Setup Environment Variables for MVP
# This script configures all required environment variables for the application

set -e

echo "🚀 Setting up environment variables for MVP..."

# Gemini API Key
if [ -z "$GEMINI_API_KEY" ]; then
  read -p "Enter your Gemini API Key: " GEMINI_API_KEY
fi

echo "📝 Creating .env file for local development..."

# Create or update .env file
cat > .env << EOF
# Gemini AI Configuration
GEMINI_API_KEY=$GEMINI_API_KEY

# Supabase Configuration (update with your actual values)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Application Settings
NODE_ENV=development
EOF

echo "✅ .env file created"

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Update Supabase Edge Functions secrets:"
echo "   - Go to Supabase Dashboard → Settings → Edge Functions"
echo "   - Add secret: GEMINI_API_KEY = $GEMINI_API_KEY"
echo ""
echo "2. Update Vercel environment variables:"
echo "   vercel env add VITE_GEMINI_API_KEY production"
echo "   (When prompted, enter: $GEMINI_API_KEY)"
echo ""
echo "3. Run database migration:"
echo "   cd supabase"
echo "   supabase db push"
echo ""
echo "4. Deploy Supabase functions:"
echo "   supabase functions deploy generate-draft"
echo "   supabase functions deploy create-employee-coupon"
echo "   supabase functions deploy calculate-commission"
echo ""
echo "5. Test locally:"
echo "   pnpm dev"
echo ""

echo "🎉 Environment setup complete!"
