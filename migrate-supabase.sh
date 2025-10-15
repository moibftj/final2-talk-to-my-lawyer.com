#!/bin/bash

# Supabase Instance Migration Script - Talk to My Lawyer
# Migrates from auxjfqsrapfznoziykql to qrqnknpxgpbghnbiybyx

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Instance configuration
OLD_INSTANCE="auxjfqsrapfznoziykql"
NEW_INSTANCE="qrqnknpxgpbghnbiybyx"
OLD_URL="https://${OLD_INSTANCE}.supabase.co"
NEW_URL="https://${NEW_INSTANCE}.supabase.co"

echo -e "${PURPLE}🔄 Supabase Instance Migration - Talk to My Lawyer${NC}"
echo "============================================================="
echo ""
echo -e "${BLUE}From:${NC} $OLD_URL"
echo -e "${BLUE}To:${NC}   $NEW_URL"
echo ""

# Warning message
echo -e "${YELLOW}⚠️  IMPORTANT: Before running this script, ensure you have:${NC}"
echo "   1. Access to the new Supabase project ($NEW_INSTANCE)"
echo "   2. New API keys from the new Supabase dashboard"
echo "   3. Database schema ready in the new instance"
echo "   4. Backed up any important data from the old instance"
echo ""

# Confirmation prompt
read -p "Do you want to continue with the migration? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 1
fi

echo ""
echo -e "${GREEN}🚀 Starting migration process...${NC}"
echo ""

