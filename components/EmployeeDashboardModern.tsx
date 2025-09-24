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
  Activity,
  Percent,
  Link,
  Crown,
  Zap,
  CheckCircle,
  Clock,
  ExternalLink,
  ArrowUpRight,
  RefreshCw,
  Share2,
  Wallet,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { discountService } from '../services/discountService';
import type { DiscountCode, EmployeeAnalytics } from '../types';
import { CompletionBanner, useBanners } from './CompletionBanner';

// Enhanced Analytics Card Component
const AnalyticsCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'indigo';
  subtitle?: string;
  onClick?: () => void;
}> = ({ icon, label, value, change, trend, color = 'blue', subtitle, onClick }) => {
  const colorClasses = {
    green: 'from-green-500 to-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    blue: 'from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    purple: 'from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
    orange: 'from-orange-500 to-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
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

// Discount Code Card Component
const DiscountCodeCard: React.FC<{
  code: DiscountCode;
  onCopy: () => void;
  onShare: () => void;
}> = ({ code, onCopy, onShare }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.code);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="legal-card legal-card-hover p-6 border-l-4 border-l-blue-500"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Gift className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {code.code}
            </h3>
            <span className={`
              px-2 py-1 rounded-md text-xs font-medium
              ${code.isActive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
            `}>
              {code.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Usage Count</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {code.usageCount || 0} times
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
              <p className="font-semibold text-green-600 dark:text-green-400">
                ${((code.usageCount || 0) * 0.05 * 29.99).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${copied
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-400'}
            `}
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onShare}
            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 dark:text-blue-400 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Created {new Date(code.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Percent className="w-3 h-3" />
            20% Discount
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Performance Chart Component (Placeholder)
const PerformanceChart: React.FC<{
  data: any[];
  title: string;
}> = ({ data, title }) => (
  <div className="legal-card p-6">
    <h3 className="heading-3 mb-6">{title}</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 dark:text-gray-400">Chart visualization coming soon</p>
      </div>
    </div>
  </div>
);

export const EmployeeDashboardModern: React.FC = () => {
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
  const [refreshing, setRefreshing] = useState(false);
  const { banners, showSuccess, showError, showInfo } = useBanners();

  useEffect(() => {
    loadEmployeeData();
  }, []);

  const loadEmployeeData = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    showInfo('Loading Dashboard', 'Fetching your employee data...');

    try {
      const employeeId = user.email;

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEmployeeData();
    setRefreshing(false);
  };

  const handleCopyCode = () => {
    showSuccess('Code Copied', 'Discount code copied to clipboard!');
  };

  const handleShareCode = (code: DiscountCode) => {
    if (navigator.share) {
      navigator.share({
        title: 'Get 20% off with Talk to My Lawyer',
        text: `Use discount code ${code.code} to get 20% off professional legal document services!`,
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(
        `Use discount code ${code.code} to get 20% off at ${window.location.origin}`
      );
      showSuccess('Share Link Copied', 'Referral message copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="container-fluid">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your affiliate dashboard...</p>
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
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="heading-2">
              Affiliate Dashboard
            </h1>
          </div>
          <p className="body-regular">
            Track your referrals, earnings, and manage your discount codes.
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
            onClick={handleGenerateCode}
            disabled={isGeneratingCode}
            className="btn-primary inline-flex items-center gap-2"
          >
            {isGeneratingCode ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Generate New Code
          </motion.button>
        </div>
      </motion.div>

      {/* Analytics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <AnalyticsCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Total Commissions"
          value={`$${analytics.totalCommissions.toFixed(2)}`}
          change="+12.5%"
          trend="up"
          color="green"
          subtitle="All time earnings"
        />
        <AnalyticsCard
          icon={<Users className="w-6 h-6" />}
          label="Total Referrals"
          value={analytics.totalReferrals}
          change="+8"
          trend="up"
          color="blue"
          subtitle="Lifetime referrals"
        />
        <AnalyticsCard
          icon={<Gift className="w-6 h-6" />}
          label="Active Codes"
          value={analytics.activeDiscountCodes}
          color="purple"
          subtitle="Currently available"
        />
        <AnalyticsCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Monthly Earnings"
          value={`$${analytics.monthlyEarnings.toFixed(2)}`}
          change="+24.3%"
          trend="up"
          color="orange"
          subtitle="This month"
        />
      </motion.div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Quick Stats */}
        <div className="lg:col-span-1">
          <div className="legal-card p-6">
            <h3 className="heading-3 mb-6">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Percent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Commission Rate</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">5%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conversion Rate</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">18.5%</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg. Order Value</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">$29.99</span>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="w-full btn-outline text-sm"
                >
                  View Detailed Analytics
                  <ExternalLink className="w-4 h-4 ml-2" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="lg:col-span-2">
          <PerformanceChart
            data={analytics.codeUsageStats}
            title="Referral Performance"
          />
        </div>
      </motion.div>

      {/* Discount Codes Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-3">Your Discount Codes</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            Updated {new Date().toLocaleDateString()}
          </div>
        </div>

        {discountCodes.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {discountCodes.map((code) => (
              <DiscountCodeCard
                key={code.id}
                code={code}
                onCopy={handleCopyCode}
                onShare={() => handleShareCode(code)}
              />
            ))}
          </div>
        ) : (
          <div className="legal-card p-12 text-center">
            <Gift className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Discount Codes Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Generate your first discount code to start earning commissions from referrals.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerateCode}
              disabled={isGeneratingCode}
              className="btn-primary inline-flex items-center gap-2"
            >
              {isGeneratingCode ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Generate Your First Code
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="legal-card p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              How the Affiliate Program Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Share Your Code</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generate and share discount codes with potential customers.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Customer Signs Up</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    They get 20% off their subscription using your code.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">You Earn Commission</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive 5% commission on their subscription payments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Render all banners */}
      {banners.map(banner => (
        <CompletionBanner key={banner.id} {...banner} />
      ))}
    </div>
  );
};