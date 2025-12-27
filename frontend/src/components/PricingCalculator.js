import React, { useState, useEffect, useMemo } from 'react';

const PricingCalculator = ({ onCreditsChange }) => {
  const [credits, setCredits] = useState(2100);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);

  const MIN_CREDITS = 300;
  const MAX_CREDITS = 50000;

  // Calculate pricing
  const calculatePricing = useMemo(() => {
    const calculateDiscount = (credits) => {
      if (credits < 2100) return 0;
      if (credits === 2100) return 10;
      if (credits >= 50000) return 25;
      
      const creditsRange = 50000 - 2100;
      const discountRange = 25 - 10;
      const discount = 10 + ((credits - 2100) / creditsRange) * discountRange;
      return Math.floor(discount * 10) / 10;
    };

    const basePrice = credits;
    const discountPercent = calculateDiscount(credits);
    const discountAmount = (basePrice * discountPercent) / 100;
    const finalPrice = basePrice - discountAmount;

    return {
      credits,
      basePrice: basePrice.toFixed(2),
      discountPercent: discountPercent.toFixed(1),
      discountAmount: discountAmount.toFixed(2),
      finalPrice: finalPrice.toFixed(2),
      savings: discountAmount.toFixed(2)
    };
  }, [credits]);

  useEffect(() => {
    setPricing(calculatePricing);
    if (onCreditsChange) {
      onCreditsChange(calculatePricing);
    }
  }, [calculatePricing, onCreditsChange]);

  const handleSliderChange = (e) => {
    setCredits(parseInt(e.target.value));
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value) || MIN_CREDITS;
    const boundedValue = Math.max(MIN_CREDITS, Math.min(MAX_CREDITS, value));
    setCredits(boundedValue);
  };

  const percentage = ((credits - MIN_CREDITS) / (MAX_CREDITS - MIN_CREDITS)) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Slider Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-lg font-semibold text-gray-700">
            Select Credits
          </label>
          <input
            type="number"
            value={credits}
            onChange={handleInputChange}
            min={MIN_CREDITS}
            max={MAX_CREDITS}
            step="100"
            className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Slider */}
        <div className="relative pt-1">
          <input
            type="range"
            min={MIN_CREDITS}
            max={MAX_CREDITS}
            step="100"
            value={credits}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{MIN_CREDITS.toLocaleString()}</span>
            <span>{MAX_CREDITS.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Pricing Display */}
      {pricing && (
        <div className="space-y-4 border-t pt-4">
          {/* Credits Display */}
          <div className="text-center bg-blue-50 rounded-lg p-4">
            <div className="text-3xl font-bold text-blue-600">
              {parseInt(pricing.credits).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Credits</div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Base Price:</span>
              <span className="text-lg font-semibold text-gray-800">
                ₹{parseFloat(pricing.basePrice).toLocaleString()}
              </span>
            </div>

            {parseFloat(pricing.discountPercent) > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span>Discount ({pricing.discountPercent}%):</span>
                <span className="text-lg font-semibold">
                  -₹{parseFloat(pricing.discountAmount).toLocaleString()}
                </span>
              </div>
            )}

            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">You Pay:</span>
              <span className="text-2xl font-bold text-blue-600">
                ₹{parseFloat(pricing.finalPrice).toLocaleString()}
              </span>
            </div>

            {parseFloat(pricing.savings) > 0 && (
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-green-700 font-medium">
                  🎉 You save ₹{parseFloat(pricing.savings).toLocaleString()}!
                </div>
              </div>
            )}
          </div>

          {/* Discount Info */}
          {parseFloat(pricing.discountPercent) === 0 && credits < 2100 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-sm text-yellow-800">
                💡 Add {2100 - credits} more credits to get 10% discount!
              </div>
            </div>
          )}

          {parseFloat(pricing.discountPercent) > 0 && parseFloat(pricing.discountPercent) < 25 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                ✨ Add more credits to get up to 25% discount (max at 50,000 credits)
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rate Info */}
      <div className="text-center text-sm text-gray-500 border-t pt-4">
        Rate: ₹1 = 1 credit
      </div>
    </div>
  );
};

export default PricingCalculator;
