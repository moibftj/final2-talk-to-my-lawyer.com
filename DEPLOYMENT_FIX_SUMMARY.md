# 🔧 Netlify Deployment Fix - White Screen Issue

## 🔍 Problem Diagnosis

Your website www.talk-to-my-lawyer.com was showing a blank white screen because:

1. **Missing Environment Variables**: Your `.env.production` file contained placeholder values instead of actual Supabase configuration values
2. **Failed Supabase Initialization**: The app's Supabase client throws an error when environment variables are missing, causing the app to crash silently
3. **Production vs Development**: Your local `.env` file has the correct values, but they weren't being used in the Netlify production build

## ✅ Solution Applied

### Fixed Files:
- Updated `.env.production` with correct values from your `.env` file

### Root Cause:
The Supabase service (`services/supabase.ts`) has this error handling:
```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be provided.'
  );
}
```

When placeholder values were used, Supabase failed to initialize, breaking the entire app.

## 🚀 Next Steps (Choose One Method)

### Method 1: Netlify CLI (Recommended)
```bash
# Login to Netlify
npx netlify-cli login

# Link your site
npx netlify-cli link

# Set environment variables
npx netlify-cli env:set VITE_SUPABASE_URL "https://your-project-ref.supabase.co"
npx netlify-cli env:set VITE_SUPABASE_ANON_KEY "your-supabase-anon-key"
npx netlify-cli env:set VITE_API_URL "https://your-project-ref.supabase.co"
npx netlify-cli env:set OPENAI_API_KEY "your-openai-api-key"

# Deploy
npx netlify-cli deploy --prod
```

### Method 2: Netlify Dashboard
1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Select your site: **talk-to-my-lawyer.com**
3. Navigate to: **Site settings > Environment variables**
4. Add these variables:
   - `VITE_SUPABASE_URL` = `https://your-project-ref.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-supabase-anon-key`
   - `VITE_API_URL` = `https://your-project-ref.supabase.co`
   - `OPENAI_API_KEY` = `your-openai-api-key`
5. Save and trigger a new deployment

## 🧪 Testing

### Local Testing (Confirmed Working):
- ✅ `npm run build` - Builds successfully
- ✅ `npm run preview` - Local production preview works
- ✅ Environment variables are correctly loaded

### Expected Result:
After setting up the environment variables in Netlify, your site at https://www.talk-to-my-lawyer.com should load correctly and show your landing page instead of a blank white screen.

## 📁 Files Modified:
- `.env.production` - Updated with correct environment variables
- `fix-netlify-deployment.sh` - Created with step-by-step instructions

## 🔄 Verification:
Once you complete the Netlify setup:
1. Visit https://www.talk-to-my-lawyer.com
2. You should see your landing page with the title "talk-to-my-lawyer"
3. The console should show no JavaScript errors
4. All features should work as expected