import React from 'react';
import { Check } from 'lucide-react';

const ModeSelector = ({ selectedMode, onModeChange }) => {
  const modes = [
    {
      id: 'top',
      label: 'Top Only',
      description: 'Try on tops, shirts, jackets',
      available: true
    },
    {
      id: 'full',
      label: 'Full Outfit',
      description: 'Try on complete outfits',
      available: true,
      premium: true
    }
  ];

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-200">
        Try-On Mode <span className="text-red-400">*</span>
      </label>
      <div className="grid sm:grid-cols-2 gap-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => mode.available && onModeChange(mode.id)}
            disabled={!mode.available}
            className={`
              relative p-6 rounded-lg border-2 transition-all text-left
              ${selectedMode === mode.id
                ? 'border-purple-500 bg-purple-500/20'
                : mode.available
                ? 'border-gray-600 bg-white/5 hover:border-purple-500/50'
                : 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
              }
            `}
          >
            {selectedMode === mode.id && (
              <div className="absolute top-3 right-3 p-1 bg-purple-500 rounded-full">
                <Check size={16} className="text-white" />
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {mode.label}
                  {mode.premium && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                      Premium
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-400">{mode.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector;
