import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  XCircle,
  Shield,
  Crown,
  Activity,
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  MoreHorizontal,
  Database,
  PieChart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { discountService } from '../services/discountService';
import type { Employee, DiscountUsage } from '../types/index';
import { CompletionBanner, useBanners } from './CompletionBanner';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [adminStats, setAdminStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalDiscountCodes: 0,
    activeDiscountCodes: 0,
    totalCommissionsGenerated: 0,
    monthlyCommissions: 0,
  });
  const [discountUsage, setDiscountUsage] = useState<DiscountUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'employees' | 'usage' | 'analytics'
  >('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState<'all' | 'active' | 'inactive'>('all');
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
        discountService.getAllDiscountUsage(),
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

  const handleToggleEmployee = async (
    employeeId: string,
    isActive: boolean
  ) => {
    const action = isActive ? 'activate' : 'deactivate';
    showInfo(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Employee`,
      `${action.charAt(0).toUpperCase() + action.slice(1)}ing employee account...`
    );

    try {
      const success = await discountService.toggleEmployeeStatus(
        employeeId,
        isActive
      );

      if (success) {
        setEmployees(prev =>
          prev.map(emp => (emp.id === employeeId ? { ...emp, isActive } : emp))
        );

        // Update stats
        setAdminStats(prev => ({
          ...prev,
          activeEmployees: isActive
            ? prev.activeEmployees + 1
            : Math.max(0, prev.activeEmployees - 1),
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
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = employeeFilter === 'all' ||
                         (employeeFilter === 'active' && emp.isActive) ||
                         (employeeFilter === 'inactive' && !emp.isActive);
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (isActive: boolean) => ({
    color: isActive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100',
    icon: isActive ? CheckCircle : XCircle
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Shield className="w-8 h-8 mr-3" />
                Admin Dashboard
              </h1>
              <p className="text-purple-100 text-lg">
                Comprehensive system management and analytics
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm border border-white/30">
                <Crown className="w-4 h-4 inline mr-1" />
                Administrator
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors backdrop-blur-sm border border-white/30"
              >
                <Download className="w-5 h-5 mr-2" />
                Export Report
              </motion.button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-300" />
                </div>
                <span className="text-2xl font-bold">{adminStats.totalEmployees}</span>
              </div>
              <p className="text-purple-100 text-sm">Total Employees</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <UserCheck className="w-5 h-5 text-green-300" />
                </div>
                <span className="text-2xl font-bold">{adminStats.activeEmployees}</span>
              </div>
              <p className="text-purple-100 text-sm">Active</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Gift className="w-5 h-5 text-orange-300" />
                </div>
                <span className="text-2xl font-bold">{adminStats.totalDiscountCodes}</span>
              </div>
              <p className="text-purple-100 text-sm">Total Codes</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-300" />
                </div>
                <span className="text-2xl font-bold">{adminStats.activeDiscountCodes}</span>
              </div>
              <p className="text-purple-100 text-sm">Active Codes</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-emerald-300" />
                </div>
                <span className="text-2xl font-bold">${adminStats.totalCommissionsGenerated.toFixed(0)}</span>
              </div>
              <p className="text-purple-100 text-sm">Total Revenue</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-indigo-300" />
                </div>
                <span className="text-2xl font-bold">${adminStats.monthlyCommissions.toFixed(0)}</span>
              </div>
              <p className="text-purple-100 text-sm">This Month</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-2 shadow-sm border"
      >
        <nav className="flex space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'employees', label: 'Employee Management', icon: Users },
            { id: 'usage', label: 'Discount Usage', icon: Gift },
            { id: 'analytics', label: 'Analytics', icon: PieChart },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </motion.button>
            );
          })}
        </nav>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Employee Status Overview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Employee Status Overview
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg mr-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Active Employees</p>
                      <p className="text-sm text-slate-600">Currently working</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {adminStats.activeEmployees}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="p-3 bg-red-100 rounded-lg mr-4">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Inactive Employees</p>
                      <p className="text-sm text-slate-600">Not currently active</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {adminStats.totalEmployees - adminStats.activeEmployees}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Total Employees</span>
                    <span className="text-xl font-bold text-slate-800">
                      {adminStats.totalEmployees}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Commission Overview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Revenue Analytics
              </h3>
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-700 font-medium">Total Generated</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${adminStats.totalCommissionsGenerated.toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-700 font-medium">This Month</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ${adminStats.monthlyCommissions.toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (adminStats.monthlyCommissions / Math.max(adminStats.totalCommissionsGenerated, 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Avg per Employee</span>
                    <span className="text-lg font-bold text-slate-800">
                      ${adminStats.activeEmployees > 0
                        ? (adminStats.totalCommissionsGenerated / adminStats.activeEmployees).toFixed(0)
                        : '0'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'employees' && (
          <motion.div
            key="employees"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl p-6 shadow-sm border"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-slate-600" />
                  Employee Management
                </h3>
                <p className="text-slate-600 text-sm mt-1">
                  Manage employee accounts and permissions
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600">Active: {adminStats.activeEmployees}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-slate-600">
                    Inactive: {adminStats.totalEmployees - adminStats.activeEmployees}
                  </span>
                </div>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value as any)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Employees</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {filteredEmployees.length > 0 ? (
              <div className="space-y-3">
                {filteredEmployees.map((employee, index) => {
                  const statusBadge = getStatusBadge(employee.isActive);
                  const StatusIcon = statusBadge.icon;

                  return (
                    <motion.div
                      key={employee.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="relative">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-slate-600" />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                              employee.isActive ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                          </div>

                          <div className="flex-1">
                            <h4 className="font-medium text-slate-800">
                              {employee.name || 'No Name Provided'}
                            </h4>
                            <p className="text-sm text-slate-600">{employee.email}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                              <span>Joined: {new Date(employee.createdAt).toLocaleDateString()}</span>
                              <span className={`px-2 py-1 rounded-full font-medium ${statusBadge.color}`}>
                                <StatusIcon className="w-3 h-3 inline mr-1" />
                                {employee.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleEmployee(employee.id, !employee.isActive)}
                            className={`flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
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
                          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-lg font-medium text-slate-600 mb-2">
                  {searchTerm || employeeFilter !== 'all' ? 'No matching employees' : 'No employees found'}
                </h4>
                <p className="text-slate-500">
                  {searchTerm || employeeFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Employees will appear here once they register'
                  }
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'usage' && (
          <motion.div
            key="usage"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl p-6 shadow-sm border"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800 flex items-center">
                <Gift className="w-5 h-5 mr-2 text-slate-600" />
                Recent Discount Usage
              </h3>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>

            {discountUsage.length > 0 ? (
              <div className="space-y-3">
                {discountUsage.slice(0, 20).map((usage, index) => (
                  <motion.div
                    key={usage.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Gift className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <code className="px-2 py-1 bg-slate-100 rounded font-mono font-bold text-blue-600 text-sm">
                              {usage.discountCodeId}
                            </code>
                            <span className="text-xs text-slate-500">
                              {new Date(usage.usedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-6 text-sm">
                            <span className="text-slate-600">
                              Subscription: <strong>${usage.subscriptionAmount.toFixed(2)}</strong>
                            </span>
                            <span className="text-orange-600">
                              Discount: <strong>-${usage.discountAmount.toFixed(2)}</strong>
                            </span>
                            <span className="text-green-600">
                              Commission: <strong>${usage.commissionAmount.toFixed(2)}</strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-lg font-medium text-slate-600 mb-2">
                  No discount usage found
                </h4>
                <p className="text-slate-500">
                  Usage data will appear here when customers use discount codes
                </p>
              </div>
            )}

            {discountUsage.length > 20 && (
              <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm mb-4">
                  Showing latest 20 entries of {discountUsage.length} total uses
                </p>
                <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                  Load More
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Revenue Trends */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Revenue Trends
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Growth Rate</span>
                    <span className="text-lg font-bold text-green-600">+24%</span>
                  </div>
                  <p className="text-xs text-slate-600">Compared to last month</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Avg. Commission</span>
                    <span className="text-lg font-bold text-blue-600">
                      ${adminStats.activeEmployees > 0
                        ? (adminStats.totalCommissionsGenerated / adminStats.activeEmployees).toFixed(0)
                        : '0'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">Per active employee</p>
                </div>
              </div>
            </motion.div>

            {/* System Health */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border"
            >
              <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-600" />
                System Health
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-slate-700">Database</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Healthy</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-slate-700">API Services</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Online</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-slate-700">System Load</span>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">Normal</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render all banners */}
      <AnimatePresence>
        {banners.map(banner => (
          <CompletionBanner key={banner.id} {...banner} />
        ))}
      </AnimatePresence>
    </div>
  );
};
