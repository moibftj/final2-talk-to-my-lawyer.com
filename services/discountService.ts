import supabase from './supabase';
import type {
  DiscountCode,
  Employee,
  EmployeeAnalytics,
  AdminStats,
  DiscountUsage,
} from '../types';

class DiscountService {
  // Discount Code Management
  async validateDiscountCode(code: string): Promise<DiscountCode | null> {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      // Check if code has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return null;
      }

      // Check if code has reached max uses
      if (data.max_uses && data.usage_count >= data.max_uses) {
        return null;
      }

      return {
        id: data.id,
        code: data.code,
        discountPercentage: data.discount_percentage,
        employeeId: data.employee_id,
        isActive: data.is_active,
        usageCount: data.usage_count,
        maxUses: data.max_uses,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error validating discount code:', error);
      return null;
    }
  }

  async generateDiscountCode(
    employeeId: string,
    discountPercentage: number = 10
  ): Promise<DiscountCode | null> {
    try {
      // Generate a unique code
      const code = this.generateUniqueCode();

      const { data, error } = await supabase
        .from('discount_codes')
        .insert({
          code,
          employee_id: employeeId,
          discount_percentage: discountPercentage,
          is_active: true,
          usage_count: 0,
        })
        .select()
        .single();

      if (error || !data) {
        console.error('Error generating discount code:', error);
        return null;
      }

      return {
        id: data.id,
        code: data.code,
        discountPercentage: data.discount_percentage,
        employeeId: data.employee_id,
        isActive: data.is_active,
        usageCount: data.usage_count,
        maxUses: data.max_uses,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error generating discount code:', error);
      return null;
    }
  }

  async getEmployeeDiscountCodes(employeeId: string): Promise<DiscountCode[]> {
    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employee discount codes:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        code: item.code,
        discountPercentage: item.discount_percentage,
        employeeId: item.employee_id,
        isActive: item.is_active,
        usageCount: item.usage_count,
        maxUses: item.max_uses,
        expiresAt: item.expires_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching employee discount codes:', error);
      return [];
    }
  }

  async toggleDiscountCodeStatus(
    codeId: string,
    isActive: boolean
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', codeId);

      return !error;
    } catch (error) {
      console.error('Error toggling discount code status:', error);
      return false;
    }
  }

  // Employee Management
  async getEmployeeAnalytics(employeeId: string): Promise<EmployeeAnalytics> {
    try {
      const { data, error } = await supabase.rpc(
        'get_employee_analytics_with_points',
        { employee_uuid: employeeId }
      );

      if (error || !data || data.length === 0) {
        console.error('Error fetching employee analytics:', error);
        return {
          totalReferrals: 0,
          totalCommissions: 0,
          monthlyEarnings: 0,
          activeDiscountCodes: 0,
          codeUsageStats: [],
        };
      }

      const result = data[0];
      return {
        totalReferrals: result.total_referrals || 0,
        totalCommissions: result.total_commissions || 0,
        monthlyEarnings: result.monthly_earnings || 0,
        activeDiscountCodes: result.active_discount_codes || 0,
        codeUsageStats: result.code_usage_stats || [],
      };
    } catch (error) {
      console.error('Error fetching employee analytics:', error);
      return {
        totalReferrals: 0,
        totalCommissions: 0,
        monthlyEarnings: 0,
        activeDiscountCodes: 0,
        codeUsageStats: [],
      };
    }
  }

  // Admin Functions
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'employee')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        email: item.email,
        name: item.full_name,
        isActive: item.is_active !== false, // Default to true if not set
        role: item.role,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  }

  async toggleEmployeeStatus(
    employeeId: string,
    isActive: boolean
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', employeeId);

      // Also deactivate all discount codes if deactivating employee
      if (!isActive) {
        await supabase
          .from('discount_codes')
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('employee_id', employeeId);
      }

      return !error;
    } catch (error) {
      console.error('Error toggling employee status:', error);
      return false;
    }
  }

  async getAdminStats(): Promise<AdminStats> {
    try {
      const [employeesResult, codesResult, commissionsResult] =
        await Promise.all([
          supabase
            .from('profiles')
            .select('*', { count: 'exact' })
            .eq('role', 'employee'),
          supabase.from('discount_codes').select('*', { count: 'exact' }),
          supabase.from('discount_usage').select('commission_amount, used_at'),
        ]);

      const totalEmployees = employeesResult.count || 0;
      const activeEmployees =
        employeesResult.data?.filter(emp => emp.is_active !== false).length ||
        0;
      const totalDiscountCodes = codesResult.count || 0;
      const activeDiscountCodes =
        codesResult.data?.filter(code => code.is_active).length || 0;

      const commissions = commissionsResult.data || [];
      const totalCommissionsGenerated = commissions.reduce(
        (sum, usage) => sum + (usage.commission_amount || 0),
        0
      );

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyCommissions = commissions
        .filter(usage => {
          const usageDate = new Date(usage.used_at);
          return (
            usageDate.getMonth() === currentMonth &&
            usageDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, usage) => sum + (usage.commission_amount || 0), 0);

      return {
        totalEmployees,
        activeEmployees,
        totalDiscountCodes,
        activeDiscountCodes,
        totalCommissionsGenerated,
        monthlyCommissions,
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        totalEmployees: 0,
        activeEmployees: 0,
        totalDiscountCodes: 0,
        activeDiscountCodes: 0,
        totalCommissionsGenerated: 0,
        monthlyCommissions: 0,
      };
    }
  }

  async getAllDiscountUsage(): Promise<DiscountUsage[]> {
    try {
      const { data, error } = await supabase
        .from('discount_usage')
        .select(
          `
          *,
          discount_codes (code),
          profiles:user_id (email),
          employee_profiles:employee_id (email)
        `
        )
        .order('used_at', { ascending: false });

      if (error) {
        console.error('Error fetching discount usage:', error);
        return [];
      }

      return data.map(item => ({
        id: item.id,
        discountCodeId: item.discount_code_id,
        userId: item.user_id,
        employeeId: item.employee_id,
        subscriptionAmount: item.subscription_amount,
        discountAmount: item.discount_amount,
        commissionAmount: item.commission_amount,
        usedAt: item.used_at,
      }));
    } catch (error) {
      console.error('Error fetching discount usage:', error);
      return [];
    }
  }

  // Helper method to generate unique discount codes
  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const discountService = new DiscountService();
