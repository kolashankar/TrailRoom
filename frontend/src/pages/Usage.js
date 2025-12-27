import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Activity, CreditCard, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Usage = () => {
  const [period, setPeriod] = useState('7d');
  const [usageStats, setUsageStats] = useState(null);
  const [creditUsage, setCreditUsage] = useState(null);
  const [endpointStats, setEndpointStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [usageRes, creditRes, endpointRes] = await Promise.all([
        axios.get(`${backendUrl}/api/v1/analytics/usage?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${backendUrl}/api/v1/analytics/credits?period=30d`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${backendUrl}/api/v1/analytics/endpoints?period=${period}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setUsageStats(usageRes.data);
      setCreditUsage(creditRes.data);
      setEndpointStats(endpointRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Activity className="text-purple-400" />
            Usage Analytics
          </h1>
          <p className="text-gray-400 mt-2">
            Monitor your API usage and performance
          </p>
        </div>
        <div className="flex gap-2">
          {['1d', '7d', '30d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === p
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {p === '1d' ? 'Today' : p === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      {usageStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={<Activity />}
            title="Total Requests"
            value={usageStats.total_requests}
            color="purple"
          />
          <StatsCard
            icon={<TrendingUp />}
            title="Success Rate"
            value={`${Math.round((usageStats.successful_requests / usageStats.total_requests) * 100 || 0)}%`}
            color="green"
          />
          <StatsCard
            icon={<CreditCard />}
            title="Credits Used"
            value={usageStats.total_credits_used}
            color="blue"
          />
          <StatsCard
            icon={<AlertCircle />}
            title="Avg Response Time"
            value={`${usageStats.average_response_time}ms`}
            color="yellow"
          />
        </div>
      )}

      {/* Daily Requests Chart */}
      {usageStats && usageStats.daily_breakdown.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">API Requests Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usageStats.daily_breakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="requests"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                name="Requests"
              />
              <Line
                type="monotone"
                dataKey="errors"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 4 }}
                name="Errors"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Credit Usage Chart */}
      {creditUsage && creditUsage.daily_breakdown.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Credit Usage (30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={creditUsage.daily_breakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="used" fill="#8b5cf6" name="Used" />
              <Bar dataKey="purchased" fill="#10b981" name="Purchased" />
              <Bar dataKey="free" fill="#3b82f6" name="Free" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Endpoint Stats */}
      {endpointStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requests by Endpoint */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Requests by Endpoint</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={endpointStats}
                  dataKey="total_requests"
                  nameKey="endpoint"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {endpointStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Endpoint Performance Table */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Endpoint Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 text-left">
                    <th className="pb-3 text-gray-400 font-medium">Endpoint</th>
                    <th className="pb-3 text-gray-400 font-medium text-right">Requests</th>
                    <th className="pb-3 text-gray-400 font-medium text-right">Success %</th>
                    <th className="pb-3 text-gray-400 font-medium text-right">Avg Time</th>
                  </tr>
                </thead>
                <tbody>
                  {endpointStats.map((endpoint, idx) => (
                    <tr key={idx} className="border-b border-gray-700/50">
                      <td className="py-3 text-white font-mono text-sm">{endpoint.endpoint}</td>
                      <td className="py-3 text-gray-300 text-right">{endpoint.total_requests}</td>
                      <td className="py-3 text-right">
                        <span className={`${
                          endpoint.success_rate >= 95 ? 'text-green-400' :
                          endpoint.success_rate >= 80 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {endpoint.success_rate}%
                        </span>
                      </td>
                      <td className="py-3 text-gray-300 text-right">
                        {endpoint.average_response_time}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {usageStats && usageStats.total_requests === 0 && (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-12 text-center">
          <Activity className="mx-auto mb-4 text-gray-600" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">No API Usage Yet</h3>
          <p className="text-gray-400">
            Start using the API to see analytics and insights here
          </p>
        </div>
      )}
    </div>
  );
};

const StatsCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    purple: 'text-purple-400 bg-purple-500/20',
    green: 'text-green-400 bg-green-500/20',
    blue: 'text-blue-400 bg-blue-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/20'
  };

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        <h3 className="text-gray-400 font-medium">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
};

export default Usage;
