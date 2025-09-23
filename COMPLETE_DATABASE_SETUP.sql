-- Complete Database Setup for Law Letter AI Application
-- Run this entire script in your Supabase SQL Editor

-- ==============================================
-- 1. INITIAL SCHEMA SETUP
-- ==============================================

-- Enable Row Level Security
alter default privileges revoke execute on functions from public;

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  role text check (role in ('user', 'employee', 'admin')) not null default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create letters table with all required columns
create table if not exists public.letters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  letter_type text not null,
  description text,
  recipient_info jsonb default '{}',
  sender_info jsonb default '{}',
  priority varchar(20) default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date date,
  ai_generated_content text,
  template_data jsonb default '{}',
  final_content text,
  ai_draft text,
  status text check (status in ('draft', 'submitted', 'in_review', 'approved', 'completed', 'cancelled')) not null default 'submitted',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================
-- 2. SUBSCRIPTION AND DISCOUNT SYSTEM TABLES
-- ==============================================

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('one_letter', 'four_monthly', 'eight_yearly')),
    amount DECIMAL(10,2) NOT NULL,
    original_amount DECIMAL(10,2),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    discount_code_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('inactive', 'active', 'past_due', 'cancelled', 'unpaid')),
    payment_method_id VARCHAR(255),
    billing_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    usage_count INTEGER NOT NULL DEFAULT 0,
    max_uses INTEGER,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create discount_usage table
CREATE TABLE IF NOT EXISTS discount_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create employee_points table
CREATE TABLE IF NOT EXISTS employee_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points_earned INTEGER NOT NULL DEFAULT 1,
    source VARCHAR(50) NOT NULL DEFAULT 'referral',
    reference_id UUID,
    description TEXT,
    earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    total_credits INTEGER NOT NULL DEFAULT 0,
    remaining_credits INTEGER NOT NULL DEFAULT 0,
    plan_type VARCHAR(20) NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- 3. INDEXES FOR PERFORMANCE
-- ==============================================

-- Letters table indexes
CREATE INDEX IF NOT EXISTS idx_letters_user_id ON public.letters(user_id);
CREATE INDEX IF NOT EXISTS idx_letters_status ON public.letters(status);
CREATE INDEX IF NOT EXISTS idx_letters_priority ON public.letters(priority);
CREATE INDEX IF NOT EXISTS idx_letters_created_at ON public.letters(created_at);
CREATE INDEX IF NOT EXISTS idx_letters_letter_type ON public.letters(letter_type);

-- Subscriptions table indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_type ON subscriptions(plan_type);

