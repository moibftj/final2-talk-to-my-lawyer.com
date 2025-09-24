import { supabase } from './supabase';

// Interface for discount code data
interface DiscountCode {
  id: string;
  code: string;
  percent_off: number;
  max_uses: number;
  current_uses: number;
  expires_at: string | null;
  created_at: string;
  is_active: boolean;
}

/**
 * Validate a discount code and return its details
 * @param code - The discount code to validate
 * @returns The discount information or null if invalid
 */
export async function validateDiscountCode(code: string): Promise<DiscountCode | null> {
  // Convert to uppercase for consistency
  const normalizedCode = code.toUpperCase().trim();
  
  // Query the database for the discount code
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', normalizedCode)
    .eq('is_active', true)
    .single();
  
  if (error || !data) {
    console.error('Error validating discount code:', error);
    return null;
  }
  
  const discountCode = data as DiscountCode;
  
  // Check if the code has expired
  if (discountCode.expires_at && new Date(discountCode.expires_at) < new Date()) {
    return null;
  }
  
  // Check if the code has reached its usage limit
  if (discountCode.current_uses >= discountCode.max_uses) {
    return null;
  }
  
  return discountCode;
}

/**
 * Apply a discount code by incrementing its usage count
 * @param code - The discount code to apply
 * @returns True if successfully applied, false otherwise
 */
export async function applyDiscountCode(code: string): Promise<boolean> {
  // Validate the code first
  const discountCode = await validateDiscountCode(code);
  
  if (!discountCode) {
    return false;
  }
  
  // Increment the usage count
  const { error } = await supabase
    .from('discount_codes')
    .update({ current_uses: discountCode.current_uses + 1 })
    .eq('id', discountCode.id);
  
  if (error) {
    console.error('Error applying discount code:', error);
    return false;
  }
  
  return true;
}

/**
 * Create a new discount code
 * @param discountData - The discount code data
 * @returns The created discount code or null if failed
 */
export async function createDiscountCode(discountData: Partial<DiscountCode>): Promise<DiscountCode | null> {
  const { data, error } = await supabase
    .from('discount_codes')
    .insert([{
      code: discountData.code?.toUpperCase().trim(),
      percent_off: discountData.percent_off || 10,
      max_uses: discountData.max_uses || 100,
      current_uses: 0,
      expires_at: discountData.expires_at || null,
      is_active: true
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating discount code:', error);
    return null;
  }
  
  return data as DiscountCode;
}

/**
 * Get all available discount codes
 * @param includeInactive - Whether to include inactive codes
 * @returns Array of discount codes
 */
export async function getAllDiscountCodes(includeInactive = false): Promise<DiscountCode[]> {
  let query = supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching discount codes:', error);
    return [];
  }
  
  return data as DiscountCode[];
}

// Placeholder functions for features not yet implemented
export async function getEmployeeAnalytics(employeeId: string): Promise<any> {
  console.warn('getEmployeeAnalytics not implemented');
  return null;
}

export async function getEmployeeDiscountCodes(employeeId: string): Promise<DiscountCode[]> {
  console.warn('getEmployeeDiscountCodes not implemented');
  return [];
}

export async function generateDiscountCode(employeeId: string): Promise<DiscountCode | null> {
  console.warn('generateDiscountCode not implemented');
  return null;
}

export async function toggleDiscountCodeStatus(codeId: string, isActive: boolean): Promise<boolean> {
  console.warn('toggleDiscountCodeStatus not implemented');
  return false;
}

export async function getAllUsers(): Promise<any[]> {
  console.warn('getAllUsers not implemented');
  return [];
}

export async function getAllLetters(): Promise<any[]> {
  console.warn('getAllLetters not implemented');
  return [];
}

export async function getEmployeesWithAnalytics(): Promise<any[]> {
  console.warn('getEmployeesWithAnalytics not implemented');
  return [];
}

// Service object for components that expect object imports
export const discountService = {
  validateDiscountCode,
  applyDiscountCode,
  createDiscountCode,
  getAllDiscountCodes,
  getEmployeeAnalytics,
  getEmployeeDiscountCodes,
  generateDiscountCode,
  toggleDiscountCodeStatus,
  getAllUsers,
  getAllLetters,
  getEmployeesWithAnalytics,
};