# Step 1: Backup current configuration
echo -e "${BLUE}📋 Step 1: Backing up current configuration${NC}"
if [ -f ".env" ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "✅ ${GREEN}.env backed up${NC}"
else
    echo -e "❌ ${RED}.env file not found${NC}"
    exit 1
fi

# Step 2: Update .env file URLs
echo ""
echo -e "${BLUE}🔧 Step 2: Updating environment variables${NC}"

# Update URLs in .env file
sed -i.bak "s|${OLD_URL}|${NEW_URL}|g" .env
echo -e "✅ ${GREEN}Updated Supabase URLs in .env${NC}"

# Step 3: Show what needs manual updates
echo ""
echo -e "${YELLOW}⚠️  Step 3: Manual updates required${NC}"
echo "You need to manually update these API keys in your .env file:"
echo ""
echo -e "${YELLOW}VITE_SUPABASE_ANON_KEY=${NC}[GET_FROM_NEW_SUPABASE_DASHBOARD]"
echo -e "${YELLOW}SUPABASE_SERVICE_ROLE_KEY=${NC}[GET_FROM_NEW_SUPABASE_DASHBOARD]"
echo ""
echo "Get these keys from: https://supabase.com/dashboard/project/$NEW_INSTANCE/settings/api"
echo ""

# Step 4: Update other configuration files
echo -e "${BLUE}🔧 Step 4: Updating configuration files${NC}"

# Update .env.example
if [ -f ".env.example" ]; then
    sed -i.bak "s|${OLD_URL}|${NEW_URL}|g" .env.example
    echo -e "✅ ${GREEN}Updated .env.example${NC}"
fi

# Update set-netlify-env.sh
if [ -f "set-netlify-env.sh" ]; then
    sed -i.bak "s|${OLD_URL}|${NEW_URL}|g" set-netlify-env.sh
    echo -e "✅ ${GREEN}Updated set-netlify-env.sh${NC}"
fi

# Update README.md
if [ -f "README.md" ]; then
    sed -i.bak "s|${OLD_INSTANCE}|${NEW_INSTANCE}|g" README.md
    sed -i.bak "s|${OLD_URL}|${NEW_URL}|g" README.md
    echo -e "✅ ${GREEN}Updated README.md${NC}"
fi

# Update deployment guide
if [ -f "DEPLOYMENT_GUIDE.md" ]; then
    sed -i.bak "s|${OLD_URL}|${NEW_URL}|g" DEPLOYMENT_GUIDE.md
    echo -e "✅ ${GREEN}Updated DEPLOYMENT_GUIDE.md${NC}"
fi

# Step 5: Show current .env status
echo ""
echo -e "${BLUE}📋 Step 5: Current .env configuration${NC}"
echo "-------------------------------------------"
grep -E "(VITE_SUPABASE_URL|VITE_API_URL|SUPABASE_URL)" .env | while read line; do
    if [[ $line == *"$NEW_URL"* ]]; then
        echo -e "${GREEN}✅ $line${NC}"
    else
        echo -e "${RED}❌ $line${NC}"
    fi
done
echo ""

# Step 6: Netlify environment variables
echo -e "${BLUE}🌐 Step 6: Netlify Environment Variables${NC}"
echo "Run this command to update your Netlify environment variables:"
echo ""
echo -e "${YELLOW}./set-netlify-env.sh${NC}"
echo ""
echo "Note: You'll need to update the API keys in set-netlify-env.sh first!"
echo ""

# Step 7: Database migration
echo -e "${BLUE}🗄️  Step 7: Database Migration${NC}"
echo "To migrate your database schema and functions:"
echo ""
echo -e "${YELLOW}# Link to new Supabase project${NC}"
echo "supabase link --project-ref $NEW_INSTANCE"
echo ""
echo -e "${YELLOW}# Push your database schema${NC}"
echo "supabase db push"
echo ""
echo -e "${YELLOW}# Deploy all functions${NC}"
echo "supabase functions deploy --project-ref $NEW_INSTANCE"
echo ""

# Step 8: Email templates
echo -e "${BLUE}📧 Step 8: Email Templates Migration${NC}"
echo "Don't forget to re-upload your 'Talk to My Lawyer' email templates:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/$NEW_INSTANCE"
echo "2. Navigate to: Authentication → Email Templates"
echo "3. Upload templates from: supabase/templates/"
echo "   • confirmation.html (Welcome to Talk to My Lawyer)"
echo "   • recovery.html (Reset Your Password)"
echo "   • invite.html (You're invited)"
echo "   • email_change.html (Confirm Email Change)"
echo ""

# Step 9: Testing checklist
echo -e "${BLUE}🧪 Step 9: Testing Checklist${NC}"
echo "After completing the migration, test these features:"
echo ""
echo "✓ User signup and email confirmation"
echo "✓ Login and logout"
echo "✓ Password reset flow"
echo "✓ Email change functionality"
echo "✓ All application features"
echo "✓ Database operations"
echo "✓ AI letter generation"
echo ""

# Step 10: Post-migration tasks
echo -e "${BLUE}📋 Step 10: Post-Migration Tasks${NC}"
echo ""
echo "1. Update API keys in .env file (REQUIRED)"
echo "2. Run: netlify env:set with new keys"
echo "3. Test locally: pnpm dev"
echo "4. Deploy and test in production"
echo "5. Update any external services with new URLs"
echo ""

# Files created/modified summary
echo -e "${GREEN}📁 Files Modified:${NC}"
echo "• .env (URLs updated, API keys need manual update)"
echo "• .env.example (URLs updated)"
echo "• set-netlify-env.sh (URLs updated)"
echo "• README.md (URLs updated)"
echo "• DEPLOYMENT_GUIDE.md (URLs updated)"
echo ""

# Backup files created
echo -e "${GREEN}💾 Backup Files Created:${NC}"
ls -la .env.backup.* 2>/dev/null | head -5 || echo "No backup files found"
echo ""

# Next steps
echo -e "${PURPLE}🎯 NEXT STEPS (REQUIRED):${NC}"
echo "=================================="
echo ""
echo -e "${YELLOW}1. GET NEW API KEYS:${NC}"
echo "   Go to: https://supabase.com/dashboard/project/$NEW_INSTANCE/settings/api"
echo "   Copy the anon key and service_role key"
echo ""
echo -e "${YELLOW}2. UPDATE .env FILE:${NC}"
echo "   Replace the API keys in your .env file with the new ones"
echo ""
echo -e "${YELLOW}3. UPDATE NETLIFY:${NC}"
echo "   Update set-netlify-env.sh with new API keys, then run it"
echo ""
echo -e "${YELLOW}4. MIGRATE DATABASE:${NC}"
echo "   Run the Supabase commands shown above"
echo ""
echo -e "${YELLOW}5. TEST EVERYTHING:${NC}"
echo "   Run 'pnpm dev' and test all features"
echo ""

# Warning about API keys
echo -e "${RED}⚠️  CRITICAL: Your app will not work until you update the API keys!${NC}"
echo ""

# Success message
echo -e "${GREEN}✅ Migration script completed successfully!${NC}"
echo ""
echo -e "${BLUE}📚 For detailed instructions, see: SUPABASE_MIGRATION_GUIDE.md${NC}"
echo ""

# Rollback information
echo -e "${PURPLE}🔙 ROLLBACK INFO:${NC}"
echo "If something goes wrong, restore from backup:"
echo "cp .env.backup.$(date +%Y%m%d)_* .env"
echo ""

echo -e "${GREEN}🎉 Happy migrating!${NC}"