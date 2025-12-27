import React from 'react';
import { Loader2 } from 'lucide-react';

const GenerationProgress = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'queued':
        return {
          text: 'Queued',
          description: 'Your request is in queue...',
          color: 'text-yellow-400'
        };
      case 'processing':
        return {
          text: 'Processing',
          description: 'AI is generating your try-on image...',
          color: 'text-blue-400'
        };
      case 'completed':
        return {
          text: 'Completed',
          description: 'Your image is ready!',
          color: 'text-green-400'
        };
      case 'failed':
        return {
          text: 'Failed',
          description: 'Something went wrong. Please try again.',
          color: 'text-red-400'
        };
      default:
        return {
          text: 'Processing',
          description: 'Please wait...',
          color: 'text-gray-400'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {status !== 'completed' && status !== 'failed' && (
        <Loader2 size={48} className={`${statusInfo.color} animate-spin`} />
      )}
      <div className="text-center">
        <h3 className={`text-2xl font-bold ${statusInfo.color} mb-2`}>
          {statusInfo.text}
        </h3>
        <p className="text-gray-400">{statusInfo.description}</p>
      </div>
      {status === 'processing' && (
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default GenerationProgress;
