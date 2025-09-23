# Supabase Native Email Configuration Guide

## Overview
This application has been configured to use Supabase's native email functionality instead of custom email services. This simplifies the setup and allows you to manage email templates directly in Supabase.

## Configuration Status ✅

1. **Custom email service removed** - The MailerSend service has been removed from the codebase
2. **Auth Context updated** - Removed custom email sending logic, Supabase now handles this automatically
3. **Email confirmations enabled** - Users must confirm their email before signing in
4. **Custom templates created** - Professional email templates for signup confirmation and password reset

## To Enable SMTP in Production

### Step 1: Configure SMTP in supabase/config.toml

In your `supabase/config.toml` file, update the SMTP section:

```toml
[auth.email.smtp]
enabled = true
host = "smtp.sendgrid.net"  # or your SMTP provider
port = 587
user = "apikey"  # or your SMTP username
pass = "env(SENDGRID_API_KEY)"  # use environment variable
admin_email = "noreply@yourdomain.com"
sender_name = "Law Letter AI"
```

### Step 2: Set Environment Variable

Create a `.env.local` file (or add to your existing one):

```env
SENDGRID_API_KEY=your_actual_api_key_here
```

### Step 3: Popular SMTP Providers

#### SendGrid (Recommended)
```toml
host = "smtp.sendgrid.net"
port = 587
user = "apikey"
pass = "env(SENDGRID_API_KEY)"
```

#### Gmail/Google Workspace
```toml
host = "smtp.gmail.com"
port = 587
user = "your-email@yourdomain.com"
pass = "env(GMAIL_APP_PASSWORD)"
```

#### AWS SES
```toml
host = "email-smtp.us-east-1.amazonaws.com"
port = 587
user = "env(AWS_SES_USERNAME)"
pass = "env(AWS_SES_PASSWORD)"
```

#### Mailgun
```toml
host = "smtp.mailgun.org"
port = 587
user = "env(MAILGUN_USERNAME)"
pass = "env(MAILGUN_PASSWORD)"
```

### Step 4: Custom Email Templates

The application includes custom email templates located in:
- `supabase/templates/confirm.html` - For email confirmation
- `supabase/templates/recovery.html` - For password reset

These templates feature:
- Professional Law Letter AI branding
- Responsive design
- Clear call-to-action buttons
- Security notices for password resets

### Step 5: Testing Email Functionality

1. Start your Supabase development environment:
   ```bash
   npx supabase start
   ```

2. Navigate to the Supabase Studio (usually http://localhost:54323)

3. Go to Authentication → Users and create a test user

4. Check the Inbucket email interface at http://localhost:54324 to see test emails

### Step 6: Production Deployment

When deploying to production:

1. Set your environment variables in your hosting platform
2. Ensure your SMTP credentials are correctly configured
3. Update the `site_url` in your Supabase project settings
4. Test the email flow with real email addresses

## Email Flow

### Sign Up Process
1. User signs up with email and password
2. Supabase automatically sends confirmation email using custom template
3. User clicks confirmation link
4. Account is activated and user can sign in

### Password Reset Process
1. User requests password reset
2. Supabase sends reset email using custom template
3. User clicks reset link
4. User enters new password
5. Password is updated

## Troubleshooting

### Common Issues

1. **Emails not sending**: Check SMTP credentials and ensure `enabled = true`
2. **Templates not loading**: Verify template file paths in config.toml
3. **Authentication errors**: Check environment variables are properly set
4. **Rate limiting**: Adjust `email_sent` rate limit in `[auth.rate_limit]` section

### Email Testing in Development

During development, emails are captured by Inbucket at http://localhost:54324. You can:
- View all sent emails
- Test email templates
- Debug email content and formatting

## Benefits of Supabase Native Email

✅ **Simplified codebase** - No custom email service to maintain
✅ **Built-in security** - Supabase handles email verification securely
✅ **Rate limiting** - Built-in protection against email spam
✅ **Template management** - Easy to update email templates
✅ **Environment consistency** - Same email system in dev and production
✅ **Cost effective** - Use your own SMTP provider or Supabase's service

## Next Steps

1. Start Docker Desktop if not already running
2. Run `npx supabase start` to restart with new configuration
3. Test the signup flow at http://localhost:5174
4. Configure your SMTP provider when ready for production
5. Update email templates as needed for your branding

Your application is now ready to use Supabase's native email functionality! 🎉