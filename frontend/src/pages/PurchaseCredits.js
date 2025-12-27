import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PricingCalculator from '../components/PricingCalculator';
import PlanCard from '../components/PlanCard';
import RazorpayButton from '../components/RazorpayButton';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const PurchaseCredits = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('custom');
  const [fixedPlan, setFixedPlan] = useState(null);
  const [customPricing, setCustomPricing] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/v1/pricing/plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setFixedPlan(response.data.fixed_plan);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setError('Failed to load pricing plans');
    }
  };

  const handleCreateOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const credits = selectedPlan === 'fixed' ? 2100 : customPricing.credits;

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/payments/create-order`,
        { credits: parseInt(credits) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      setError(error.response?.data?.detail || 'Failed to create order');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/payments/verify`,
        paymentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        navigate('/purchase-success', {
          state: {
            payment: response.data.result,
            credits: order.credits,
          },
        });
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      setError('Payment verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError(error.message || 'Payment failed');
    setLoading(false);
    setOrder(null);
  };

  const currentPricing = selectedPlan === 'fixed' 
    ? fixedPlan?.pricing 
    : customPricing;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Purchase Credits
          </h1>
          <p className="text-gray-600">
            Choose a plan that fits your needs
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Plans Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Fixed Plan */}
          {fixedPlan && (
            <PlanCard
              plan={{
                name: fixedPlan.name,
                credits: fixedPlan.credits,
                pricing: fixedPlan.pricing,
                recommended: fixedPlan.recommended,
              }}
              selected={selectedPlan === 'fixed'}
              onSelect={() => setSelectedPlan('fixed')}
            />
          )}

          {/* Custom Plan */}
          <PlanCard
            plan={{
              name: 'Custom Plan',
              description: 'Choose any amount between 300 and 50,000 credits',
              credits: customPricing?.credits,
              pricing: customPricing,
            }}
            selected={selectedPlan === 'custom'}
            onSelect={() => setSelectedPlan('custom')}
          />
        </div>

        {/* Custom Plan Calculator */}
        {selectedPlan === 'custom' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Customize Your Plan
            </h2>
            <div className="max-w-2xl mx-auto">
              <PricingCalculator onCreditsChange={setCustomPricing} />
            </div>
          </div>
        )}

        {/* Checkout Section */}
        {currentPricing && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Checkout
            </h2>

            {/* Order Summary */}
            <div className="space-y-4 mb-6 border-b pb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Credits:</span>
                <span className="text-lg font-semibold">
                  {parseInt(currentPricing.credits).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Base Price:</span>
                <span className="text-lg">
                  ₹{parseFloat(currentPricing.basePrice || currentPricing.base_price).toLocaleString()}
                </span>
              </div>
              {parseFloat(currentPricing.discountPercent || currentPricing.discount_percent) > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>
                    Discount ({currentPricing.discountPercent || currentPricing.discount_percent}%):
                  </span>
                  <span>
                    -₹{parseFloat(currentPricing.discountAmount || currentPricing.discount_amount).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-xl font-bold border-t pt-4">
                <span>Total:</span>
                <span className="text-blue-600">
                  ₹{parseFloat(currentPricing.finalPrice || currentPricing.final_price).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Button */}
            {!order ? (
              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Proceed to Payment'
                )}
              </button>
            ) : (
              <RazorpayButton
                order={order}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Pay ₹${order.amount_inr}`}
              </RazorpayButton>
            )}

            {/* Security Info */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <div className="flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Secure payment powered by Razorpay
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseCredits;
