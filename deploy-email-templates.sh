#!/bin/bash

# Email Templates Deployment Script for Talk to My Lawyer
# This script helps deploy custom email templates to Supabase

set -e

echo "🎨 Talk to My Lawyer - Email Templates Deployment"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required files exist
echo "📋 Checking template files..."

TEMPLATES_DIR="./supabase/templates"
TEMPLATES=(
    "confirmation.html"
    "recovery.html"
    "invite.html"
    "email_change.html"
)

for template in "${TEMPLATES[@]}"; do
    if [ -f "$TEMPLATES_DIR/$template" ]; then
        echo -e "✅ ${GREEN}$template found${NC}"
    else
        echo -e "❌ ${RED}$template missing${NC}"
        exit 1
    fi
done

echo ""
echo "📧 Email Templates Summary:"
echo "=========================="
echo -e "${GREEN}✅ Email Confirmation Template${NC} (confirmation.html)"
echo -e "${GREEN}✅ Password Recovery Template${NC} (recovery.html)"  
echo -e "${GREEN}✅ User Invitation Template${NC} (invite.html)"
echo -e "${GREEN}✅ Email Change Template${NC} (email_change.html)"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found. Please install it first:${NC}"
    echo "npm install -g supabase"
    echo "https://supabase.com/docs/guides/cli"
    echo ""
fi

# Display configuration info
echo "⚙️  Configuration Details:"
echo "========================="
echo -e "${BLUE}Brand Name:${NC} Talk to My Lawyer"
echo -e "${BLUE}Logo:${NC} ⚖️"
echo -e "${BLUE}Color Scheme:${NC} Purple gradient (#667eea to #764ba2)"
echo -e "${BLUE}Sender Name:${NC} Talk to My Lawyer"
echo -e "${BLUE}Sender Email:${NC} noreply@talktomylawyer.com"
echo ""

# Template subjects
echo "📝 Email Subjects:"
echo "=================="
echo "📧 Welcome Email: 'Welcome to Talk to My Lawyer - Confirm Your Email'"
echo "🔒 Password Reset: 'Reset Your Talk to My Lawyer Password'"
echo "🎉 Invitation: 'You're invited to Talk to My Lawyer'"
echo "📬 Email Change: 'Talk to My Lawyer - Confirm Email Change'"
echo ""

# Display template features
echo "🎨 Template Features:"
echo "===================="
echo "• Mobile-responsive design"
echo "• Professional legal branding"
echo "• Security-focused messaging"
echo "• Clear call-to-action buttons"
echo "• Consistent color scheme"
echo "• Professional typography"
echo "• Accessibility optimized"
echo ""

# SMTP Configuration Guide
echo "🔧 SMTP Configuration Required:"
echo "==============================="
echo "To use these templates, configure SMTP in your Supabase dashboard:"
echo ""
echo -e "${YELLOW}Supabase Dashboard → Project Settings → Authentication → SMTP Settings${NC}"
echo ""
echo "SendGrid Configuration (Recommended):"
echo "• Host: smtp.sendgrid.net"
echo "• Port: 587"
echo "• Username: apikey"
echo "• Password: [Your SendGrid API Key]"
echo "• Sender Name: Talk to My Lawyer"
echo "• Sender Email: noreply@talktomylawyer.com"
echo ""

# Template upload instructions
echo "📤 Template Upload Instructions:"
echo "================================"
echo "1. Go to Supabase Dashboard"
echo "2. Navigate to Authentication → Email Templates"
echo "3. For each template type:"
echo ""

for i in "${!TEMPLATES[@]}"; do
    template_file="${TEMPLATES[$i]}"
    case $template_file in
        "confirmation.html")
            echo -e "   ${GREEN}📧 Confirm Signup:${NC}"
            echo "   • Subject: Welcome to Talk to My Lawyer - Confirm Your Email"
            echo "   • Template: Copy content from $TEMPLATES_DIR/$template_file"
            ;;
        "recovery.html")
            echo -e "   ${GREEN}🔒 Reset Password:${NC}"
            echo "   • Subject: Reset Your Talk to My Lawyer Password"
            echo "   • Template: Copy content from $TEMPLATES_DIR/$template_file"
            ;;
        "invite.html")
            echo -e "   ${GREEN}🎉 Invite User:${NC}"
            echo "   • Subject: You're invited to Talk to My Lawyer"
            echo "   • Template: Copy content from $TEMPLATES_DIR/$template_file"
            ;;
        "email_change.html")
            echo -e "   ${GREEN}📬 Confirm Email Change:${NC}"
            echo "   • Subject: Talk to My Lawyer - Confirm Email Change"
            echo "   • Template: Copy content from $TEMPLATES_DIR/$template_file"
            ;;
    esac
    echo ""
done

# Environment variables needed
echo "🔑 Environment Variables:"
echo "========================="
echo "Set these in your production environment:"
echo ""
echo "SENDGRID_API_KEY=your_sendgrid_api_key_here"
echo "SITE_URL=https://talktomylawyer.com"
echo "SUPABASE_URL=https://your-project.supabase.co"
echo "SUPABASE_ANON_KEY=your_anon_key_here"
echo ""

# Testing instructions
echo "🧪 Testing Your Templates:"
echo "=========================="
echo "Test each email type:"
echo ""
echo "1. Email Confirmation:"
echo "   • Sign up with a new email address"
echo "   • Check your inbox for the welcome email"
echo ""
echo "2. Password Recovery:"
echo "   • Click 'Forgot Password' on login page"
echo "   • Enter email and check for reset email"
echo ""
echo "3. Email Change:"
echo "   • Update email in user settings"
echo "   • Check both old and new email addresses"
echo ""

# Success message
echo -e "${GREEN}🎉 Email Templates Setup Complete!${NC}"
echo ""
echo "Your Talk to My Lawyer email templates are ready for deployment."
echo "Follow the manual upload instructions above to complete the setup."
echo ""
echo -e "${BLUE}📚 For detailed instructions, see: EMAIL_TEMPLATES_SETUP_GUIDE.md${NC}"
echo ""

# Optional: Open template directory
if command -v open &> /dev/null; then
    echo "📁 Opening templates directory..."
    open "$TEMPLATES_DIR"
elif command -v xdg-open &> /dev/null; then
    echo "📁 Opening templates directory..."
    xdg-open "$TEMPLATES_DIR"
fi

echo "✅ Script completed successfully!"