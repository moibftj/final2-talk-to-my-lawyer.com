import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { discountService } from '../services/discountService';
import type { Employee, AdminStats, DiscountUsage } from '../types';
import { CompletionBanner, useBanners } from './CompletionBanner';
import {
  Users,
  DollarSign,
  Gift,
  TrendingUp,
  UserCheck,
  UserX,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalDiscountCodes: 0,
    activeDiscountCodes: 0,
    totalCommissionsGenerated: 0,
    monthlyCommissions: 0
  });
  const [discountUsage, setDiscountUsage] = useState<DiscountUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'usage'>('overview');
  const { banners, showSuccess, showError, showInfo } = useBanners();

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    showInfo('Loading Admin Data', 'Fetching administrative dashboard data...');

    try {
      const [statsData, employeesData, usageData] = await Promise.all([
        discountService.getAdminStats(),
        discountService.getAllEmployees(),
        discountService.getAllDiscountUsage()
      ]);

      setAdminStats(statsData);
      setEmployees(employeesData);
      setDiscountUsage(usageData);

      showSuccess(
        'Dashboard Loaded',
        `Found ${employeesData.length} employees and $${statsData.totalCommissionsGenerated.toFixed(2)} in total commissions.`
      );
    } catch (error) {
      console.error('Failed to load admin data:', error);
      showError(
        'Loading Failed',
        'Unable to load admin dashboard. Please refresh the page.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEmployee = async (employeeId: string, isActive: boolean) => {
    const action = isActive ? 'activate' : 'deactivate';
    showInfo(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Employee`,
      `${action.charAt(0).toUpperCase() + action.slice(1)}ing employee account...`
    );

    try {
      const success = await discountService.toggleEmployeeStatus(employeeId, isActive);

      if (success) {
        setEmployees(prev =>
          prev.map(emp =>
            emp.id === employeeId ? { ...emp, isActive } : emp
          )
        );

        // Update stats
        setAdminStats(prev => ({
          ...prev,
          activeEmployees: isActive
            ? prev.activeEmployees + 1
            : Math.max(0, prev.activeEmployees - 1)
        }));

        showSuccess(
          'Employee Updated',
          `Employee ${isActive ? 'activated' : 'deactivated'} successfully. ${!isActive ? 'All their discount codes have been deactivated.' : ''}`
        );
      } else {
        showError('Update Failed', `Unable to ${action} employee.`);
      }
    } catch (error) {
      console.error(`Failed to ${action} employee:`, error);
      showError('Update Failed', `Unable to ${action} employee.`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
            <div className="flex items-center space-x-2 text-purple-600">
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Administrative Controls</span>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{adminStats.totalEmployees}</div>
              <div className="text-xs text-gray-600">Total Employees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{adminStats.activeEmployees}</div>
              <div className="text-xs text-gray-600">Active Employees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{adminStats.totalDiscountCodes}</div>
              <div className="text-xs text-gray-600">Total Codes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{adminStats.activeDiscountCodes}</div>
              <div className="text-xs text-gray-600">Active Codes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                ${adminStats.totalCommissionsGenerated.toFixed(2)}
              </div>
              <div className="text-xs text-gray-600">Total Commissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                ${adminStats.monthlyCommissions.toFixed(2)}
              </div>
              <div className="text-xs text-gray-600">This Month</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'employees', label: 'Employee Management', icon: Users },
              { id: 'usage', label: 'Discount Usage', icon: Gift }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Employee Status Overview */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Employee Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Active Employees:</span>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <span className="font-semibold text-green-600">{adminStats.activeEmployees}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Inactive Employees:</span>
                  <div className="flex items-center">
                    <XCircle className="w-4 h-4 text-red-500 mr-1" />
                    <span className="font-semibold text-red-600">
                      {adminStats.totalEmployees - adminStats.activeEmployees}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total:</span>
                    <span className="font-bold text-gray-800">{adminStats.totalEmployees}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Commission Overview */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Commission Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Total Generated:</span>
                  <span className="font-bold text-green-600">
                    ${adminStats.totalCommissionsGenerated.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">This Month:</span>
                  <span className="font-bold text-blue-600">
                    ${adminStats.monthlyCommissions.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Avg per Employee:</span>
                    <span className="font-medium text-gray-800">
                      ${adminStats.activeEmployees > 0
                        ? (adminStats.totalCommissionsGenerated / adminStats.activeEmployees).toFixed(2)
                        : '0.00'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Employee Management</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Active: {adminStats.activeEmployees}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>Inactive: {adminStats.totalEmployees - adminStats.activeEmployees}</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Employee</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Joined</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-t">
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            employee.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="font-medium">{employee.name || 'No Name'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-gray-600">{employee.email}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          employee.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        {new Date(employee.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleToggleEmployee(employee.id, !employee.isActive)}
                          className={`flex items-center px-3 py-1 rounded text-xs font-medium transition-colors ${
                            employee.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {employee.isActive ? (
                            <>
                              <UserX className="w-3 h-3 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {employees.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No employees found.
              </div>
            )}
          </div>
        )}

        {activeTab === 'usage' && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Discount Code Usage</h3>

            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Code</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Subscription</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Discount</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {discountUsage.slice(0, 20).map((usage) => (
                    <tr key={usage.id} className="border-t">
                      <td className="px-4 py-2 text-gray-600">
                        {new Date(usage.usedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 font-mono font-bold text-blue-600">
                        {usage.discountCodeId}
                      </td>
                      <td className="px-4 py-2">
                        ${usage.subscriptionAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-orange-600">
                        -${usage.discountAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 font-bold text-green-600">
                        ${usage.commissionAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {discountUsage.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No discount code usage found.
              </div>
            )}

            {discountUsage.length > 20 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                Showing latest 20 entries of {discountUsage.length} total uses
              </div>
            )}
          </div>
        )}
      </div>

      {/* Render all banners */}
      {banners.map(banner => (
        <CompletionBanner key={banner.id} {...banner} />
      ))}
    </>
  );
};