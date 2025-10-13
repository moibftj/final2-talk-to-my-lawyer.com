# Supabase Instance Migration Guide

**Date:** October 13, 2025  
**From:** `auxjfqsrapfznoziykql.supabase.co`  
**To:** `qrqnknpxgpbghnbiybyx.supabase.co`  
**Status:** 🔄 Migration Required  

---

## 🎯 Migration Overview

You're migrating from your current Supabase instance to a new one. This guide covers all the steps needed to switch your "Talk to My Lawyer" application to use the new Supabase instance.

**Current Instance:** `https://auxjfqsrapfznoziykql.supabase.co`  
**New Instance:** `https://qrqnknpxgpbghnbiybyx.supabase.co`

---

## ⚠️ Prerequisites

Before starting the migration, ensure you have:

- [ ] Access to the new Supabase project (`qrqnknpxgpbghnbiybyx`)
- [ ] New API keys from the new Supabase instance
- [ ] Database schema ready in the new instance
- [ ] Backup of current data (if needed to migrate)
- [ ] Admin access to both Supabase projects

---

## 🔑 Step 1: Get New API Keys

1. **Go to your new Supabase project:**
   ```
   https://supabase.com/dashboard/project/qrqnknpxgpbghnbiybyx
   ```

2. **Navigate to Settings → API:**
   ```
   Project Settings → API
   ```

3. **Copy these values:**
   - **Project URL:** `https://qrqnknpxgpbghnbiybyx.supabase.co`
   - **Anon/Public Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (anon key)
   - **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (service_role key)

---

## 🔧 Step 2: Update Environment Variables

### Local Development (.env file)

**Current Configuration:**
```env
VITE_SUPABASE_URL=https://auxjfqsrapfznoziykql.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=https://auxjfqsrapfznoziykql.supabase.co
SUPABASE_URL=https://auxjfqsrapfznoziykql.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**New Configuration:**
```env
VITE_SUPABASE_URL=https://qrqnknpxgpbghnbiybyx.supabase.co
VITE_SUPABASE_ANON_KEY=[NEW_ANON_KEY_FROM_NEW_PROJECT]
VITE_API_URL=https://qrqnknpxgpbghnbiybyx.supabase.co
SUPABASE_URL=https://qrqnknpxgpbghnbiybyx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[NEW_SERVICE_ROLE_KEY_FROM_NEW_PROJECT]
```

### Production Environment (Netlify)

Update these environment variables in your Netlify dashboard or use the script:

```bash
# Update Netlify environment variables
netlify env:set VITE_SUPABASE_URL "https://qrqnknpxgpbghnbiybyx.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "[NEW_ANON_KEY]"
netlify env:set VITE_API_URL "https://qrqnknpxgpbghnbiybyx.supabase.co"
netlify env:set SUPABASE_URL "https://qrqnknpxgpbghnbiybyx.supabase.co"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "[NEW_SERVICE_ROLE_KEY]"
```

---

## 🗄️ Step 3: Database Migration

### Option A: Fresh Start (Recommended for New Instance)

1. **Run your existing migrations on the new instance:**
   ```bash
   # Connect to new Supabase project
   supabase link --project-ref qrqnknpxgpbghnbiybyx
   
   # Push your schema to the new instance
   supabase db push
   ```

2. **Verify tables and policies:**
   - Check that all your tables exist
   - Verify Row Level Security (RLS) policies
   - Confirm user roles and permissions

### Option B: Data Migration (If you need to migrate existing data)

1. **Export data from old instance:**
   ```bash
   # Export data from old instance
   supabase db dump --data-only --file=data_backup.sql
   ```

2. **Import to new instance:**
   ```bash
   # Switch to new instance and import
   supabase db reset
   psql -h db.qrqnknpxgpbghnbiybyx.supabase.co -d postgres -U postgres -f data_backup.sql
   ```

---

## 🔨 Step 4: Update Supabase Functions

All your Supabase Edge Functions need to be deployed to the new instance:

```bash
# Deploy all functions to new instance
supabase functions deploy get-all-letters --project-ref qrqnknpxgpbghnbiybyx
supabase functions deploy get-all-users --project-ref qrqnknpxgpbghnbiybyx
supabase functions deploy update-letter-status --project-ref qrqnknpxgpbghnbiybyx
supabase functions deploy generate-draft --project-ref qrqnknpxgpbghnbiybyx
supabase functions deploy apply-coupon --project-ref qrqnknpxgpbghnbiybyx
supabase functions deploy send-email --project-ref qrqnknpxgpbghnbiybyx
```

**Or deploy all at once:**
```bash
supabase functions deploy --project-ref qrqnknpxgpbghnbiybyx
```

---

## 📧 Step 5: Configure Email Templates

### SMTP Configuration

1. **Go to new Supabase project → Authentication → SMTP Settings**
2. **Configure your email provider** (same as before):
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   Sender Name: Talk to My Lawyer
   Sender Email: noreply@talktomylawyer.com
   ```

### Upload Email Templates

Re-upload your custom "Talk to My Lawyer" email templates:

1. **Navigate to Authentication → Email Templates**
2. **Upload each template:**
   - **Confirm Signup:** Copy from `supabase/templates/confirmation.html`
   - **Reset Password:** Copy from `supabase/templates/recovery.html`
   - **Invite User:** Copy from `supabase/templates/invite.html`
   - **Confirm Email Change:** Copy from `supabase/templates/email_change.html`