-- Discount codes table indexes
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_employee_id ON discount_codes(employee_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_is_active ON discount_codes(is_active);

-- Discount usage table indexes
CREATE INDEX IF NOT EXISTS idx_discount_usage_discount_code_id ON discount_usage(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_user_id ON discount_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_employee_id ON discount_usage(employee_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_used_at ON discount_usage(used_at);

-- Employee points table indexes
CREATE INDEX IF NOT EXISTS idx_employee_points_employee_id ON employee_points(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_points_earned_at ON employee_points(earned_at);
CREATE INDEX IF NOT EXISTS idx_employee_points_source ON employee_points(source);

-- User credits table indexes
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_subscription_id ON user_credits(subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_expires_at ON user_credits(expires_at);

-- ==============================================
-- 4. ROW LEVEL SECURITY POLICIES
-- ==============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.letters enable row level security;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Profiles policies
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can view own profile') then
    create policy "Users can view own profile" on public.profiles
      for select using (auth.uid() = id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can update own profile') then
    create policy "Users can update own profile" on public.profiles
      for update using (auth.uid() = id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Admins can view all profiles') then
    create policy "Admins can view all profiles" on public.profiles
      for select using (
        exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      );
  end if;
end $$;

-- Letters policies
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'letters' and policyname = 'Users can view own letters') then
    create policy "Users can view own letters" on public.letters
      for select using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'letters' and policyname = 'Users can insert own letters') then
    create policy "Users can insert own letters" on public.letters
      for insert with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'letters' and policyname = 'Users can update own letters') then
    create policy "Users can update own letters" on public.letters
      for update using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'letters' and policyname = 'Users can delete own letters') then
    create policy "Users can delete own letters" on public.letters
      for delete using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'letters' and policyname = 'Admins can view all letters') then
    create policy "Admins can view all letters" on public.letters
      for select using (
        exists (
          select 1 from public.profiles
          where id = auth.uid() and role = 'admin'
        )
      );
  end if;
end $$;

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "System can manage subscriptions"
    ON subscriptions FOR ALL
    WITH CHECK (true);

CREATE POLICY "Admins can view all subscriptions"
    ON subscriptions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Discount codes policies
CREATE POLICY "Employees can view their own discount codes"
    ON discount_codes FOR SELECT
    USING (employee_id = auth.uid());

CREATE POLICY "System can manage discount codes"
    ON discount_codes FOR ALL
    WITH CHECK (true);

CREATE POLICY "Admins can view all discount codes"
    ON discount_codes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Discount usage policies
CREATE POLICY "Users can view their own discount usage"
    ON discount_usage FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Employees can view their referral usage"
    ON discount_usage FOR SELECT
    USING (employee_id = auth.uid());

CREATE POLICY "System can manage discount usage"
    ON discount_usage FOR ALL
    WITH CHECK (true);

CREATE POLICY "Admins can view all discount usage"
    ON discount_usage FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Employee points policies
CREATE POLICY "Employees can view their own points"
    ON employee_points FOR SELECT
    USING (employee_id = auth.uid());

CREATE POLICY "System can insert employee points"
    ON employee_points FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can view all employee points"
    ON employee_points FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- User credits policies
CREATE POLICY "Users can view their own credits"
    ON user_credits FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "System can manage user credits"
    ON user_credits FOR ALL
    WITH CHECK (true);

CREATE POLICY "Admins can view all user credits"
    ON user_credits FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==============================================
-- 5. FUNCTIONS AND TRIGGERS
-- ==============================================

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    pg_catalog.coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$;

-- Create trigger for new user registration
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.timezone('utc'::text, pg_catalog.now());
  return new;
end;
$$;

-- Create triggers for updated_at
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists letters_updated_at on public.letters;
create trigger letters_updated_at
  before update on public.letters
  for each row execute procedure public.handle_updated_at();

-- Add updated_at triggers for new tables
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_discount_codes_updated_at
    BEFORE UPDATE ON discount_codes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON user_credits
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================
-- 6. HELPER FUNCTIONS
-- ==============================================

-- Function to get employee total points
CREATE OR REPLACE FUNCTION get_employee_total_points(employee_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(points_earned)
         FROM employee_points
         WHERE employee_id = employee_uuid),
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user remaining credits
CREATE OR REPLACE FUNCTION get_user_remaining_credits(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(remaining_credits)
         FROM user_credits
         WHERE user_id = user_uuid
         AND (expires_at IS NULL OR expires_at > NOW())),
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct user credit when creating a letter
CREATE OR REPLACE FUNCTION deduct_user_credit(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    credit_record RECORD;
BEGIN
    -- Find the oldest credit record with remaining credits
    SELECT id, remaining_credits INTO credit_record
    FROM user_credits
    WHERE user_id = user_uuid
    AND remaining_credits > 0
    AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY created_at ASC
    LIMIT 1;

    -- If no credits available, return false
    IF NOT FOUND OR credit_record.remaining_credits <= 0 THEN
        RETURN FALSE;
    END IF;

    -- Deduct one credit
    UPDATE user_credits
    SET remaining_credits = remaining_credits - 1,
        updated_at = NOW()
    WHERE id = credit_record.id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate employee analytics with points
CREATE OR REPLACE FUNCTION get_employee_analytics_with_points(employee_uuid UUID)
RETURNS TABLE (
    total_referrals BIGINT,
    total_commissions DECIMAL,
    total_points INTEGER,
    monthly_earnings DECIMAL,
    monthly_points INTEGER,
    active_discount_codes BIGINT,
    code_usage_stats JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH usage_data AS (
        SELECT
            du.*,
            dc.code,
            DATE_TRUNC('month', du.used_at) = DATE_TRUNC('month', NOW()) as is_current_month
        FROM discount_usage du
        JOIN discount_codes dc ON du.discount_code_id = dc.id
        WHERE du.employee_id = employee_uuid
    ),
    points_data AS (
        SELECT
            COUNT(*) as total_points_count,
            SUM(CASE WHEN DATE_TRUNC('month', earned_at) = DATE_TRUNC('month', NOW()) THEN points_earned ELSE 0 END) as monthly_points_sum
        FROM employee_points
        WHERE employee_id = employee_uuid
    ),
    codes_data AS (
        SELECT COUNT(*) as active_codes_count
        FROM discount_codes
        WHERE employee_id = employee_uuid AND is_active = true
    )
    SELECT
        COALESCE((SELECT COUNT(*) FROM usage_data), 0)::BIGINT as total_referrals,
        COALESCE((SELECT SUM(commission_amount) FROM usage_data), 0) as total_commissions,
        COALESCE((SELECT total_points_count FROM points_data), 0)::INTEGER as total_points,
        COALESCE((SELECT SUM(commission_amount) FROM usage_data WHERE is_current_month), 0) as monthly_earnings,
        COALESCE((SELECT monthly_points_sum FROM points_data), 0)::INTEGER as monthly_points,
        COALESCE((SELECT active_codes_count FROM codes_data), 0)::BIGINT as active_discount_codes,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'code', code,
                    'usageCount', count(*),
                    'totalRevenue', sum(subscription_amount),
                    'totalCommissions', sum(commission_amount)
                )
            )
            FROM usage_data
            GROUP BY code),
            '[]'::jsonb
        ) as code_usage_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- 7. PERMISSIONS AND CONSTRAINTS
-- ==============================================

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;

-- Re-revoke execute on trigger functions after the general grant
revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.handle_updated_at() from anon, authenticated;

