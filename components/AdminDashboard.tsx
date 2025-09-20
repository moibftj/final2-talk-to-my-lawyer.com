import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { discountService } from '../services/discountService';
import type { User, LetterRequest, DiscountUsage, Subscription } from '../types';
import { CompletionBanner, useBanners } from './CompletionBanner';

interface AdminStats {
  totalUsers: number;
  totalEmployees: number;
  totalLetters: number;
  totalRevenue: number;
  totalCommissions: number;
  activeSubscriptions: number;
}

interface UserWithStats extends User {
  id: string;
  letterCount: number;
  subscriptionStatus?: string;
  lastActive?: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalEmployees: 0,
    totalLetters: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    activeSubscriptions: 0
  });
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [letters, setLetters] = useState<LetterRequest[]>([]);
  const [discountUsages, setDiscountUsages] = useState<DiscountUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'letters' | 'revenue'>('overview');
  const { banners, showSuccess, showError, showInfo } = useBanners();

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    showInfo('Loading Admin Dashboard', 'Fetching system data...');

    try {
      // In a real implementation, these would be admin-specific API calls
      const [allUsers, allLetters] = await Promise.all([
        apiClient.getAllUsers(), // You'd need to implement this
        apiClient.getAllLetters() // You'd need to implement this
      ]);

      // Calculate stats
      const employees = allUsers.filter(u => u.role === 'employee');
      const regularUsers = allUsers.filter(u => u.role === 'user');

      // Mock subscription and revenue data (in real app, fetch from database)
      const mockRevenue = 15420.50;
      const mockCommissions = 771.03;
      const activeSubscriptions = regularUsers.length * 0.7; // 70% subscription rate

      setStats({
        totalUsers: regularUsers.length,
        totalEmployees: employees.length,
        totalLetters: allLetters.length,
        totalRevenue: mockRevenue,
        totalCommissions: mockCommissions,
        activeSubscriptions: Math.floor(activeSubscriptions)
      });

      // Add stats to users
      const usersWithStats: UserWithStats[] = allUsers.map(user => ({
        ...user,
        id: user.email, // Using email as ID for demo
        letterCount: allLetters.filter(l => l.userId === user.email).length,
        subscriptionStatus: user.role === 'user' ? 'active' : 'N/A',
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      setUsers(usersWithStats);
      setLetters(allLetters);

      showSuccess(
        'Dashboard Loaded',
        `Found ${allUsers.length} users, ${allLetters.length} letters, and $${mockRevenue.toFixed(2)} in revenue.`
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

  const handleUserRoleChange = async (userId: string, newRole: 'user' | 'employee' | 'admin') => {
    showInfo('Updating User Role', `Changing user role to ${newRole}...`);

    try {
      // Mock API call (implement in real app)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      // Update stats if role changed to/from employee
      const updatedUser = users.find(u => u.id === userId);
      if (updatedUser) {
        if (updatedUser.role === 'employee' && newRole !== 'employee') {
          setStats(prev => ({ ...prev, totalEmployees: prev.totalEmployees - 1 }));
        } else if (updatedUser.role !== 'employee' && newRole === 'employee') {
          setStats(prev => ({ ...prev, totalEmployees: prev.totalEmployees + 1 }));
        }
      }

      showSuccess(
        'Role Updated',
        `User role successfully changed to ${newRole}.`
      );
    } catch (error) {
      console.error('Failed to update user role:', error);
      showError('Update Failed', 'Unable to update user role.');
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
        {/* Admin Stats Header */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalEmployees}</div>
              <div className="text-sm text-gray-600">Employees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalLetters}</div>
              <div className="text-sm text-gray-600">Total Letters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">${stats.totalRevenue.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">${stats.totalCommissions.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Commissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{stats.activeSubscriptions}</div>
              <div className="text-sm text-gray-600">Active Subs</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg border">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'users', label: 'Users' },
                { id: 'letters', label: 'Letters' },
                { id: 'revenue', label: 'Revenue' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">System Overview</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">User Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Regular Users:</span>
                        <span className="font-medium">{stats.totalUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Employees:</span>
                        <span className="font-medium">{stats.totalEmployees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Subscription Rate:</span>
                        <span className="font-medium">
                          {((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">Financial Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Revenue:</span>
                        <span className="font-medium">${stats.totalRevenue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Employee Commissions:</span>
                        <span className="font-medium">${stats.totalCommissions.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Net Revenue:</span>
                        <span className="font-medium text-green-600">
                          ${(stats.totalRevenue - stats.totalCommissions).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">User Management</h3>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Email</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Role</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Letters</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Subscription</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Last Active</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-t">
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-red-100 text-red-800'
                                : user.role === 'employee'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-2">{user.letterCount}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.subscriptionStatus === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.subscriptionStatus}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={user.role}
                              onChange={(e) => handleUserRoleChange(user.id, e.target.value as any)}
                              className="text-xs border rounded px-2 py-1"
                            >
                              <option value="user">User</option>
                              <option value="employee">Employee</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Letters Tab */}
            {activeTab === 'letters' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">All Letters</h3>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Title</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">User</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Type</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Status</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Priority</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {letters.map((letter) => (
                        <tr key={letter.id} className="border-t">
                          <td className="px-4 py-2 font-medium">{letter.title}</td>
                          <td className="px-4 py-2">{letter.userId}</td>
                          <td className="px-4 py-2">{letter.letterType}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              letter.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : letter.status === 'in_review'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {letter.status}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              letter.priority === 'urgent'
                                ? 'bg-red-100 text-red-800'
                                : letter.priority === 'high'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {letter.priority}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {new Date(letter.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Analytics</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-green-50 rounded-lg p-4 border">
                    <h4 className="font-medium text-green-800 mb-2">Total Revenue</h4>
                    <div className="text-2xl font-bold text-green-600">
                      ${stats.totalRevenue.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-600">All time</div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4 border">
                    <h4 className="font-medium text-blue-800 mb-2">Employee Commissions</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      ${stats.totalCommissions.toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-600">
                      {((stats.totalCommissions / stats.totalRevenue) * 100).toFixed(1)}% of revenue
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border">
                    <h4 className="font-medium text-purple-800 mb-2">Net Profit</h4>
                    <div className="text-2xl font-bold text-purple-600">
                      ${(stats.totalRevenue - stats.totalCommissions).toFixed(2)}
                    </div>
                    <div className="text-sm text-purple-600">After commissions</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-4">Revenue Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subscription Revenue:</span>
                      <span className="font-medium">${(stats.totalRevenue * 0.85).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>One-time Purchases:</span>
                      <span className="font-medium">${(stats.totalRevenue * 0.15).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span>Employee Commissions:</span>
                      <span className="font-medium text-red-600">-${stats.totalCommissions.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Net Revenue:</span>
                      <span className="text-green-600">${(stats.totalRevenue - stats.totalCommissions).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Render all banners */}
      {banners.map(banner => (
        <CompletionBanner key={banner.id} {...banner} />
      ))}
    </>
  );
};