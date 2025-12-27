import React, { useState, useEffect } from 'react';
import { Crop, Maximize2, Sun, Contrast, X } from 'lucide-react';
import axios from 'axios';

const ImageEditor = ({ imageBase64, onSave, onClose }) => {
  const [editedImage, setEditedImage] = useState(imageBase64);
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleBrightnessChange = async (value) => {
    setBrightness(value);
    await applyAdjustment('brightness', value);
  };

  const handleContrastChange = async (value) => {
    setContrast(value);
    await applyAdjustment('contrast', value);
  };

  const applyAdjustment = async (type, value) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'brightness' ? 'adjust-brightness' : 'adjust-contrast';
      
      const response = await axios.post(
        `${backendUrl}/api/v1/images/${endpoint}`,
        {
          image_base64: imageBase64,
          factor: parseFloat(value)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setEditedImage(response.data.image_base64);
    } catch (error) {
      console.error('Error adjusting image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBrightness(1.0);
    setContrast(1.0);
    setEditedImage(imageBase64);
  };

  const handleSave = () => {
    onSave(editedImage);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-2xl font-bold text-white">Image Editor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image Preview */}
          <div className="bg-black/30 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
            {loading ? (
              <div className="text-white">Processing...</div>
            ) : (
              <img
                src={editedImage}
                alt="Edited"
                className="max-w-full max-h-[400px] object-contain rounded-lg"
              />
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Brightness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-white font-semibold">
                  <Sun size={20} />
                  Brightness
                </label>
                <span className="text-gray-400">{brightness.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={brightness}
                onChange={(e) => handleBrightnessChange(e.target.value)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-white font-semibold">
                  <Contrast size={20} />
                  Contrast
                </label>
                <span className="text-gray-400">{contrast.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={contrast}
                onChange={(e) => handleContrastChange(e.target.value)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