-- Grant execute permissions for helper functions
GRANT EXECUTE ON FUNCTION get_employee_total_points(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_remaining_credits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_user_credit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_employee_analytics_with_points(UUID) TO authenticated;

-- Add constraints
ALTER TABLE subscriptions ADD CONSTRAINT check_amount_positive CHECK (amount > 0);
ALTER TABLE subscriptions ADD CONSTRAINT check_original_amount_positive CHECK (original_amount IS NULL OR original_amount > 0);
ALTER TABLE subscriptions ADD CONSTRAINT check_discount_amount_non_negative CHECK (discount_amount >= 0);

ALTER TABLE discount_codes ADD CONSTRAINT check_usage_count_non_negative CHECK (usage_count >= 0);
ALTER TABLE discount_codes ADD CONSTRAINT check_max_uses_positive CHECK (max_uses IS NULL OR max_uses > 0);

ALTER TABLE discount_usage ADD CONSTRAINT check_subscription_amount_positive CHECK (subscription_amount > 0);
ALTER TABLE discount_usage ADD CONSTRAINT check_discount_amount_non_negative CHECK (discount_amount >= 0);
ALTER TABLE discount_usage ADD CONSTRAINT check_commission_amount_non_negative CHECK (commission_amount >= 0);

ALTER TABLE employee_points ADD CONSTRAINT check_points_positive CHECK (points_earned > 0);
ALTER TABLE user_credits ADD CONSTRAINT check_credits_non_negative CHECK (total_credits >= 0 AND remaining_credits >= 0);
ALTER TABLE user_credits ADD CONSTRAINT check_remaining_not_exceed_total CHECK (remaining_credits <= total_credits);

-- ==============================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON TABLE public.profiles IS 'User profiles with role-based access control';
COMMENT ON TABLE public.letters IS 'Legal letters created by users with AI assistance';
COMMENT ON TABLE subscriptions IS 'Tracks user subscriptions and payment information';
COMMENT ON TABLE discount_codes IS 'Tracks discount codes created by employees for referrals';
COMMENT ON TABLE discount_usage IS 'Tracks usage of discount codes and commission calculations';
COMMENT ON TABLE employee_points IS 'Tracks points earned by employees for referrals and other activities';
COMMENT ON TABLE user_credits IS 'Tracks letter credits available to users based on their subscriptions';

COMMENT ON COLUMN public.letters.description IS 'Additional context or description for the letter';
COMMENT ON COLUMN public.letters.recipient_info IS 'Information about the letter recipient (JSON)';
COMMENT ON COLUMN public.letters.sender_info IS 'Information about the letter sender (JSON)';
COMMENT ON COLUMN public.letters.priority IS 'Priority level of the letter request';
COMMENT ON COLUMN public.letters.due_date IS 'Due date for the letter completion';
COMMENT ON COLUMN public.letters.ai_generated_content IS 'Content generated by AI';
COMMENT ON COLUMN public.letters.template_data IS 'User input data for template fields (JSON)';
COMMENT ON COLUMN public.letters.final_content IS 'Final approved content of the letter';
COMMENT ON COLUMN public.letters.ai_draft IS 'AI-generated draft content';

COMMENT ON COLUMN subscriptions.plan_type IS 'Type of subscription plan: one_letter, four_monthly, eight_yearly';
COMMENT ON COLUMN subscriptions.amount IS 'Final amount charged after discounts';
COMMENT ON COLUMN subscriptions.original_amount IS 'Original subscription amount before discounts';
COMMENT ON COLUMN subscriptions.discount_amount IS 'Amount discounted from original price';

COMMENT ON COLUMN discount_codes.discount_percentage IS 'Percentage discount (1-100)';
COMMENT ON COLUMN discount_codes.employee_id IS 'Employee who created this discount code';
COMMENT ON COLUMN discount_codes.usage_count IS 'Number of times this code has been used';

COMMENT ON COLUMN discount_usage.commission_amount IS 'Commission earned by employee for this referral';
COMMENT ON COLUMN discount_usage.subscription_amount IS 'Original subscription amount before discount';
COMMENT ON COLUMN discount_usage.discount_amount IS 'Amount discounted from subscription';

COMMENT ON COLUMN employee_points.source IS 'Source of points: referral, bonus, etc.';
COMMENT ON COLUMN employee_points.reference_id IS 'Reference to the record that generated these points';
COMMENT ON COLUMN user_credits.remaining_credits IS 'Number of letters user can still generate';
COMMENT ON COLUMN user_credits.expires_at IS 'When these credits expire (NULL for one-time purchases)';

COMMENT ON FUNCTION get_employee_total_points(UUID) IS 'Returns total points earned by an employee';
COMMENT ON FUNCTION get_user_remaining_credits(UUID) IS 'Returns remaining letter credits for a user';
COMMENT ON FUNCTION deduct_user_credit(UUID) IS 'Deducts one credit when user creates a letter';
COMMENT ON FUNCTION get_employee_analytics_with_points(UUID) IS 'Returns comprehensive employee analytics including points';

-- ==============================================
-- COMPLETE SETUP FINISHED
-- ==============================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully! All tables, policies, functions, and triggers have been created.';
END $$;
