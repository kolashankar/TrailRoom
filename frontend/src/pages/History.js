import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';

const History = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${backendUrl}/api/v1/tryon/history/list`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setJobs(response.data.jobs || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this generation?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${backendUrl}/api/v1/tryon/${jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete generation');
    }
  };

  const handleDownload = (imageBase64, jobId) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageBase64}`;
    link.download = `tryon-${jobId}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={48} className="text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Generation History 📊
          </h1>
          <p className="text-gray-300">
            View and manage your previous try-ons
          </p>
        </div>

        {/* Jobs Grid */}
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-white/5 rounded-full mb-4">
              <ImageIcon size={48} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No generations yet
            </h3>
            <p className="text-gray-500">
              Start creating virtual try-ons to see them here
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-purple-500/50 transition-colors group"
              >
                {/* Image */}
                <div 
                  className="relative aspect-square bg-gray-800 cursor-pointer"
                  onClick={() => job.status === 'completed' && setSelectedImage(job)}
                >
                  {job.status === 'completed' && job.result_image_base64 ? (
                    <img
                      src={`data:image/png;base64,${job.result_image_base64}`}
                      alt="Try-on result"
                      className="w-full h-full object-cover"
                    />
                  ) : job.status === 'processing' || job.status === 'queued' ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 size={32} className="text-purple-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-red-400 font-semibold">Failed</p>
                        <p className="text-xs text-gray-500 mt-1">{job.error_message}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`
                      px-2 py-1 text-xs font-semibold rounded-full
                      ${job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        job.status === 'processing' || job.status === 'queued' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }
                    `}>
                      {job.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {job.mode === 'top' ? 'Top Only' : 'Full Outfit'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {new Date(job.created_at).toLocaleDateString()} at {new Date(job.created_at).toLocaleTimeString()}
                  </p>

                  {/* Actions */}
                  {job.status === 'completed' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(job.result_image_base64, job.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                      >
                        <Download size={16} />
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={`data:image/png;base64,${selectedImage.result_image_base64}`}
              alt="Try-on result"
              className="w-full h-auto rounded-lg"
            />
            <div className="mt-4 flex gap-4">
              <button
                onClick={() => handleDownload(selectedImage.result_image_base64, selectedImage.id)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Download size={20} />
                Download
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
