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
  PieChart,
  FileText,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Target,
  Globe,
  Zap,
  TrendingDown,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { discountService } from '../services/discountService';
import type { Employee, DiscountUsage } from '../types/index';
import { CompletionBanner, useBanners } from './CompletionBanner';

// Enhanced Admin Stat Card
const AdminStatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
  subtitle?: string;
  onClick?: () => void;
}> = ({ icon, label, value, change, trend, color = 'blue', subtitle, onClick }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'from-green-500 to-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    orange: 'from-orange-500 to-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    red: 'from-red-500 to-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    indigo: 'from-indigo-500 to-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        legal-card p-6 relative overflow-hidden border
        ${onClick ? 'cursor-pointer' : ''}
        ${colorClasses[color].split(' ').slice(2).join(' ')}
      `}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10 transform translate-x-6 -translate-y-6">
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]}`} />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} flex items-center justify-center text-white`}>
            {icon}
          </div>
          {change && (
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
              ${trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}
            `}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
               trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
               <Activity className="w-3 h-3" />}
              {change}
            </div>
          )}
        </div>

        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// Enhanced Employee Card
const EmployeeCard: React.FC<{
  employee: Employee;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onEdit?: () => void;
  onViewDetails?: () => void;
}> = ({ employee, onToggleStatus, onEdit, onViewDetails }) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    await onToggleStatus(employee.id, !employee.isActive);
    setIsToggling(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="legal-card legal-card-hover p-6 relative"
    >
      {/* Status indicator */}
      <div className={`
        absolute top-4 right-4 w-3 h-3 rounded-full
        ${employee.isActive ? 'bg-green-500' : 'bg-red-500'}
      `} />

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
          {employee.name?.[0]?.toUpperCase() || employee.email[0].toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Employee Info */}
          <div className="mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {employee.name || 'Unnamed Employee'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {employee.email}
            </p>
            <div className={`
              inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium mt-2
              ${employee.isActive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
            `}>
              {employee.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {employee.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Referrals</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {employee.totalReferrals || 0}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Commissions</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                ${(employee.totalCommissions || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {onViewDetails && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onViewDetails}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </motion.button>
              )}
              {onEdit && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onEdit}
                  className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggle}
              disabled={isToggling}
              className={`
                px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200
                ${employee.isActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-800/30'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-800/30'}
                ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isToggling ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                employee.isActive ? 'Deactivate' : 'Activate'
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Tab Navigation Component
const TabNavigation: React.FC<{
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{ id: string; label: string; icon: React.ReactNode; count?: number }>;
}> = ({ activeTab, onTabChange, tabs }) => (
  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
    {tabs.map((tab) => (
      <motion.button
        key={tab.id}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onTabChange(tab.id)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${activeTab === tab.id
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}
        `}
      >
        {tab.icon}
        {tab.label}
        {tab.count !== undefined && (
          <span className={`
            px-2 py-0.5 rounded-full text-xs font-medium
            ${activeTab === tab.id
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}
          `}>
            {tab.count}
          </span>
        )}
      </motion.button>
    ))}
  </div>
);

export const AdminDashboardModern: React.FC = () => {
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
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'usage' | 'analytics'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [refreshing, setRefreshing] = useState(false);
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
          prev.map(emp => (emp.id === employeeId ? { ...emp, isActive } : emp))
        );

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = employeeFilter === 'all' ||
                         (employeeFilter === 'active' && emp.isActive) ||
                         (employeeFilter === 'inactive' && !emp.isActive);
    return matchesSearch && matchesFilter;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'employees', label: 'Employees', icon: <Users className="w-4 h-4" />, count: employees.length },
    { id: 'usage', label: 'Usage Analytics', icon: <Activity className="w-4 h-4" /> },
    { id: 'analytics', label: 'Reports', icon: <PieChart className="w-4 h-4" /> },
  ];

  if (isLoading) {
    return (
      <div className="container-fluid">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="heading-2">
              Admin Dashboard
            </h1>
          </div>
          <p className="body-regular">
            Manage employees, monitor system performance, and oversee affiliate programs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Data
          </motion.button>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <TabNavigation
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as any)}
          tabs={tabs}
        />
      </motion.div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AdminStatCard
              icon={<Users className="w-6 h-6" />}
              label="Total Employees"
              value={adminStats.totalEmployees}
              change="+3"
              trend="up"
              color="blue"
              subtitle={`${adminStats.activeEmployees} active`}
            />
            <AdminStatCard
              icon={<DollarSign className="w-6 h-6" />}
              label="Total Commissions"
              value={`$${adminStats.totalCommissionsGenerated.toFixed(2)}`}
              change="+18.5%"
              trend="up"
              color="green"
              subtitle="All time earnings"
            />
            <AdminStatCard
              icon={<Gift className="w-6 h-6" />}
              label="Active Discount Codes"
              value={adminStats.activeDiscountCodes}
              color="purple"
              subtitle={`${adminStats.totalDiscountCodes} total created`}
            />
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="legal-card p-6">
                <h3 className="heading-3 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full btn-outline text-sm justify-start"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Employee
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full btn-outline text-sm justify-start"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Report
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full btn-outline text-sm justify-start"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    System Settings
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    className="w-full btn-outline text-sm justify-start"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Backup Data
                  </motion.button>
                </div>
              </div>
            </div>

            {/* System Overview */}
            <div className="lg:col-span-2">
              <div className="legal-card p-6">
                <h3 className="heading-3 mb-6">System Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">System Status</span>
                      </div>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">Operational</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Healthy</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Sessions</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">247</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Backup</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">2h ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Employee Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  autoComplete="off"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value as any)}
                aria-label="Filter employees"
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Employees</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredEmployees.length} of {employees.length} employees
            </p>
          </div>

          {/* Employee Grid */}
          {filteredEmployees.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEmployees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onToggleStatus={handleToggleEmployee}
                />
              ))}
            </div>
          ) : (
            <div className="legal-card p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Employees Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || employeeFilter !== 'all'
                  ? 'No employees match your current filters.'
                  : 'No employees have been added to the system yet.'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add First Employee
              </motion.button>
            </div>
          )}
        </motion.div>
      )}

      {/* Usage Analytics Tab */}
      {activeTab === 'usage' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="legal-card p-12 text-center"
        >
          <Activity className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Usage Analytics Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed usage analytics and reporting features are currently in development.
          </p>
        </motion.div>
      )}

      {/* Reports Tab */}
      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="legal-card p-12 text-center"
        >
          <PieChart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Advanced Reports Coming Soon
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive reporting and analytics dashboard is being developed.
          </p>
        </motion.div>
      )}

      {/* Render all banners */}
      {banners.map(banner => (
        <CompletionBanner key={banner.id} {...banner} />
      ))}
    </div>
  );
};