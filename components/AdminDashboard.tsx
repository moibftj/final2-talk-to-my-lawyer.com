"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  DollarSign,
  Percent,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AdminStats {
  totalEmployees: number;
  activeEmployees: number;
  totalLetters: number;
  totalRevenue: number;
  totalDiscountCodes: number;
  activeDiscountCodes: number;
  totalCommissionsGenerated: number;
  monthlyCommissions: number;
  monthlyGrowth: number;
}

const AdminDashboard = () => {
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalLetters: 0,
    totalRevenue: 0,
    totalDiscountCodes: 0,
    activeDiscountCodes: 0,
    totalCommissionsGenerated: 0,
    monthlyCommissions: 0,
    monthlyGrowth: 0,
  });

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      setAdminStats({
        totalEmployees: 120,
        activeEmployees: 95,
        totalLetters: 450,
        totalRevenue: 85000,
        totalDiscountCodes: 30,
        activeDiscountCodes: 18,
        totalCommissionsGenerated: 12000,
        monthlyCommissions: 2500,
        monthlyGrowth: 12,
      });

      setChartData([
        { month: "Jan", revenue: 5000, commissions: 700 },
        { month: "Feb", revenue: 7500, commissions: 900 },
        { month: "Mar", revenue: 10000, commissions: 1200 },
        { month: "Apr", revenue: 12000, commissions: 1500 },
        { month: "May", revenue: 15000, commissions: 1800 },
        { month: "Jun", revenue: 18000, commissions: 2000 },
      ]);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total: {adminStats.totalEmployees}</p>
            <p>Active: {adminStats.activeEmployees}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Letters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{adminStats.totalLetters} Letters Generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>${adminStats.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Discount Codes & Growth */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Percent className="mr-2 h-5 w-5" />
              Discount Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total: {adminStats.totalDiscountCodes}</p>
            <p>Active: {adminStats.activeDiscountCodes}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Monthly Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{adminStats.monthlyGrowth}% Growth</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total: ${adminStats.totalCommissionsGenerated.toLocaleString()}</p>
            <p>This Month: ${adminStats.monthlyCommissions.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Commissions Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line type="monotone" dataKey="commissions" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
