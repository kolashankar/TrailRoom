import React from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-8">
          Settings ⚙️
        </h1>

        {/* User Info */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-gray-400">Email</span>
                <span className="text-white font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-gray-400">Account Type</span>
                <span className="text-white font-medium">
                  {user?.role === 'free' ? 'Free' : 'Paid'}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-gray-400">Credits</span>
                <span className="text-white font-medium">{user?.credits || 0}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-white/10">
                <span className="text-gray-400">Daily Free Credits</span>
                <span className="text-white font-medium">{user?.daily_free_credits || 3}</span>
              </div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="mt-8 p-6 bg-purple-600/20 border border-purple-500/30 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-2">
              🚀 More Settings Coming Soon
            </h3>
            <p className="text-gray-300 text-sm">
              We're working on adding more customization options, notification preferences, and account management features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
