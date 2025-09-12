import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './Card';
import { NeonGradientCard } from './magicui/neon-gradient-card';

export const EmployeeDashboard: React.FC = () => {
    return (
        <NeonGradientCard 
            className="w-full" 
            borderRadius={12}
            neonColors={{ firstColor: "#10B981", secondColor: "#2DD4BF" }} // Green/Teal Gradient
        >
            <Card className="bg-white/95 dark:bg-slate-900/95">
                <CardHeader>
                    <CardTitle>Affiliate Dashboard</CardTitle>
                    <CardDescription>This feature is currently under construction.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <p>The affiliate tracking system is being upgraded.</p>
                        <p className="text-sm mt-1">Please check back later for updates on your referral performance and earnings.</p>
                    </div>
                </CardContent>
            </Card>
        </NeonGradientCard>
    );
};