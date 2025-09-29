-- Three-Tier System Database Schema Enhancement
-- This builds upon the existing COMPLETE_DATABASE_SETUP.sql

-- ==============================================
-- 1. EMPLOYEE COUPON SYSTEM
-- ==============================================

-- Employee coupons table for tracking discount codes
CREATE TABLE IF NOT EXISTS employee_coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code VARCHAR(20) UNIQUE NOT NULL,
    discount_percentage INTEGER NOT NULL DEFAULT 20,
    usage_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced profiles table for employee features
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS commission_earned DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coupon_code TEXT UNIQUE;

-- ==============================================
-- 2. COMMISSION AND TRACKING SYSTEM
-- ==============================================

-- Commission payments tracking
CREATE TABLE IF NOT EXISTS commission_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    commission_amount DECIMAL(10,2) NOT NULL,
    points_awarded INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced subscriptions for coupon tracking
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10,2);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS discount_applied DECIMAL(10,2) DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES auth.users(id);

-- ==============================================
-- 3. LETTER GENERATION ENHANCEMENTS
-- ==============================================

-- Enhanced letters table for timeline tracking
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS sender_address TEXT;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS attorney_name TEXT;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS recipient_name TEXT;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS matter TEXT;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS desired_resolution TEXT;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS timeline_status TEXT DEFAULT 'received';
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS pdf_generated BOOLEAN DEFAULT false;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false;
ALTER TABLE public.letters ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Letter timeline tracking
CREATE TABLE IF NOT EXISTS letter_timeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    letter_id UUID NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 4. ADMIN ANALYTICS TABLES
-- ==============================================

-- Platform metrics for admin dashboard
CREATE TABLE IF NOT EXISTS platform_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    date_recorded DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 5. INDEXES FOR PERFORMANCE
-- ==============================================