### Set Custom Subjects

- **Welcome Email:** "Welcome to Talk to My Lawyer - Confirm Your Email"
- **Password Reset:** "Reset Your Talk to My Lawyer Password"
- **Invitation:** "You're invited to Talk to My Lawyer"
- **Email Change:** "Talk to My Lawyer - Confirm Email Change"

---

## 🔐 Step 6: Authentication Configuration

### Site URL and Redirect URLs

1. **Go to Authentication → URL Configuration**
2. **Set Site URL:**
   ```
   Site URL: https://talktomylawyer.com
   ```
3. **Add Redirect URLs:**
   ```
   https://talktomylawyer.com/**
   http://localhost:5174/**
   http://127.0.0.1:5174/**
   ```

### Provider Settings

If you're using OAuth providers (Google, GitHub, etc.), reconfigure them in the new instance:
- **Google OAuth:** Update client ID and secret
- **GitHub OAuth:** Update app credentials
- **Other providers:** Reconfigure as needed

---

## 🚀 Step 7: Update Deployment Scripts

### Update set-netlify-env.sh

```bash
#!/bin/bash
# Update Netlify environment variables for new Supabase instance

echo "Setting Netlify environment variables for new Supabase instance..."

netlify env:set VITE_SUPABASE_URL "https://qrqnknpxgpbghnbiybyx.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "[NEW_ANON_KEY]"
netlify env:set VITE_API_URL "https://qrqnknpxgpbghnbiybyx.supabase.co"
netlify env:set SUPABASE_URL "https://qrqnknpxgpbghnbiybyx.supabase.co"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "[NEW_SERVICE_ROLE_KEY]"

echo "Environment variables updated successfully!"
```

---

## 🧪 Step 8: Testing

### Local Testing

1. **Update your .env file with new credentials**
2. **Test locally:**
   ```bash
   pnpm install
   pnpm dev
   ```
3. **Test all authentication flows:**
   - User signup/confirmation
   - Login/logout
   - Password reset
   - Email change

### Production Testing

1. **Deploy to staging first** (if available)
2. **Test in production:**
   - Create test user account
   - Verify email templates are working
   - Test all application features
   - Check database operations

---

## 📋 Step 9: Migration Checklist

### Pre-Migration
- [ ] New Supabase instance created (`qrqnknpxgpbghnbiybyx`)
- [ ] New API keys obtained
- [ ] Database schema planned
- [ ] Email provider configured
- [ ] Backup of current data (if needed)

### During Migration
- [ ] Environment variables updated (.env)
- [ ] Netlify environment variables updated
- [ ] Database schema deployed
- [ ] Supabase functions deployed
- [ ] Email templates uploaded
- [ ] Authentication settings configured
- [ ] Site URLs and redirects set

### Post-Migration
- [ ] Local testing completed
- [ ] Production deployment tested
- [ ] All authentication flows working
- [ ] Email notifications working
- [ ] Database operations functioning
- [ ] User data accessible (if migrated)
- [ ] Performance monitoring active

---

## 🚨 Rollback Plan

If something goes wrong, you can quickly rollback:

### Quick Rollback (Emergency)
```bash
# Revert .env file
cp .env.backup .env

# Revert Netlify environment variables
netlify env:set VITE_SUPABASE_URL "https://auxjfqsrapfznoziykql.supabase.co"
netlify env:set VITE_API_URL "https://auxjfqsrapfznoziykql.supabase.co"
netlify env:set SUPABASE_URL "https://auxjfqsrapfznoziykql.supabase.co"

# Redeploy
netlify deploy --prod
```

### Prepare Rollback
```bash
# Before migration, backup current config
cp .env .env.backup
```

---

## ⚡ Migration Script

I'll create an automated script to help with the migration:

```bash
#!/bin/bash
# migrate-supabase-instance.sh

OLD_INSTANCE="auxjfqsrapfznoziykql"
NEW_INSTANCE="qrqnknpxgpbghnbiybyx"

echo "🔄 Migrating from $OLD_INSTANCE to $NEW_INSTANCE"

# Backup current .env
cp .env .env.backup

# Update .env file
sed -i "s/$OLD_INSTANCE/$NEW_INSTANCE/g" .env

echo "✅ Environment variables updated"
echo "⚠️  Remember to update your API keys manually!"
```

---

## 📞 Support

If you encounter issues during migration:

1. **Check Supabase Status:** https://status.supabase.com/
2. **Review Logs:** Check browser console and Supabase dashboard logs
3. **Test API Keys:** Verify new keys are correct and have proper permissions
4. **Database Connection:** Ensure new instance is accessible
5. **DNS/Network:** Check for network connectivity issues

---

## ✅ Migration Summary

**What Changes:**
- ✅ Supabase URL: `auxjfqsrapfznoziykql` → `qrqnknpxgpbghnbiybyx`
- ✅ API Keys: New anon and service role keys
- ✅ Database: Schema and data migration
- ✅ Functions: Redeployment to new instance
- ✅ Email Templates: Re-upload with "Talk to My Lawyer" branding
- ✅ Environment Variables: Updated in all environments

**What Stays the Same:**
- ✅ Application code and logic
- ✅ Email templates design and branding
- ✅ Authentication flows and user experience
- ✅ "Talk to My Lawyer" branding and features

---

**Migration Date:** October 13, 2025  
**Estimated Time:** 2-4 hours  
**Complexity:** Medium  
**Risk Level:** Low (with proper testing)