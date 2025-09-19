import supabase from './supabase';
import { DiscountCode, DiscountUsage, EmployeeAnalytics, Subscription } from '../types';

export class DiscountService {
  // Generate a unique discount code for an employee
  async generateDiscountCode(employeeId: string): Promise<DiscountCode | null> {
    try {
      // Generate a unique code (format: EMP-XXXXX)
      const code = `EMP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

      const { data, error } = await supabase
        .from('discount_codes')
        .insert({
          code,
          employee_id: employeeId,
          discount_percentage: 20,
          is_active: true,
          usage_count: 0
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapDbToDiscountCode(data);
    } catch (error) {
      console.error('Error generating discount code:', error);
      return null;
    }
  }

  // Get discount codes for an employee
  async getEmployeeDiscountCodes(employeeId: string): Promise<DiscountCode[]> {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(this.mapDbToDiscountCode);
    } catch (error) {
      console.error('Error fetching employee discount codes:', error);
      return [];
    }
  }

  // Validate and get discount code details
  async validateDiscountCode(code: string): Promise<DiscountCode | null> {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error) return null;
      return this.mapDbToDiscountCode(data);
    } catch (error) {
      console.error('Error validating discount code:', error);
      return null;
    }
  }

  // Apply discount code when user subscribes
  async applyDiscountCode(
    discountCodeId: string,
    userId: string,
    subscriptionAmount: number
  ): Promise<DiscountUsage | null> {
    try {
      // Get discount code details
      const { data: discountData, error: discountError } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('id', discountCodeId)
        .single();

      if (discountError) throw discountError;

      const discountAmount = (subscriptionAmount * discountData.discount_percentage) / 100;
      const commissionAmount = (subscriptionAmount * 5) / 100; // 5% commission

      // Record discount usage
      const { data: usageData, error: usageError } = await supabase
        .from('discount_usage')
        .insert({
          discount_code_id: discountCodeId,
          user_id: userId,
          employee_id: discountData.employee_id,
          subscription_amount: subscriptionAmount,
          discount_amount: discountAmount,
          commission_amount: commissionAmount
        })
        .select()
        .single();

      if (usageError) throw usageError;

      // Update usage count
      await supabase
        .from('discount_codes')
        .update({
          usage_count: discountData.usage_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', discountCodeId);

      return this.mapDbToDiscountUsage(usageData);
    } catch (error) {
      console.error('Error applying discount code:', error);
      return null;
    }
  }

  // Get employee analytics
  async getEmployeeAnalytics(employeeId: string): Promise<EmployeeAnalytics> {
    try {
      // Get total referrals and commissions
      const { data: usageData, error: usageError } = await supabase
        .from('discount_usage')
        .select('*, discount_codes(code)')
        .eq('employee_id', employeeId);

      if (usageError) throw usageError;

      // Get active discount codes count
      const { data: codesData, error: codesError } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('is_active', true);

      if (codesError) throw codesError;

      const totalReferrals = usageData?.length || 0;
      const totalCommissions = usageData?.reduce((sum, usage) => sum + usage.commission_amount, 0) || 0;

      // Calculate monthly earnings (current month)
      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthlyUsage = usageData?.filter(usage =>
        new Date(usage.used_at) >= monthStart
      ) || [];
      const monthlyEarnings = monthlyUsage.reduce((sum, usage) => sum + usage.commission_amount, 0);

      // Group usage by code
      const codeUsageMap = new Map();
      usageData?.forEach(usage => {
        const code = usage.discount_codes?.code || 'Unknown';
        if (!codeUsageMap.has(code)) {
          codeUsageMap.set(code, {
            code,
            usageCount: 0,
            totalRevenue: 0,
            totalCommissions: 0
          });
        }
        const stats = codeUsageMap.get(code);
        stats.usageCount += 1;
        stats.totalRevenue += usage.subscription_amount;
        stats.totalCommissions += usage.commission_amount;
      });

      return {
        totalReferrals,
        totalCommissions,
        activeDiscountCodes: codesData?.length || 0,
        monthlyEarnings,
        codeUsageStats: Array.from(codeUsageMap.values())
      };
    } catch (error) {
      console.error('Error fetching employee analytics:', error);
      return {
        totalReferrals: 0,
        totalCommissions: 0,
        activeDiscountCodes: 0,
        monthlyEarnings: 0,
        codeUsageStats: []
      };
    }
  }

  // Toggle discount code status
  async toggleDiscountCodeStatus(discountCodeId: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', discountCodeId);

      return !error;
    } catch (error) {
      console.error('Error toggling discount code status:', error);
      return false;
    }
  }

  // Helper methods for mapping database objects to TypeScript interfaces
  private mapDbToDiscountCode(data: any): DiscountCode {
    return {
      id: data.id,
      code: data.code,
      employeeId: data.employee_id,
      discountPercentage: data.discount_percentage,
      isActive: data.is_active,
      usageCount: data.usage_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private mapDbToDiscountUsage(data: any): DiscountUsage {
    return {
      id: data.id,
      discountCodeId: data.discount_code_id,
      userId: data.user_id,
      employeeId: data.employee_id,
      subscriptionAmount: data.subscription_amount,
      discountAmount: data.discount_amount,
      commissionAmount: data.commission_amount,
      usedAt: data.used_at
    };
  }
}

export const discountService = new DiscountService();