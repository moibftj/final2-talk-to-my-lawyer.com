-- ==============================================
-- DATABASE PERFORMANCE OPTIMIZATION SCRIPT
-- Based on Supabase Database Linter Recommendations
-- ==============================================

-- ==============================================
-- 1. FIX CRITICAL ISSUE: ADD MISSING INDEX FOR FOREIGN KEY
-- ==============================================

-- Add index for letters.user_id foreign key (CRITICAL for performance)
CREATE INDEX IF NOT EXISTS idx_letters_user_id ON public.letters(user_id);

-- ==============================================
-- 2. REMOVE UNUSED INDEXES TO IMPROVE WRITE PERFORMANCE
-- ==============================================

-- Drop unused indexes on profiles table
DROP INDEX IF EXISTS idx_profiles_role;
DROP INDEX IF EXISTS idx_profiles_coupon_code;
DROP INDEX IF EXISTS idx_profiles_referred_by;

-- Drop unused indexes on letters table
DROP INDEX IF EXISTS idx_letters_timeline_status;
DROP INDEX IF EXISTS idx_letters_sender_name;
DROP INDEX IF EXISTS idx_letters_attorney_name;

-- Drop unused indexes on employee_coupons table
DROP INDEX IF EXISTS idx_employee_coupons_employee_id;
DROP INDEX IF EXISTS idx_employee_coupons_active;

-- Drop unused indexes on commission_payments table
DROP INDEX IF EXISTS idx_commission_payments_employee_id;
DROP INDEX IF EXISTS idx_commission_payments_referred_user_id;
DROP INDEX IF EXISTS idx_commission_payments_trigger_event;
DROP INDEX IF EXISTS idx_commission_payments_created_at;

-- Drop unused indexes on subscriptions table
DROP INDEX IF EXISTS idx_subscriptions_user_id;
DROP INDEX IF EXISTS idx_subscriptions_employee_id;
DROP INDEX IF EXISTS idx_subscriptions_status;
DROP INDEX IF EXISTS idx_subscriptions_plan_type;

-- Drop unused indexes on letter_timeline table
DROP INDEX IF EXISTS idx_letter_timeline_letter_id;
DROP INDEX IF EXISTS idx_letter_timeline_status;
DROP INDEX IF EXISTS idx_letter_timeline_created_at;

-- Drop unused index on platform_metrics table
DROP INDEX IF EXISTS idx_platform_metrics_name_date;

-- ==============================================
-- 3. ADD ONLY ESSENTIAL INDEXES FOR ACTUAL USAGE PATTERNS
-- ==============================================

-- Keep only indexes that are actually used based on your queries
-- Add indexes for commonly queried fields

-- Index for letter status filtering (if you filter by status)
CREATE INDEX IF NOT EXISTS idx_letters_status ON public.letters(status) 
WHERE status IS NOT NULL;

-- Index for letter creation date ordering (for timeline views)
CREATE INDEX IF NOT EXISTS idx_letters_created_at ON public.letters(created_at DESC);

-- Index for employee coupon code lookups (if you search by code)
CREATE INDEX IF NOT EXISTS idx_employee_coupons_code ON employee_coupons(code) 
WHERE is_active = true;

-- Composite index for active subscriptions by user
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status) 
WHERE status = 'active';

-- ==============================================
-- 4. ANALYZE TABLES AFTER INDEX CHANGES
-- ==============================================

-- Update table statistics for query planner
ANALYZE public.letters;
ANALYZE public.profiles;
ANALYZE public.subscriptions;
ANALYZE public.employee_coupons;
ANALYZE public.commission_payments;
ANALYZE public.letter_timeline;
ANALYZE public.platform_metrics;

-- ==============================================
-- 5. PERFORMANCE MONITORING QUERIES
-- ==============================================

-- Query to check index usage after optimization
-- Run this periodically to monitor index effectiveness
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as index_reads,
    idx_tup_fetch as index_fetches
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
*/

-- Query to check table sizes and bloat
/*
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
*/

-- ==============================================
-- SUMMARY OF CHANGES:
-- ==============================================
-- ✅ ADDED: Critical index for letters.user_id foreign key
-- ❌ REMOVED: 19 unused indexes consuming storage
-- ✅ ADDED: 4 optimized indexes for actual usage patterns
-- ✅ UPDATED: Table statistics for better query planning
-- 
-- Expected Benefits:
-- • Faster JOIN queries between letters and users
-- • Reduced storage overhead from unused indexes
-- • Faster INSERT/UPDATE/DELETE operations
-- • Better query planning with updated statistics
-- ==============================================