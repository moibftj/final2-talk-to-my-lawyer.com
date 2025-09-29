-- Three-Tier Database Enhancement for Talk to My Lawyer
-- This script enhances the existing database to support the complete three-tier system
-- Run this in your Supabase SQL Editor

-- ==============================================
-- 1. ENHANCE EXISTING PROFILES TABLE
-- ==============================================

-- Add new columns for three-tier functionality
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS commission_earned DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coupon_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

-- Add check constraint for role
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'profiles_role_check'
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
        CHECK (role IN ('user', 'employee', 'admin'));
    END IF;
END $$;

-- ==============================================
-- 2. ENHANCE EXISTING LETTERS TABLE
-- ==============================================

-- Add detailed form fields for letter generation
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS sender_address TEXT;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS attorney_name TEXT;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS recipient_name TEXT;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS matter TEXT;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS desired_resolution TEXT;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS timeline_status TEXT DEFAULT 'received';
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS letter_type TEXT DEFAULT 'general';

-- Add constraint for timeline status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'letters_timeline_status_check'
        AND table_name = 'letters'
    ) THEN
        ALTER TABLE public.letters ADD CONSTRAINT letters_timeline_status_check
        CHECK (timeline_status IN ('received', 'under_review', 'posted', 'completed'));
    END IF;
END $$;

-- ==============================================
-- 3. CREATE NEW TABLES FOR THREE-TIER SYSTEM
-- ==============================================

-- Employee coupons table
CREATE TABLE IF NOT EXISTS employee_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    discount_percentage INTEGER NOT NULL DEFAULT 20,
    usage_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_discount_percentage CHECK (discount_percentage > 0 AND discount_percentage <= 100)
);

-- Commission payments tracking
CREATE TABLE IF NOT EXISTS commission_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    commission_amount DECIMAL(10,2) NOT NULL,
    points_awarded INTEGER DEFAULT 1,
    trigger_event TEXT DEFAULT 'signup',
    reference_id UUID, -- For future subscription linking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT positive_commission CHECK (commission_amount >= 0),
    CONSTRAINT positive_points CHECK (points_awarded >= 0),
    CONSTRAINT valid_trigger_event CHECK (trigger_event IN ('signup', 'subscription', 'renewal'))
);

-- Enhanced subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    original_amount DECIMAL(10,2),
    discount_applied DECIMAL(10,2) DEFAULT 0,
    coupon_code TEXT,
    employee_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'active',
    letters_used INTEGER DEFAULT 0,
    letters_allowed INTEGER NOT NULL DEFAULT 1,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    CONSTRAINT valid_plan_type CHECK (plan_type IN ('one_letter_299', 'four_monthly_299', 'eight_yearly_599')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due')),
    CONSTRAINT positive_amount CHECK (amount >= 0),
    CONSTRAINT valid_usage CHECK (letters_used <= letters_allowed)
);

-- Letter timeline tracking
CREATE TABLE IF NOT EXISTS letter_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    letter_id UUID NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_timeline_status CHECK (status IN ('received', 'under_review', 'posted', 'completed', 'failed'))
);

-- Platform metrics for admin dashboard
CREATE TABLE IF NOT EXISTS platform_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_type TEXT DEFAULT 'counter',
    date_recorded DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_metric_type CHECK (metric_type IN ('counter', 'gauge', 'percentage'))
);

-- ==============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ==============================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_coupon_code ON public.profiles(coupon_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);

-- Letters table indexes
CREATE INDEX IF NOT EXISTS idx_letters_timeline_status ON public.letters(timeline_status);
CREATE INDEX IF NOT EXISTS idx_letters_sender_name ON public.letters(sender_name);
CREATE INDEX IF NOT EXISTS idx_letters_attorney_name ON public.letters(attorney_name);

