import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { discountService } from '../services/discountService';
import type { DiscountCode } from '../types';
import { CompletionBanner, useBanners } from './CompletionBanner';
import { Star, TrendingUp, Gift, DollarSign } from 'lucide-react';

interface EmployeeAnalyticsWithPoints {
  totalReferrals: number;
  totalCommissions: number;
  totalPoints: number;
  monthlyEarnings: number;
  monthlyPoints: number;
  activeDiscountCodes: number;
  codeUsageStats: {
    code: string;
    usageCount: number;
    totalRevenue: number;
    totalCommissions: number;
  }[];
}

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<EmployeeAnalyticsWithPoints>({
    totalReferrals: 0,
    totalCommissions: 0,
    totalPoints: 0,
    monthlyEarnings: 0,
    monthlyPoints: 0,
    activeDiscountCodes: 0,
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
      const employeeId = user.email;

      // Load analytics with points
      const [codes, analyticsData] = await Promise.all([
        discountService.getEmployeeDiscountCodes(employeeId),
        fetchEmployeeAnalyticsWithPoints(employeeId),
      ]);

      setDiscountCodes(codes);
      setAnalytics(analyticsData);

      showSuccess(
        'Dashboard Loaded',
        `Found ${codes.length} discount codes, ${analyticsData.totalPoints} points, and $${analyticsData.totalCommissions.toFixed(2)} in total commissions.`
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

  const fetchEmployeeAnalyticsWithPoints = async (
    employeeId: string
  ): Promise<EmployeeAnalyticsWithPoints> => {
    // This would normally be a function in discountService, but for now we'll simulate it
    const basicAnalytics =
      await discountService.getEmployeeAnalytics(employeeId);

    // Add mock points data (in real app, this would come from the database function)
    return {
      ...basicAnalytics,
      totalPoints: basicAnalytics.totalReferrals, // 1 point per referral
      monthlyPoints: Math.floor(basicAnalytics.monthlyEarnings / 20), // Estimate based on monthly earnings
    };
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

  const getPointsLevel = (
    points: number
  ): { level: string; color: string; nextLevel: number } => {
    if (points < 5)
      return { level: 'Bronze', color: 'text-amber-600', nextLevel: 5 };
    if (points < 15)
      return { level: 'Silver', color: 'text-gray-500', nextLevel: 15 };
    if (points < 30)
      return { level: 'Gold', color: 'text-yellow-500', nextLevel: 30 };
    if (points < 50)
      return { level: 'Platinum', color: 'text-indigo-600', nextLevel: 50 };
    return { level: 'Diamond', color: 'text-purple-600', nextLevel: -1 };
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const pointsLevel = getPointsLevel(analytics.totalPoints);

  return (
    <>
      <div className='space-y-6'>
        {/* Employee Analytics Header */}
        <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border p-6'>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>
            Employee Dashboard
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-green-600'>
                {analytics.totalReferrals}
              </div>
              <div className='text-sm text-gray-600'>Total Referrals</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-blue-600'>
                ${analytics.totalCommissions.toFixed(2)}
              </div>
              <div className='text-sm text-gray-600'>Total Commissions</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-purple-600'>
                ${analytics.monthlyEarnings.toFixed(2)}
              </div>
              <div className='text-sm text-gray-600'>This Month</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-orange-600'>
                {analytics.activeDiscountCodes}
              </div>
              <div className='text-sm text-gray-600'>Active Codes</div>
            </div>
            <div className='text-center'>
              <div className={`text-3xl font-bold ${pointsLevel.color}`}>
                {analytics.totalPoints}
              </div>
              <div className='text-sm text-gray-600'>Total Points</div>
            </div>
          </div>
        </div>

        {/* Points System */}
        <div className='bg-white rounded-lg border p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center'>
              <Star className='w-6 h-6 text-yellow-500 mr-2' />
              <h3 className='text-xl font-semibold text-gray-800'>
                Points & Level
              </h3>
            </div>
            <div
              className={`px-4 py-2 rounded-full font-bold ${pointsLevel.color} bg-gray-100`}
            >
              {pointsLevel.level} Level
            </div>
          </div>

          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-700'>Current Points:</span>
              <span className='font-bold text-2xl'>
                {analytics.totalPoints}
              </span>
            </div>

            {pointsLevel.nextLevel > 0 && (
              <>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-700'>Points to next level:</span>
                  <span className='font-semibold'>
                    {pointsLevel.nextLevel - analytics.totalPoints}
                  </span>
                </div>

                <div className='w-full bg-gray-200 rounded-full h-3'>
                  <div
                    className='bg-blue-600 h-3 rounded-full transition-all duration-500'
                    style={{
                      width: `${(analytics.totalPoints / pointsLevel.nextLevel) * 100}%`,
                    }}
                  ></div>
                </div>
              </>
            )}

            <div className='mt-4 p-4 bg-blue-50 rounded-lg'>
              <div className='flex items-center mb-2'>
                <TrendingUp className='w-5 h-5 text-blue-600 mr-2' />
                <span className='font-medium text-blue-900'>
                  How to Earn Points
                </span>
              </div>
              <ul className='text-sm text-blue-800 space-y-1'>
                <li>
                  • 1 point for each successful referral (user subscribes with
                  your code)
                </li>
                <li>• Bonus points for monthly milestones</li>
                <li>• Special rewards for reaching new levels</li>
              </ul>
            </div>

            {analytics.monthlyPoints > 0 && (
              <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                <span className='text-green-800'>
                  Points earned this month:
                </span>
                <span className='font-bold text-green-600'>
                  {analytics.monthlyPoints}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Discount Codes Management */}
        <div className='bg-white rounded-lg border p-6'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-xl font-semibold text-gray-800'>
              Discount Codes
            </h3>
            <button
              onClick={handleGenerateCode}
              disabled={isGeneratingCode}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isGeneratingCode ? 'Generating...' : 'Generate New Code'}
            </button>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full table-auto'>
              <thead>
                <tr className='bg-gray-50'>
                  <th className='px-4 py-2 text-left font-medium text-gray-700'>
                    Code
                  </th>
                  <th className='px-4 py-2 text-left font-medium text-gray-700'>
                    Discount %
                  </th>
                  <th className='px-4 py-2 text-left font-medium text-gray-700'>
                    Usage Count
                  </th>
                  <th className='px-4 py-2 text-left font-medium text-gray-700'>
                    Status
                  </th>
                  <th className='px-4 py-2 text-left font-medium text-gray-700'>
                    Created
                  </th>
                  <th className='px-4 py-2 text-left font-medium text-gray-700'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {discountCodes.map(code => (
                  <tr key={code.id} className='border-t'>
                    <td className='px-4 py-2 font-mono font-bold text-blue-600'>
                      {code.code}
                    </td>
                    <td className='px-4 py-2'>{code.discountPercentage}%</td>
                    <td className='px-4 py-2'>{code.usageCount}</td>
                    <td className='px-4 py-2'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          code.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {code.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className='px-4 py-2'>
                      {new Date(code.createdAt).toLocaleDateString()}
                    </td>
                    <td className='px-4 py-2'>
                      <button
                        onClick={() =>
                          handleToggleCode(code.id, !code.isActive)
                        }
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          code.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {code.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {discountCodes.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              No discount codes generated yet. Click "Generate New Code" to
              create your first one.
            </div>
          )}
        </div>

        {/* Usage Statistics */}
        {analytics.codeUsageStats.length > 0 && (
          <div className='bg-white rounded-lg border p-6'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4'>
              Code Performance
            </h3>
            <div className='overflow-x-auto'>
              <table className='w-full table-auto'>
                <thead>
                  <tr className='bg-gray-50'>
                    <th className='px-4 py-2 text-left font-medium text-gray-700'>
                      Code
                    </th>
                    <th className='px-4 py-2 text-left font-medium text-gray-700'>
                      Uses
                    </th>
                    <th className='px-4 py-2 text-left font-medium text-gray-700'>
                      Revenue Generated
                    </th>
                    <th className='px-4 py-2 text-left font-medium text-gray-700'>
                      Your Commission
                    </th>
                    <th className='px-4 py-2 text-left font-medium text-gray-700'>
                      Points Earned
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.codeUsageStats.map(stat => (
                    <tr key={stat.code} className='border-t'>
                      <td className='px-4 py-2 font-mono font-bold text-blue-600'>
                        {stat.code}
                      </td>
                      <td className='px-4 py-2'>{stat.usageCount}</td>
                      <td className='px-4 py-2'>
                        ${stat.totalRevenue.toFixed(2)}
                      </td>
                      <td className='px-4 py-2 font-bold text-green-600'>
                        ${stat.totalCommissions.toFixed(2)}
                      </td>
                      <td className='px-4 py-2'>
                        <div className='flex items-center'>
                          <Star className='w-4 h-4 text-yellow-500 mr-1' />
                          <span className='font-bold text-yellow-600'>
                            {stat.usageCount}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
