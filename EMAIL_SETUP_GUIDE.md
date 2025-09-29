# Email Configuration Guide for Talk to My Lawyer

## Overview
This guide explains how to configure the branded email templates for your Talk to My Lawyer application. The templates have been updated to reflect the proper branding with the Talk to My Lawyer logo and messaging.

## Updated Email Templates ✅

### 1. Signup Confirmation Email
- **Location**: `supabase/templates/confirm.html`
- **Features**:
  - Talk to My Lawyer branding and logo
  - Professional blue/purple gradient design
  - Custom SVG logo icon
  - Feature highlights specific to legal services
  - Responsive design for all devices
  - TalkToMyLawyer.com website references

### 2. Password Reset Email
- **Location**: `supabase/templates/recovery.html`
- **Features**:
  - Matching brand design
  - Enhanced security notices
  - Password security tips
  - Clear call-to-action buttons
  - Professional layout with help resources

## Supabase Configuration Steps

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your Talk to My Lawyer project
3. Navigate to **Authentication** → **Settings**

### Step 2: Configure SMTP Settings
1. Scroll down to **SMTP Settings**
2. Enable SMTP and configure with your email provider:

#### Recommended: SendGrid
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP Username: apikey
SMTP Password: [Your SendGrid API Key]
Sender Name: Talk to My Lawyer
Sender Email: noreply@talktomylawyer.com
```

#### Alternative: Gmail/Google Workspace
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: noreply@talktomylawyer.com
SMTP Password: [Your App Password]
Sender Name: Talk to My Lawyer
Sender Email: noreply@talktomylawyer.com
```

### Step 3: Upload Email Templates
1. Go to **Authentication** → **Email Templates**
2. Click **Confirm signup** template
3. Copy the content from `supabase/templates/confirm.html`
4. Paste it into the template editor
5. Click **Save**

6. Click **Reset password** template
7. Copy the content from `supabase/templates/recovery.html`
8. Paste it into the template editor
9. Click **Save**

### Step 4: Test Email Configuration
1. In your Supabase dashboard, go to **Authentication** → **Users**
2. Click **Invite User**
3. Enter a test email address
4. Check if the email is sent with proper branding

## Development Testing

### Using Inbucket (Local Development)
When running `npx supabase start`, emails are captured locally:
1. Visit [http://localhost:54324](http://localhost:54324)
2. View all sent emails in the Inbucket interface
3. Test both signup and password reset flows

### Testing Checklist
- [ ] Signup confirmation email displays Talk to My Lawyer branding
- [ ] Logo appears correctly in email header
- [ ] All links point to correct TalkToMyLawyer.com domain
- [ ] Password reset email has proper security notices
- [ ] Email templates are mobile-responsive
- [ ] Call-to-action buttons work properly

## Production Deployment

### Domain Configuration
Before going live, ensure:
1. **Domain Setup**: Configure your `talktomylawyer.com` domain
2. **SMTP Provider**: Set up production email service (SendGrid recommended)
3. **SSL Certificate**: Ensure HTTPS is properly configured
4. **SPF/DKIM Records**: Set up email authentication

### Environment Variables
Set these in your production environment:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Site URL Configuration
1. In Supabase dashboard, go to **Settings** → **General**
2. Update **Site URL** to: `https://talktomylawyer.com`
3. Add additional redirect URLs if needed

## Email Template Features

### Brand Elements
- **Logo**: Custom SVG legal building icon with Talk to My Lawyer text
- **Colors**: Professional blue (#1e40af) to purple (#7c3aed) gradient
- **Typography**: Clean, professional Segoe UI font stack
- **Layout**: Responsive design that works on all devices

### Content Updates
- All references changed from "Law Letter AI" to "Talk to My Lawyer"
- Website links point to `talktomylawyer.com`
- Enhanced feature descriptions for legal services
- Professional legal consultation messaging added
- Security-focused password reset guidance

### Accessibility
- High contrast colors for readability
- Clear call-to-action buttons
- Mobile-responsive layout
- Screen reader friendly structure

## Troubleshooting

### Common Issues
1. **Emails not sending**: Check SMTP credentials and ensure they're active
2. **Template not updating**: Clear browser cache and refresh Supabase dashboard
3. **Links not working**: Verify Site URL in Supabase settings
4. **Images not loading**: Ensure SVG code is properly formatted

### Support Resources
- Supabase Documentation: [https://supabase.com/docs/guides/auth](https://supabase.com/docs/guides/auth)
- Email template testing tools available in development environment
- Contact support if SMTP provider issues persist

## Next Steps
1. Configure your chosen SMTP provider
2. Upload the templates to Supabase
3. Test the complete signup and password reset flows
4. Deploy to production with proper domain configuration
5. Monitor email deliverability and engagement

Your Talk to My Lawyer application is now ready with professional, branded email templates! 🎉