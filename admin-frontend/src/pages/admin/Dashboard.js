import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, DollarSign, Briefcase, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/utils';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueChart, setRevenueChart] = useState([]);
  const [jobsChart, setJobsChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, revenueRes, jobsRes] = await Promise.all([
        api.get('/admin/analytics/dashboard'),
        api.get('/admin/analytics/revenue-chart?days=30'),
        api.get('/admin/analytics/jobs-chart?days=30')
      ]);
      
      setStats(statsRes.data);
      setRevenueChart(revenueRes.data.data);
      setJobsChart(jobsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, subtitle, trend }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center text-xs mt-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {Math.abs(trend)}% from last period
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your platform's performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.users?.total || 0}
          icon={Users}
          subtitle={`${stats?.users?.active || 0} active`}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.revenue?.total || 0)}
          icon={DollarSign}
          subtitle={`${formatCurrency(stats?.revenue?.month || 0)} this month`}
        />
        <StatCard
          title="Total Jobs"
          value={stats?.jobs?.total || 0}
          icon={Briefcase}
          subtitle={`${stats?.jobs?.completed || 0} completed`}
        />
        <StatCard
          title="Credits Sold"
          value={stats?.credits?.sold?.toLocaleString() || 0}
          icon={CreditCard}
          subtitle={`${stats?.credits?.used?.toLocaleString() || 0} used`}
        />
      </div>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Free Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users?.free || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Paid Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users?.paid || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.users?.suspended || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Job Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.jobs?.completed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Failed Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.jobs?.failed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.jobs?.processing || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.jobs?.error_rate || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Daily revenue over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Jobs Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Job Statistics</CardTitle>
          <CardDescription>Daily job counts by status over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jobsChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
              <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              <Bar dataKey="processing" fill="#3b82f6" name="Processing" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
