import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, CreditCard } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Top Navigation */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white">
            Trail<span className="text-purple-400">Room</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <CreditCard size={20} className="text-purple-400" />
              <span className="font-semibold">{user?.credits || 0} credits</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome, {user?.first_name || 'User'}!
              </h1>
              <p className="text-gray-300">{user?.email}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <DashboardCard
              title="Credits Balance"
              value={user?.credits || 0}
              subtitle="credits available"
            />
            <DashboardCard
              title="Account Type"
              value={user?.role === 'free' ? 'Free' : 'Paid'}
              subtitle={`Daily free credits: ${user?.daily_free_credits || 0}`}
            />
            <DashboardCard
              title="Status"
              value="Active"
              subtitle="Account is active"
            />
          </div>

          <div className="mt-8 p-6 bg-purple-600/20 border border-purple-500/30 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-2">
              🚀 Coming Soon: Try-On Generation
            </h3>
            <p className="text-gray-300 mb-4">
              Phase 1 is complete! We're now working on Phase 2 to bring you the virtual try-on generation feature.
            </p>
            <div className="text-sm text-gray-400">
              Features in development:
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Upload person and clothing images</li>
                <li>Generate realistic try-on results</li>
                <li>View generation history</li>
                <li>Download and share results</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, subtitle }) => (
  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
    <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-sm text-gray-400">{subtitle}</p>
  </div>
);

export default Dashboard;
