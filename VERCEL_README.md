# Vercel Deployment Guide for Talk-To-My-Lawyer

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm install -g vercel`
3. **Environment Variables**: Ensure your `.env` file has all required variables

## Quick Deployment Steps

### Step 1: Authenticate with Vercel

```bash
vercel login
```

Follow the authentication process in your browser.

### Step 2: Set Environment Variables

Run the setup script to configure all environment variables:

```bash
./set-vercel-env.sh
```

This will set the following variables for production, preview, and development:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` 
- `VITE_API_URL`
- `SENDGRID_API_KEY`
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Deploy

Run the deployment script:

```bash
./deploy-vercel.sh
```

## Manual Deployment

If you prefer to deploy manually:

1. **Build the project**:
   ```bash
   pnpm build
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

## Environment Variables Setup (Manual)

If you need to set environment variables manually:

```bash
# Production environment
vercel env add VITE_SUPABASE_URL "https://qrqnknpxgpbghnbiybyx.supabase.co" production
vercel env add VITE_SUPABASE_ANON_KEY "your-anon-key" production
vercel env add SENDGRID_API_KEY "your-sendgrid-key" production
# ... add other variables
```

## Project Configuration

The project is configured with:

- **Framework**: Vite + React + TypeScript
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Node Version**: 20.19.0+
- **Package Manager**: pnpm

## Vercel Configuration

The `vercel.json` file includes:
- Build settings for Vite
- Environment variable mappings
- SPA routing configuration
- Function configurations

## Custom Domains

To add a custom domain:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain
5. Configure DNS records as instructed

## Troubleshooting

### Build Issues
- Ensure all dependencies are installed: `pnpm install`
- Check Node.js version: `node --version` (should be 20.19.0+)
- Clear cache: `pnpm store prune`

### Environment Variables
- Verify all required variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Ensure VITE_ prefix for client-side variables

### Deployment Issues
- Check build logs in Vercel dashboard
- Verify `vercel.json` configuration
- Ensure all files are committed to Git

## Support

For deployment issues:
- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Review build logs in Vercel dashboard
- Contact support through Vercel dashboard