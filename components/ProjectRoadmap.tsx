import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from './Card';
import { NeonGradientCard } from './magicui/neon-gradient-card';
import { useAuth } from '../contexts/AuthContext';
import { discountService } from '../services/discountService';
import { DiscountCode, EmployeeAnalytics } from '../types';
import { Spinner } from './Spinner';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [analytics, setAnalytics] = useState<EmployeeAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user?.email) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      // In a real app, you'd get the employee ID from the user object
      const employeeId = user?.email; // Using email as temp ID

      const [codes, analyticsData] = await Promise.all([
        discountService.getEmployeeDiscountCodes(employeeId!),
        discountService.getEmployeeAnalytics(employeeId!)
      ]);

      setDiscountCodes(codes);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewCode = async () => {
    try {
      setIsGenerating(true);
      const employeeId = user?.email;
      const newCode = await discountService.generateDiscountCode(employeeId!);

      if (newCode) {
        setDiscountCodes(prev => [newCode, ...prev]);
        // Refresh analytics
        const updatedAnalytics = await discountService.getEmployeeAnalytics(employeeId!);
        setAnalytics(updatedAnalytics);
      }
    } catch (error) {
      console.error('Error generating new code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleCodeStatus = async (codeId: string, isActive: boolean) => {
    const success = await discountService.toggleDiscountCodeStatus(codeId, !isActive);
    if (success) {
      setDiscountCodes(prev =>
        prev.map(code =>
          code.id === codeId ? { ...code, isActive: !isActive } : code
        )
      );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 border-green-200 dark:border-green-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Referrals</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{analytics?.totalReferrals || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">👥</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-800/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Commissions</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">${analytics?.totalCommissions?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">💰</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-800/20 border-purple-200 dark:border-purple-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Monthly Earnings</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">${analytics?.monthlyEarnings?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">📈</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20 border-orange-200 dark:border-orange-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Active Codes</p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{analytics?.activeDiscountCodes || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">🎫</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discount Codes Section */}
      <NeonGradientCard
        className='w-full'
        borderRadius={12}
        neonColors={{ firstColor: '#10B981', secondColor: '#2DD4BF' }}
      >
        <Card className='bg-white/95 dark:bg-slate-900/95'>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Discount Codes</CardTitle>
              <CardDescription>
                Generate and manage 20% discount codes for users. Earn 5% commission on each successful referral.
              </CardDescription>
            </div>
            <button
              onClick={generateNewCode}
              disabled={isGenerating}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isGenerating ? <Spinner /> : <span>🎫</span>}
              Generate New Code
            </button>
          </CardHeader>
          <CardContent>
            {discountCodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No discount codes generated yet.</p>
                <p className="text-sm mt-1">Click "Generate New Code" to create your first discount code.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discountCodes.map((code) => (
                  <div
                    key={code.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      code.isActive
                        ? 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-600'
                        : 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {code.isActive ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                      <button
                        onClick={() => toggleCodeStatus(code.id, code.isActive)}
                        className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                      >
                        {code.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 mb-3">
                      <p className="text-2xl font-bold text-center text-green-600 dark:text-green-400 tracking-wider">
                        {code.code}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Used: {code.usageCount} times
                      </span>
                      <button
                        onClick={() => copyToClipboard(code.code)}
                        className="text-xs px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </NeonGradientCard>

      {/* Code Usage Analytics */}
      {analytics?.codeUsageStats && analytics.codeUsageStats.length > 0 && (
        <Card className="bg-white/95 dark:bg-slate-900/95">
          <CardHeader>
            <CardTitle>Code Performance</CardTitle>
            <CardDescription>
              Detailed analytics for each of your discount codes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Code</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Usage Count</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Total Revenue</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Your Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.codeUsageStats.map((stat, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-3 font-mono font-medium text-green-600 dark:text-green-400">{stat.code}</td>
                      <td className="py-3 px-3">{stat.usageCount}</td>
                      <td className="py-3 px-3">${stat.totalRevenue.toFixed(2)}</td>
                      <td className="py-3 px-3 font-medium text-blue-600 dark:text-blue-400">${stat.totalCommissions.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
