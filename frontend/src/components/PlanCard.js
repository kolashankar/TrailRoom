import React from 'react';

const PlanCard = ({ plan, selected, onSelect }) => {
  const { name, credits, pricing, recommended, description } = plan;

  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-lg border-2 p-6 transition-all hover:shadow-lg ${
        selected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-blue-300'
      }`}
    >
      {/* Recommended Badge */}
      {recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-md">
            ⭐ Recommended
          </span>
        </div>
      )}

      {/* Plan Name */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800">{name}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {/* Credits */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-blue-600">
          {credits ? credits.toLocaleString() : 'Custom'}
        </div>
        <div className="text-sm text-gray-600">Credits</div>
      </div>

      {/* Pricing */}
      {pricing && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Price:</span>
            <span className="text-lg font-semibold text-gray-800">
              ₹{parseFloat(pricing.base_price).toLocaleString()}
            </span>
          </div>

          {parseFloat(pricing.discount_percent) > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span className="text-sm">Discount:</span>
              <span className="font-semibold">
                {pricing.discount_percent}% OFF
              </span>
            </div>
          )}

          <div className="border-t pt-2 flex justify-between items-center">
            <span className="font-bold text-gray-800">Final Price:</span>
            <span className="text-xl font-bold text-blue-600">
              ₹{parseFloat(pricing.final_price).toLocaleString()}
            </span>
          </div>

          {parseFloat(pricing.savings) > 0 && (
            <div className="bg-green-50 rounded p-2 text-center">
              <span className="text-sm text-green-700 font-medium">
                Save ₹{parseFloat(pricing.savings).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Selection Indicator */}
      <div className="mt-4">
        {selected ? (
          <div className="flex items-center justify-center text-blue-600">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold">Selected</span>
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm">
            Click to select
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanCard;
