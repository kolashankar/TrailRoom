import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Sparkles, History, TrendingUp } from 'lucide-react';

const DashboardHome = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Welcome back, {user?.first_name || 'User'}! 👋
        </h1>
        <p className="text-gray-300 text-lg">
          Ready to create amazing virtual try-ons?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Credits Available"
          value={user?.credits || 0}
          subtitle="Use for generations"
          icon={<TrendingUp className="text-purple-400" size={32} />}
        />
        <StatCard
          title="Account Type"
          value={user?.role === 'free' ? 'Free' : 'Paid'}
          subtitle={`${user?.daily_free_credits || 3} free credits daily`}
          icon={<Sparkles className="text-blue-400" size={32} />}
        />
        <StatCard
          title="Status"
          value="Active"
          subtitle="All systems operational"
          icon={<div className="w-8 h-8 bg-green-500 rounded-full" />}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Link
          to="/dashboard/generate"
          className="group bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 border border-purple-500/50 hover:scale-105 transition-transform"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Sparkles size={32} className="text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Generate Try-On</h3>
          <p className="text-purple-100">
            Upload your images and create stunning virtual try-ons
          </p>
        </Link>

        <Link
          to="/dashboard/history"
          className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <History size={32} className="text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">View History</h3>
          <p className="text-gray-300">
            Browse and manage your previous generations
          </p>
        </Link>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-purple-500/30">
        <h3 className="text-xl font-semibold text-white mb-3">
          💡 How It Works
        </h3>
        <div className="space-y-2 text-gray-300">
          <p>1. Upload a photo of yourself or a model</p>
          <p>2. Upload the clothing item you want to try on</p>
          <p>3. Select the mode (Top only or Full outfit)</p>
          <p>4. Generate and view your virtual try-on!</p>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-gray-400">
            💳 Each generation costs 1 credit. Free users get {user?.daily_free_credits || 3} credits daily.
          </p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-sm text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      {icon}
    </div>
    <p className="text-sm text-gray-400">{subtitle}</p>
  </div>
);

export default DashboardHome;
