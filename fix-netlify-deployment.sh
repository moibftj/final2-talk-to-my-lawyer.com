#!/bin/bash

echo "🔧 Fixing Netlify Deployment - Environment Variables Setup"
echo "========================================================="

echo ""
echo "📋 STEP 1: Login to Netlify CLI"
echo "Run the following command and follow the authentication process:"
echo "  npx netlify-cli login"

echo ""
echo "📋 STEP 2: Link your site (if not already linked)"
echo "  npx netlify-cli link"

echo ""
echo "📋 STEP 3: Set Environment Variables"
echo "Copy and paste these commands one by one:"

echo ""
echo "# Supabase Configuration"
echo "npx netlify-cli env:set VITE_SUPABASE_URL \"https://hevnbcyuqxirqwhekwse.supabase.co\""
echo "npx netlify-cli env:set VITE_SUPABASE_ANON_KEY \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhldm5iY3l1cXhpcnF3aGVrd3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDU3MDUsImV4cCI6MjA3MzE4MTcwNX0.o_awyK7z7pHa06guTVGmsLANG4czQAvzJO1RP__Kwak\""

echo ""
echo "# API Configuration"
echo "npx netlify-cli env:set VITE_API_URL \"https://hevnbcyuqxirqwhekwse.supabase.co\""

echo ""
echo "# OpenAI Codex Configuration"
echo "npx netlify-cli env:set OPENAI_API_KEY \"<your-openai-api-key>\""

echo ""
echo "# For Netlify Functions (backend)"
echo "npx netlify-cli env:set SUPABASE_URL \"https://hevnbcyuqxirqwhekwse.supabase.co\""
echo "npx netlify-cli env:set SUPABASE_SERVICE_ROLE_KEY \"<your-service-role-key>\""

echo ""
echo "📋 STEP 4: Trigger a new deployment"
echo "  npx netlify-cli build"
echo "  npx netlify-cli deploy --prod"

echo ""
echo "📋 ALTERNATIVE: Manual Setup via Netlify Dashboard"
echo "If you prefer to set up via the web interface:"
echo "1. Go to https://app.netlify.com"
echo "2. Select your site (talk-to-my-lawyer.com)"
echo "3. Go to Site settings > Environment variables"
echo "4. Add these variables:"
echo "   VITE_SUPABASE_URL = https://hevnbcyuqxirqwhekwse.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhldm5iY3l1cXhpcnF3aGVrd3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDU3MDUsImV4cCI6MjA3MzE4MTcwNX0.o_awyK7z7pHa06guTVGmsLANG4czQAvzJO1RP__Kwak"
echo "   VITE_API_URL = https://hevnbcyuqxirqwhekwse.supabase.co"
echo "   OPENAI_API_KEY = <your-openai-api-key>"
echo "   SUPABASE_URL = https://hevnbcyuqxirqwhekwse.supabase.co"
echo "   SUPABASE_SERVICE_ROLE_KEY = <set in Netlify UI only>"
echo "5. Save and trigger a new deployment"

echo ""
echo "✅ After completing these steps, your site should work correctly!"
echo "🌐 Visit: https://www.talk-to-my-lawyer.com to verify"