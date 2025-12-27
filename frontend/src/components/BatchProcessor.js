import React, { useState } from 'react';
import { Upload, X, Check, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import ImageUpload from './ImageUpload';

const BatchProcessor = ({ onClose }) => {
  const [items, setItems] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const addItem = () => {
    setItems([...items, {
      id: Date.now(),
      person_image_base64: null,
      clothing_image_base64: null,
      mode: 'top',
      status: 'pending'
    }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleBatchProcess = async () => {
    if (items.length === 0 || items.some(item => !item.person_image_base64 || !item.clothing_image_base64)) {
      alert('Please complete all uploads before processing');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${backendUrl}/api/v1/batch/tryon`,
        {
          items: items.map(item => ({
            person_image_base64: item.person_image_base64,
            clothing_image_base64: item.clothing_image_base64,
            mode: item.mode
          }))
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const jobIds = response.data.jobs.map(job => job.id).join(',');
      pollJobs(jobIds);
    } catch (error) {
      console.error('Error creating batch:', error);
      alert(error.response?.data?.detail || 'Failed to create batch jobs');
      setProcessing(false);
    }
  };

  const pollJobs = async (jobIds) => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${backendUrl}/api/v1/batch/tryon/status?job_ids=${jobIds}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setResults(response.data.jobs);

        const allCompleted = response.data.jobs.every(
          job => job.status === 'completed' || job.status === 'failed'
        );

        if (allCompleted) {
          clearInterval(interval);
          setProcessing(false);
        }
      } catch (error) {
        console.error('Error polling jobs:', error);
        clearInterval(interval);
        setProcessing(false);
      }
    }, 3000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Check size={20} className="text-green-400" />;
      case 'failed':
        return <AlertCircle size={20} className="text-red-400" />;
      case 'processing':
      case 'queued':
        return <Clock size={20} className="text-yellow-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-auto p-4">
      <div className="max-w-6xl mx-auto my-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className="text-2xl font-bold text-white">Batch Try-On Processor</h2>
            <p className="text-gray-400 text-sm mt-1">Process multiple try-ons at once</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Items */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-semibold">Item {index + 1}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Person Image</label>
                    <ImageUpload
                      onImageSelect={(img) => updateItem(item.id, 'person_image_base64', img)}
                      imagePreview={item.person_image_base64}
                      onClear={() => updateItem(item.id, 'person_image_base64', null)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Clothing Image</label>
                    <ImageUpload
                      onImageSelect={(img) => updateItem(item.id, 'clothing_image_base64', img)}
                      imagePreview={item.clothing_image_base64}
                      onClear={() => updateItem(item.id, 'clothing_image_base64', null)}
                    />
                  </div>
                </div>
                {results.find(r => r.id === item.id) && (
                  <div className="mt-4 flex items-center gap-2">
                    {getStatusIcon(results.find(r => r.id === item.id).status)}
                    <span className="text-sm text-gray-300">
                      Status: {results.find(r => r.id === item.id).status}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={addItem}
              disabled={processing}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              Add Item
            </button>
            <button
              onClick={handleBatchProcess}
              disabled={processing || items.length === 0}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {processing ? 'Processing...' : `Process ${items.length} Items`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchProcessor;