-- Employee coupons indexes
CREATE INDEX IF NOT EXISTS idx_employee_coupons_employee_id ON employee_coupons(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_coupons_code ON employee_coupons(code);
CREATE INDEX IF NOT EXISTS idx_employee_coupons_active ON employee_coupons(is_active);

-- Commission payments indexes
CREATE INDEX IF NOT EXISTS idx_commission_payments_employee_id ON commission_payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_commission_payments_referred_user_id ON commission_payments(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_commission_payments_trigger_event ON commission_payments(trigger_event);
CREATE INDEX IF NOT EXISTS idx_commission_payments_created_at ON commission_payments(created_at);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_employee_id ON subscriptions(employee_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON subscriptions(plan_type);

-- Letter timeline indexes
CREATE INDEX IF NOT EXISTS idx_letter_timeline_letter_id ON letter_timeline(letter_id);
CREATE INDEX IF NOT EXISTS idx_letter_timeline_status ON letter_timeline(status);
CREATE INDEX IF NOT EXISTS idx_letter_timeline_created_at ON letter_timeline(created_at);

-- Platform metrics indexes
CREATE INDEX IF NOT EXISTS idx_platform_metrics_name_date ON platform_metrics(metric_name, date_recorded);

-- ==============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ==============================================

-- Enable RLS on new tables
ALTER TABLE employee_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE letter_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 6. CREATE RLS POLICIES
-- ==============================================

-- Employee coupons policies
CREATE POLICY "Employees can view own coupons" ON employee_coupons
    FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Employees can update own coupons" ON employee_coupons
    FOR UPDATE USING (employee_id = auth.uid());

CREATE POLICY "System can manage employee coupons" ON employee_coupons
    FOR ALL WITH CHECK (true);

CREATE POLICY "Admins can view all employee coupons" ON employee_coupons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Commission payments policies
CREATE POLICY "Employees can view own commissions" ON commission_payments
    FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Users can view their generated commissions" ON commission_payments
    FOR SELECT USING (referred_user_id = auth.uid());

CREATE POLICY "System can insert commission payments" ON commission_payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all commission payments" ON commission_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can manage subscriptions" ON subscriptions
    FOR ALL WITH CHECK (true);

CREATE POLICY "Admins can view all subscriptions" ON subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Letter timeline policies
CREATE POLICY "Users can view own letter timeline" ON letter_timeline
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.letters
            WHERE letters.id = letter_timeline.letter_id
            AND letters.user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage letter timeline" ON letter_timeline
    FOR ALL WITH CHECK (true);

CREATE POLICY "Admins can view all letter timelines" ON letter_timeline
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Platform metrics policies (admin only)
CREATE POLICY "Admins can view platform metrics" ON platform_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can manage platform metrics" ON platform_metrics
    FOR ALL WITH CHECK (true);

-- ==============================================
-- 7. CREATE BUSINESS LOGIC FUNCTIONS
-- ==============================================

-- Function to generate unique coupon code for employees
CREATE OR REPLACE FUNCTION generate_employee_coupon(employee_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    coupon_code TEXT;
    code_exists BOOLEAN;
    attempt_count INTEGER := 0;
    max_attempts INTEGER := 10;
BEGIN
    -- Generate a unique coupon code
    LOOP
        -- Create code like "TML" + 4 random characters
        coupon_code := 'TML' || UPPER(LEFT(MD5(RANDOM()::text || employee_uuid::text), 4));

        -- Check if code already exists
        SELECT EXISTS(
            SELECT 1 FROM employee_coupons WHERE code = coupon_code
        ) INTO code_exists;

        EXIT WHEN NOT code_exists;

        attempt_count := attempt_count + 1;
        IF attempt_count >= max_attempts THEN
            RAISE EXCEPTION 'Unable to generate unique coupon code after % attempts', max_attempts;
        END IF;
    END LOOP;

    -- Insert the coupon
    INSERT INTO employee_coupons (employee_id, code)
    VALUES (employee_uuid, coupon_code);

    -- Update the profile with the coupon code
    UPDATE public.profiles
    SET coupon_code = coupon_code
    WHERE id = employee_uuid;

    RETURN coupon_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to process referral during signup
CREATE OR REPLACE FUNCTION process_referral_signup(
    new_user_id UUID,
    coupon_code_param TEXT
)
RETURNS JSON AS $$
DECLARE
    employee_record RECORD;
    commission_amount DECIMAL(10,2) := 14.95; -- 5% of $299 base amount
    result JSON;
BEGIN
    -- Find employee by coupon code
    SELECT p.*, ec.id as coupon_id, ec.usage_count
    INTO employee_record
    FROM public.profiles p
    JOIN employee_coupons ec ON p.id = ec.employee_id
    WHERE ec.code = coupon_code_param
    AND ec.is_active = true
    AND p.role = 'employee';

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid or inactive coupon code'
        );
    END IF;

    -- Update new user with referral
    UPDATE public.profiles
    SET referred_by = employee_record.id
    WHERE id = new_user_id;

    -- Award commission and points to employee
    INSERT INTO commission_payments (
        employee_id,
        referred_user_id,
        commission_amount,
        points_awarded,
        trigger_event
    )
    VALUES (
        employee_record.id,
        new_user_id,
        commission_amount,
        1,
        'signup'
    );

    -- Update employee totals
    UPDATE public.profiles
    SET
        points = COALESCE(points, 0) + 1,
        commission_earned = COALESCE(commission_earned, 0) + commission_amount
    WHERE id = employee_record.id;

    -- Update coupon usage count
    UPDATE employee_coupons
    SET usage_count = usage_count + 1
    WHERE id = employee_record.coupon_id;

    -- Record platform metric
    INSERT INTO platform_metrics (metric_name, metric_value, metric_type)
    VALUES ('referral_signups', 1, 'counter');

    result := json_build_object(
        'success', true,
        'employee_id', employee_record.id,
        'commission_awarded', commission_amount,
        'points_awarded', 1,
        'total_points', COALESCE(employee_record.points, 0) + 1,
        'total_commission', COALESCE(employee_record.commission_earned, 0) + commission_amount
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update letter timeline
CREATE OR REPLACE FUNCTION update_letter_timeline(
    letter_id_param UUID,
    new_status TEXT,
    message_param TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Insert timeline entry
    INSERT INTO letter_timeline (letter_id, status, message)
    VALUES (letter_id_param, new_status, message_param);

    -- Update letter status
    UPDATE public.letters
    SET
        timeline_status = new_status,
        updated_at = NOW()
    WHERE id = letter_id_param;

    -- Record platform metric
    INSERT INTO platform_metrics (metric_name, metric_value, metric_type)
    VALUES ('letter_status_updates', 1, 'counter');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get employee analytics
CREATE OR REPLACE FUNCTION get_employee_analytics(employee_uuid UUID)
RETURNS JSON AS $$
DECLARE
    analytics JSON;
BEGIN
    SELECT json_build_object(
        'total_referrals', COUNT(cp.id),
        'total_commissions', COALESCE(SUM(cp.commission_amount), 0),
        'total_points', COALESCE(SUM(cp.points_awarded), 0),
        'current_points', COALESCE(p.points, 0),
        'current_commission_earned', COALESCE(p.commission_earned, 0),
        'coupon_code', p.coupon_code,
        'coupon_usage_count', COALESCE(ec.usage_count, 0),
        'monthly_referrals', COUNT(CASE
            WHEN DATE_TRUNC('month', cp.created_at) = DATE_TRUNC('month', NOW())
            THEN cp.id ELSE NULL END),
        'monthly_commissions', COALESCE(SUM(CASE
            WHEN DATE_TRUNC('month', cp.created_at) = DATE_TRUNC('month', NOW())
            THEN cp.commission_amount ELSE 0 END), 0),
        'recent_referrals', (
            SELECT json_agg(json_build_object(
                'user_email', referred_profile.email,
                'commission_amount', recent_cp.commission_amount,
                'created_at', recent_cp.created_at
            ))
            FROM commission_payments recent_cp
            JOIN public.profiles referred_profile ON recent_cp.referred_user_id = referred_profile.id
            WHERE recent_cp.employee_id = employee_uuid
            ORDER BY recent_cp.created_at DESC
            LIMIT 5
        )
    ) INTO analytics
    FROM public.profiles p
    LEFT JOIN commission_payments cp ON cp.employee_id = p.id
    LEFT JOIN employee_coupons ec ON ec.employee_id = p.id
    WHERE p.id = employee_uuid
    GROUP BY p.id, p.points, p.commission_earned, p.coupon_code, ec.usage_count;

    RETURN COALESCE(analytics, json_build_object(
        'total_referrals', 0,
        'total_commissions', 0,
        'total_points', 0,
        'current_points', 0,
        'current_commission_earned', 0,
        'coupon_code', NULL,
        'coupon_usage_count', 0,
        'monthly_referrals', 0,
        'monthly_commissions', 0,
        'recent_referrals', '[]'::json
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin platform metrics
CREATE OR REPLACE FUNCTION get_platform_metrics()
RETURNS JSON AS $$
DECLARE
    metrics JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM public.profiles WHERE role = 'user'),
        'total_employees', (SELECT COUNT(*) FROM public.profiles WHERE role = 'employee'),
        'total_admins', (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin'),
        'total_letters', (SELECT COUNT(*) FROM public.letters),
        'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM subscriptions WHERE status = 'active'),
        'total_commissions_paid', (SELECT COALESCE(SUM(commission_amount), 0) FROM commission_payments),
        'active_subscriptions', (SELECT COUNT(*) FROM subscriptions WHERE status = 'active'),
        'monthly_revenue', (
            SELECT COALESCE(SUM(amount), 0) FROM subscriptions
            WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
            AND status = 'active'
        ),
        'pending_letters', (
            SELECT COUNT(*) FROM public.letters
            WHERE timeline_status IN ('received', 'under_review')
        ),
        'completed_letters', (
            SELECT COUNT(*) FROM public.letters
            WHERE timeline_status = 'completed'
        ),
        'letters_this_month', (
            SELECT COUNT(*) FROM public.letters
            WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
        ),
        'referrals_this_month', (
            SELECT COUNT(*) FROM commission_payments
            WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
        ),
        'top_employees', (
            SELECT json_agg(json_build_object(
                'employee_id', p.id,
                'email', p.email,
                'total_referrals', COUNT(cp.id),
                'total_commissions', COALESCE(SUM(cp.commission_amount), 0),
                'points', p.points
            ))
            FROM public.profiles p
            LEFT JOIN commission_payments cp ON cp.employee_id = p.id
            WHERE p.role = 'employee'
            GROUP BY p.id, p.email, p.points
            ORDER BY COUNT(cp.id) DESC, COALESCE(SUM(cp.commission_amount), 0) DESC
            LIMIT 5
        )
    ) INTO metrics;

    RETURN metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- 8. CREATE TRIGGERS
-- ==============================================

-- Trigger to automatically generate coupon for new employees
CREATE OR REPLACE FUNCTION auto_generate_employee_coupon()
RETURNS TRIGGER AS $$
BEGIN
    -- Only for employees and only if they don't already have a coupon
    IF NEW.role = 'employee' AND (NEW.coupon_code IS NULL OR NEW.coupon_code = '') THEN
        PERFORM generate_employee_coupon(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_auto_generate_employee_coupon ON public.profiles;
CREATE TRIGGER trigger_auto_generate_employee_coupon
    AFTER INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_employee_coupon();

-- Trigger for updating updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers for new tables
CREATE TRIGGER update_employee_coupons_updated_at
    BEFORE UPDATE ON employee_coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 9. GRANT PERMISSIONS
-- ==============================================

-- Grant execute permissions for new functions
GRANT EXECUTE ON FUNCTION generate_employee_coupon(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION process_referral_signup(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_letter_timeline(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_employee_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_platform_metrics() TO authenticated;

-- Grant permissions on new tables
GRANT ALL ON employee_coupons TO authenticated;
GRANT ALL ON commission_payments TO authenticated;
GRANT ALL ON subscriptions TO authenticated;
GRANT ALL ON letter_timeline TO authenticated;
GRANT ALL ON platform_metrics TO authenticated;

-- ==============================================
-- 10. SAMPLE DATA AND VALIDATION
-- ==============================================

-- Create sample admin user if needed (commented out - uncomment to use)
/*
-- First, you need to create the user in Supabase Auth, then update this:
INSERT INTO public.profiles (id, email, role, created_at, updated_at)
VALUES (
    'REPLACE_WITH_ACTUAL_UUID_FROM_AUTH',
    'admin@talktomylawyer.com',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();
*/

-- Update existing employee profiles to generate coupons
UPDATE public.profiles
SET updated_at = NOW()
WHERE role = 'employee' AND (coupon_code IS NULL OR coupon_code = '');

-- ==============================================
-- SUCCESS MESSAGE
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'THREE-TIER DATABASE ENHANCEMENT COMPLETED!';
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'New features added:';
    RAISE NOTICE '✅ Employee coupon system with auto-generation';
    RAISE NOTICE '✅ Commission and referral tracking';
    RAISE NOTICE '✅ Enhanced letter system with timeline';
    RAISE NOTICE '✅ Subscription management with coupons';
    RAISE NOTICE '✅ Admin analytics and platform metrics';
    RAISE NOTICE '✅ Comprehensive RLS policies';
    RAISE NOTICE '✅ Business logic functions';
    RAISE NOTICE '✅ Automated triggers';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test the functions with sample data';
    RAISE NOTICE '2. Update frontend components';
    RAISE NOTICE '3. Enhance Edge Functions';
    RAISE NOTICE '4. Implement three-tier authentication';
    RAISE NOTICE '==================================================';
END $$;