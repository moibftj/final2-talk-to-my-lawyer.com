import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './Card';
import { apiClient } from '../services/apiClient';
import type { UserRole } from '../types';
import { NeonGradientCard } from './magicui/neon-gradient-card';
import { BlurFade } from './magicui/blur-fade';

// Simplified types for display
interface DisplayUser {
    id: string;
    email: string | undefined;
    role: string | undefined;
}

interface DisplayLetter {
    id: string;
    title: string;
    status: string;
    user_id: string;
}

const AdminDashboardSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {[...Array(2)].map((_, i) => (
            <Card key={i} className="w-full animate-pulse">
                <CardHeader>
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded"></div>
                        {[...Array(5)].map((_, j) => (
                            <div key={j} className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
);

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [letters, setLetters] = useState<DisplayLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [fetchedUsers, fetchedLetters] = await Promise.all([
                apiClient.fetchAllUsers(),
                apiClient.fetchAllLetters()
            ]);
            setUsers(fetchedUsers);
            setLetters(fetchedLetters);
        } catch (e: any) {
            console.error("Failed to fetch admin data", e);
            setError("Could not load admin data. You may not have the required permissions.");
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const adminGradient = { firstColor: "#8B5CF6", secondColor: "#6366F1" }; // Purple/Indigo
  
  if (loading) {
      return <AdminDashboardSkeleton />;
  }

  if (error) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-red-500">{error}</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <BlurFade delay={0.25} inView>
        <NeonGradientCard className="w-full" borderRadius={12} neonColors={adminGradient}>
            <Card className="bg-white/95 dark:bg-slate-900/95">
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>List of all users in the system.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400 sticky top-0">
                      <tr>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="bg-transparent border-b dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                          <td className="px-6 py-4 font-medium whitespace-nowrap">{user.email}</td>
                          <td className="px-6 py-4 capitalize">{user.role || 'User'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
        </NeonGradientCard>
      </BlurFade>

      <BlurFade delay={0.35} inView>
        <NeonGradientCard className="w-full" borderRadius={12} neonColors={adminGradient}>
            <Card className="bg-white/95 dark:bg-slate-900/95">
              {/* FIX: Replaced non-existent 'Header' component with 'CardHeader'. */}
              <CardHeader>
                <CardTitle>All Letter Requests</CardTitle>
                <CardDescription>A complete log of all letter requests.</CardDescription>
              </CardHeader>
              <CardContent>
              <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400 sticky top-0">
                      <tr>
                        <th scope="col" className="px-6 py-3">Title</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">User ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {letters.map((letter) => (
                        <tr key={letter.id} className="bg-transparent border-b dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                          <td className="px-6 py-4 font-medium whitespace-nowrap">{letter.title}</td>
                          <td className="px-6 py-4 capitalize">{letter.status}</td>
                          <td className="px-6 py-4 truncate max-w-xs">{letter.user_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
        </NeonGradientCard>
      </BlurFade>
    </div>
  );
};