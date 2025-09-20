export interface DiscountCode {
  id: string;
  code: string;
  discountPercentage: number;
  employeeId: string;
  isActive: boolean;
  usageCount: number;
  maxUses?: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  role: 'employee' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeAnalytics {
  totalReferrals: number;
  totalCommissions: number;
  monthlyEarnings: number;
  activeDiscountCodes: number;
  codeUsageStats: {
    code: string;
    usageCount: number;
    totalRevenue: number;
    totalCommissions: number;
  }[];
}

export interface AdminStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDiscountCodes: number;
  activeDiscountCodes: number;
  totalCommissionsGenerated: number;
  monthlyCommissions: number;
}

export interface DiscountUsage {
  id: string;
  discountCodeId: string;
  userId: string;
  employeeId: string;
  subscriptionAmount: number;
  discountAmount: number;
  commissionAmount: number;
  usedAt: string;
}