-- Employee coupons indexes
CREATE INDEX IF NOT EXISTS idx_employee_coupons_employee_id ON employee_coupons(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_coupons_code ON employee_coupons(code);
CREATE INDEX IF NOT EXISTS idx_employee_coupons_active ON employee_coupons(is_active);

-- Commission payments indexes
CREATE INDEX IF NOT EXISTS idx_commission_payments_employee_id ON commission_payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_commission_payments_user_id ON commission_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_payments_created_at ON commission_payments(created_at);

-- Letter timeline indexes
CREATE INDEX IF NOT EXISTS idx_letter_timeline_letter_id ON letter_timeline(letter_id);
CREATE INDEX IF NOT EXISTS idx_letter_timeline_status ON letter_timeline(status);

-- Platform metrics indexes
CREATE INDEX IF NOT EXISTS idx_platform_metrics_name_date ON platform_metrics(metric_name, date_recorded);

-- ==============================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ==============================================

-- Enable RLS on new tables
ALTER TABLE employee_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE letter_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;

-- Employee coupons policies
CREATE POLICY "Employees can view own coupons"
    ON employee_coupons FOR SELECT
    USING (employee_id = auth.uid());

CREATE POLICY "Employees can update own coupons"
    ON employee_coupons FOR UPDATE
    USING (employee_id = auth.uid());

CREATE POLICY "System can manage employee coupons"
    ON employee_coupons FOR ALL
    WITH CHECK (true);

CREATE POLICY "Admins can view all employee coupons"
    ON employee_coupons FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Commission payments policies
CREATE POLICY "Employees can view own commissions"
    ON commission_payments FOR SELECT
    USING (employee_id = auth.uid());

CREATE POLICY "Users can view their commission payments"
    ON commission_payments FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "System can insert commission payments"
    ON commission_payments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view all commission payments"
    ON commission_payments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Letter timeline policies
CREATE POLICY "Users can view own letter timeline"
    ON letter_timeline FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.letters
            WHERE letters.id = letter_timeline.letter_id
            AND letters.user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage letter timeline"
    ON letter_timeline FOR ALL
    WITH CHECK (true);

CREATE POLICY "Admins can view all letter timelines"
    ON letter_timeline FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Platform metrics policies (admin only)
CREATE POLICY "Admins can view platform metrics"
    ON platform_metrics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can manage platform metrics"
    ON platform_metrics FOR ALL
    WITH CHECK (true);

-- ==============================================
-- 7. FUNCTIONS FOR BUSINESS LOGIC
-- ==============================================

-- Function to generate unique coupon code for employees
CREATE OR REPLACE FUNCTION generate_employee_coupon(employee_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    coupon_code TEXT;
    code_exists BOOLEAN;
BEGIN
    -- Generate a unique 8-character coupon code
    LOOP
        coupon_code := 'TMLG' || UPPER(LEFT(MD5(RANDOM()::text), 4));

        -- Check if code already exists
        SELECT EXISTS(
            SELECT 1 FROM employee_coupons WHERE code = coupon_code
        ) INTO code_exists;

        EXIT WHEN NOT code_exists;
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

-- Function to apply coupon and award commission
CREATE OR REPLACE FUNCTION apply_coupon_and_award_commission(
    coupon_code_param TEXT,
    user_id_param UUID,
    subscription_id_param UUID,
    original_amount_param DECIMAL(10,2)
)
RETURNS JSON AS $$
DECLARE
    coupon_record RECORD;
    discount_amount DECIMAL(10,2);
    final_amount DECIMAL(10,2);
    commission_amount DECIMAL(10,2);
    result JSON;
BEGIN
    -- Get coupon details
    SELECT * INTO coupon_record
    FROM employee_coupons
    WHERE code = coupon_code_param AND is_active = true;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Invalid coupon code');
    END IF;

    -- Calculate amounts
    discount_amount := (original_amount_param * coupon_record.discount_percentage) / 100;
    final_amount := original_amount_param - discount_amount;
    commission_amount := (original_amount_param * 5) / 100; -- 5% commission

    -- Update subscription with coupon details
    UPDATE subscriptions
    SET
        coupon_code = coupon_code_param,
        original_amount = original_amount_param,
        discount_applied = discount_amount,
        employee_id = coupon_record.employee_id,
        amount = final_amount
    WHERE id = subscription_id_param;

    -- Update coupon usage count
    UPDATE employee_coupons
    SET usage_count = usage_count + 1
    WHERE id = coupon_record.id;

    -- Award commission and points to employee
    INSERT INTO commission_payments (employee_id, user_id, subscription_id, commission_amount, points_awarded)
    VALUES (coupon_record.employee_id, user_id_param, subscription_id_param, commission_amount, 1);

    -- Update employee profile
    UPDATE public.profiles
    SET
        points = points + 1,
        commission_earned = commission_earned + commission_amount
    WHERE id = coupon_record.employee_id;

    result := json_build_object(
        'success', true,
        'discount_amount', discount_amount,
        'final_amount', final_amount,
        'commission_amount', commission_amount,
        'employee_id', coupon_record.employee_id
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update letter timeline
CREATE OR REPLACE FUNCTION update_letter_timeline(
    letter_id_param UUID,
    status_param TEXT,
    message_param TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Insert timeline entry
    INSERT INTO letter_timeline (letter_id, status, message)
    VALUES (letter_id_param, status_param, message_param);

    -- Update letter status
    UPDATE public.letters
    SET
        timeline_status = status_param,
        updated_at = NOW()
    WHERE id = letter_id_param;
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
        'coupon_usage_count', (
            SELECT usage_count
            FROM employee_coupons
            WHERE employee_id = employee_uuid
            LIMIT 1
        ),
        'monthly_commissions', COALESCE(SUM(
            CASE WHEN DATE_TRUNC('month', cp.created_at) = DATE_TRUNC('month', NOW())
            THEN cp.commission_amount ELSE 0 END
        ), 0)
    ) INTO analytics
    FROM commission_payments cp
    WHERE cp.employee_id = employee_uuid;

    RETURN analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get admin platform metrics
CREATE OR REPLACE FUNCTION get_admin_platform_metrics()
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
        'letters_this_month', (
            SELECT COUNT(*) FROM public.letters
            WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
        )
    ) INTO metrics;

    RETURN metrics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- 8. TRIGGERS
-- ==============================================

-- Trigger to automatically generate coupon for new employees
CREATE OR REPLACE FUNCTION auto_generate_employee_coupon()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'employee' AND NEW.coupon_code IS NULL THEN
        PERFORM generate_employee_coupon(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_employee_coupon ON public.profiles;
CREATE TRIGGER trigger_auto_generate_employee_coupon
    AFTER INSERT OR UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_employee_coupon();

-- Trigger for updated_at on new tables
CREATE TRIGGER update_employee_coupons_updated_at
    BEFORE UPDATE ON employee_coupons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================
-- 9. GRANT PERMISSIONS
-- ==============================================

-- Grant execute permissions for new functions
GRANT EXECUTE ON FUNCTION generate_employee_coupon(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION apply_coupon_and_award_commission(TEXT, UUID, UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION update_letter_timeline(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_employee_analytics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_platform_metrics() TO authenticated;

-- ==============================================
-- 10. SAMPLE DATA FOR TESTING (OPTIONAL)
-- ==============================================

-- Insert sample admin user (update with real email)
-- INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
-- VALUES (
--     gen_random_uuid(),
--     'admin@talktomylawyer.com',
--     NOW(),
--     NOW(),
--     NOW()
-- );

-- Insert corresponding profile
-- INSERT INTO public.profiles (id, email, role, created_at)
-- SELECT
--     id,
--     email,
--     'admin',
--     NOW()
-- FROM auth.users
-- WHERE email = 'admin@talktomylawyer.com';

-- ==============================================
-- SCHEMA ENHANCEMENT COMPLETE
-- ==============================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Three-tier system database schema enhancement completed successfully!';
    RAISE NOTICE 'New features added:';
    RAISE NOTICE '- Employee coupon system with automatic code generation';
    RAISE NOTICE '- Commission and points tracking';
    RAISE NOTICE '- Enhanced letter timeline system';
    RAISE NOTICE '- Admin analytics and platform metrics';
    RAISE NOTICE '- Comprehensive RLS policies for all roles';
END $$;