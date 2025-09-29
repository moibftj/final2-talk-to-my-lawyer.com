import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Users,
  Gift,
  Star,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Award,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { discountService } from '../services/discountService';
import type { DiscountCode, EmployeeAnalytics } from '../types';
import { CompletionBanner, useBanners } from './CompletionBanner';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<EmployeeAnalytics>({
    totalReferrals: 0,
    totalCommissions: 0,
    activeDiscountCodes: 0,
    monthlyEarnings: 0,
    codeUsageStats: [],
  });
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const { banners, showSuccess, showError, showInfo } = useBanners();

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    showInfo('Loading Dashboard', 'Fetching your employee data...');

    try {
      // Get employee ID from email (in a real app, this would be from user profile)
      const employeeId = user.email; // Simplified for demo

      const [employeeAnalytics, codes] = await Promise.all([
        discountService.getEmployeeAnalytics(employeeId),
        discountService.getEmployeeDiscountCodes(employeeId),
      ]);

      setAnalytics(employeeAnalytics);
      setDiscountCodes(codes);

      showSuccess(
        'Dashboard Loaded',
        `Found ${codes.length} discount codes and $${employeeAnalytics.totalCommissions.toFixed(2)} in total commissions.`
      );
    } catch (error) {
      console.error('Failed to load employee data:', error);
      showError(
        'Loading Failed',
        'Unable to load your employee dashboard. Please refresh the page.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!user?.email) return;

    setIsGeneratingCode(true);
    showInfo('Generating Code', 'Creating new discount code...');

    try {
      const employeeId = user.email;
      const newCode = await discountService.generateDiscountCode(employeeId);

      if (newCode) {
        setDiscountCodes(prev => [newCode, ...prev]);
        setAnalytics(prev => ({
          ...prev,
          activeDiscountCodes: prev.activeDiscountCodes + 1,
        }));
        showSuccess(
          'Code Generated',
          `New discount code "${newCode.code}" created successfully!`
        );
      } else {
        showError(
          'Generation Failed',
          'Unable to generate discount code. Please try again.'
        );
      }
    } catch (error) {
      console.error('Failed to generate code:', error);
      showError(
        'Generation Failed',
        'Unable to generate discount code. Please try again.'
      );
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleToggleCode = async (codeId: string, isActive: boolean) => {
    showInfo(
      isActive ? 'Activating Code' : 'Deactivating Code',
      'Updating discount code status...'
    );

    try {
      const success = await discountService.toggleDiscountCodeStatus(
        codeId,
        isActive
      );

      if (success) {
        setDiscountCodes(prev =>
          prev.map(code => (code.id === codeId ? { ...code, isActive } : code))
        );
        showSuccess(
          'Status Updated',
          `Discount code ${isActive ? 'activated' : 'deactivated'} successfully.`
        );
      } else {
        showError('Update Failed', 'Unable to update discount code status.');
      }
    } catch (error) {
      console.error('Failed to toggle code:', error);
      showError('Update Failed', 'Unable to update discount code status.');
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showSuccess('Code Copied', `Discount code "${code}" copied to clipboard!`);
    } catch (err) {
      showError('Copy Failed', 'Unable to copy code to clipboard.');
    }
  };

  const getPerformanceLevel = (commissions: number) => {
    if (commissions >= 1000) return { level: 'Elite', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (commissions >= 500) return { level: 'Expert', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (commissions >= 100) return { level: 'Rising', color: 'text-green-600', bg: 'bg-green-100' };
    return { level: 'Starter', color: 'text-slate-600', bg: 'bg-slate-100' };
  };

  const performance = getPerformanceLevel(analytics.totalCommissions);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Employee Dashboard</h1>
              <p className="text-emerald-100 text-lg">
                Track your referrals and commissions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${performance.bg} ${performance.color}`}>
                <Award className="w-4 h-4 inline mr-1" />
                {performance.level}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateCode}
                disabled={isGeneratingCode}
                className="flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-colors backdrop-blur-sm border border-white/30"
              >
                <Plus className="w-5 h-5 mr-2" />
                {isGeneratingCode ? 'Generating...' : 'New Code'}
              </motion.button>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <span className="text-2xl font-bold">{analytics.totalReferrals}</span>
              </div>
              <p className="text-emerald-100 text-sm">Total Referrals</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-300" />
                </div>
                <span className="text-2xl font-bold">${analytics.totalCommissions.toFixed(0)}</span>
              </div>
              <p className="text-emerald-100 text-sm">Total Commissions</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-300" />
                </div>
                <span className="text-2xl font-bold">${analytics.monthlyEarnings.toFixed(0)}</span>
              </div>
              <p className="text-emerald-100 text-sm">This Month</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Gift className="w-5 h-5 text-orange-300" />
                </div>
                <span className="text-2xl font-bold">{analytics.activeDiscountCodes}</span>
              </div>
              <p className="text-emerald-100 text-sm">Active Codes</p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Discount Codes Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-slate-600" />
              Discount Codes
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-500">
                {discountCodes.filter(c => c.isActive).length} of {discountCodes.length} active
              </span>
              <button
                onClick={handleGenerateCode}
                disabled={isGeneratingCode}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGeneratingCode ? 'Generating...' : 'Generate Code'}
              </button>
            </div>
          </div>

          {discountCodes.length > 0 ? (
            <div className="space-y-3">
              {discountCodes.map((code, index) => (
                <motion.div
                  key={code.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <code className="px-3 py-1 bg-slate-100 rounded-lg font-mono font-bold text-blue-600">
                          {code.code}
                        </code>
                        <button
                          onClick={() => handleCopyCode(code.code)}
                          className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                          title="Copy code"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            code.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {code.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-6 text-sm text-slate-600">
                        <span>{code.discountPercentage}% discount</span>
                        <span>{code.usageCount} uses</span>
                        <span>Created {new Date(code.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleCode(code.id, !code.isActive)}
                      className={`flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        code.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {code.isActive ? (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Activate
                        </>
                      )}
                    </button>
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
                No discount codes yet
              </h4>
              <p className="text-slate-500 mb-4">
                Generate your first discount code to start earning commissions
              </p>
              <button
                onClick={handleGenerateCode}
                disabled={isGeneratingCode}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isGeneratingCode ? 'Generating...' : 'Generate Code'}
              </button>
            </div>
          )}
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Performance</h3>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>

            <div className="text-center mb-6">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${performance.bg} ${performance.color}`}>
                <Award className="w-5 h-5 mr-2" />
                {performance.level}
              </div>
              <p className="text-slate-500 text-sm mt-2">Current tier</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Commission Rate</span>
                <span className="font-medium text-slate-800">5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Referral Bonus</span>
                <span className="font-medium text-slate-800">1 point</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Active Since</span>
                <span className="font-medium text-slate-800">Jan 2024</span>
              </div>
            </div>
          </motion.div>

          {/* Monthly Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border"
          >
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-slate-600" />
              Monthly Goals
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Referrals</span>
                  <span className="text-sm font-medium">5/10</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-1/2" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Commissions</span>
                  <span className="text-sm font-medium">${analytics.monthlyEarnings.toFixed(0)}/$500</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (analytics.monthlyEarnings / 500) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-sm border"
          >
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-slate-600" />
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Avg. per Referral</span>
                <span className="font-medium text-slate-800">
                  ${analytics.totalReferrals > 0 ? (analytics.totalCommissions / analytics.totalReferrals).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Conversion Rate</span>
                <span className="font-medium text-green-600">
                  {discountCodes.length > 0 ? Math.round((analytics.totalReferrals / discountCodes.reduce((sum, code) => sum + code.usageCount, 1)) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Best Code</span>
                <span className="font-medium text-slate-800 font-mono text-xs">
                  {discountCodes.length > 0 ? discountCodes.sort((a, b) => b.usageCount - a.usageCount)[0].code : 'N/A'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Code Performance Section */}
      {analytics.codeUsageStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm border"
        >
          <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-slate-600" />
            Code Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Uses</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-700">Commission</th>
                </tr>
              </thead>
              <tbody>
                {analytics.codeUsageStats.map((stat, index) => (
                  <motion.tr
                    key={stat.code}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4">
                      <code className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {stat.code}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{stat.usageCount}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      ${stat.totalRevenue.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 font-bold text-green-600">
                      ${stat.totalCommissions.toFixed(2)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Render all banners */}
      <AnimatePresence>
        {banners.map(banner => (
          <CompletionBanner key={banner.id} {...banner} />
        ))}
      </AnimatePresence>
    </div>
  );
};
