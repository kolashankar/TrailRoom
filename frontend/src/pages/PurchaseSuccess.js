import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const PurchaseSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  const { payment, credits } = location.state || {};

  useEffect(() => {
    if (!payment) {
      navigate('/purchase-credits');
    }

    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [payment, navigate]);

  if (!payment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <span className="text-2xl">
                {['🎉', '🎊', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-block bg-green-100 rounded-full p-6 mb-4">
            <svg
              className="w-16 h-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Your credits have been added to your account
          </p>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
          {/* Credits Added */}
          <div className="text-center mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              +{credits?.toLocaleString() || payment.credits_added?.toLocaleString()}
            </div>
            <div className="text-gray-600">Credits Added</div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Payment Details
            </h2>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment ID:</span>
              <span className="text-sm font-mono text-gray-800">
                {payment.payment_id}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                {payment.status}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Credits:</span>
              <span className="font-semibold text-gray-800">
                {credits?.toLocaleString() || payment.credits_added?.toLocaleString()}
              </span>
            </div>

            {payment.message && (
              <div className="bg-blue-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">{payment.message}</p>
              </div>
            )}
          </div>

          {/* Invoice Link */}
          {payment.invoice_id && (
            <div className="mt-6 border-t pt-6">
              <Link
                to="/billing"
                className="block text-center text-blue-600 hover:text-blue-700 font-semibold"
              >
                View Invoice →
              </Link>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            to="/dashboard/generate"
            className="block bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold text-center hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
          >
            Start Creating
          </Link>
          <Link
            to="/billing"
            className="block bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold text-center hover:border-blue-500 hover:text-blue-600 transition-all"
          >
            View Billing
          </Link>
        </div>

        {/* Support Info */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Need help? Contact us at support@trailroom.com</p>
        </div>
      </div>

      {/* Custom CSS for confetti animation */}
      <style jsx="true">{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
};

export default PurchaseSuccess;
