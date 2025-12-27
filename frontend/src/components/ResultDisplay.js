import React from 'react';
import { Download, Share2, X } from 'lucide-react';

const ResultDisplay = ({ imageBase64, onClose, onDownload }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageBase64}`;
    link.download = `tryon-${Date.now()}.png`;
    link.click();
    if (onDownload) onDownload();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">
          Your Try-On Result ✨
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Result Image */}
      <div className="relative rounded-lg overflow-hidden border-2 border-purple-500/50">
        <img
          src={`data:image/png;base64,${imageBase64}`}
          alt="Try-on result"
          className="w-full h-auto"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
        >
          <Download size={20} />
          Download
        </button>
        <button
          className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
          onClick={() => alert('Share functionality coming soon!')}
        >
          <Share2 size={20} />
          Share
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;
