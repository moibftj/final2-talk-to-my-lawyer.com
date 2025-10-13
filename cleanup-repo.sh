#!/bin/bash

# Repository Cleanup Script
# This script helps organize the repository by moving documentation to a docs folder
# and removing temporary files

echo "🧹 Cleaning up repository..."

# Create docs directory if it doesn't exist
mkdir -p docs/guides
mkdir -p docs/sql-archives

# Move documentation files to docs
echo "📚 Moving documentation files..."
mv AUTH_ERROR_FIX.md docs/guides/ 2>/dev/null || true
mv DENO_TYPESCRIPT_FIXES.md docs/guides/ 2>/dev/null || true
mv EMAIL_CONFIRMATION_FIX.md docs/guides/ 2>/dev/null || true
mv EMAIL_TEMPLATES_IMPLEMENTATION.md docs/guides/ 2>/dev/null || true
mv EMAIL_TEMPLATES_SETUP_GUIDE.md docs/guides/ 2>/dev/null || true
mv GITHUB_COPILOT_CLI_GUIDE.md docs/guides/ 2>/dev/null || true
mv MIGRATION_COMPLETE.md docs/guides/ 2>/dev/null || true
mv PNPM_MIGRATION_SUMMARY.md docs/guides/ 2>/dev/null || true
mv PNPM_ONLY.md docs/guides/ 2>/dev/null || true
mv PROJECT_STATUS_SUMMARY.md docs/guides/ 2>/dev/null || true
mv SECURITY_AUDIT_REPORT.md docs/guides/ 2>/dev/null || true
mv SUPABASE_MIGRATION_GUIDE.md docs/guides/ 2>/dev/null || true

# Move SQL archive files (keep migration files in supabase/migrations)
echo "🗄️ Moving archived SQL files..."
mv COMPLETE_DATABASE_SETUP.sql docs/sql-archives/ 2>/dev/null || true
mv DATABASE_ENHANCEMENT_THREE_TIER.sql docs/sql-archives/ 2>/dev/null || true
mv DATABASE_PERFORMANCE_OPTIMIZATION.sql docs/sql-archives/ 2>/dev/null || true
mv THREE_TIER_DATABASE_SCHEMA.sql docs/sql-archives/ 2>/dev/null || true
mv drop_trigger.sql docs/sql-archives/ 2>/dev/null || true

# Remove temporary files
echo "🗑️ Removing temporary files..."
rm -f new.prompt.prompt.md 2>/dev/null || true

# Update git
echo "📝 Staging changes..."
git add docs/
git add -u  # Stage deletions

echo "✅ Cleanup complete!"
echo ""
echo "📁 Repository structure:"
echo "  - Documentation moved to: docs/guides/"
echo "  - SQL archives moved to: docs/sql-archives/"
echo "  - Core files remain in root: README.md, DEPLOYMENT_GUIDE.md, etc."
echo ""
echo "To commit these changes, run:"
echo "  git commit -m 'Organize repository structure'"
echo "  git push"