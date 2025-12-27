import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Image as ImageIcon } from 'lucide-react';
import { Highlight, themes } from 'prism-react-renderer';

const ResponseViewer = ({ response, loading }) => {
  const [imagePreview, setImagePreview] = useState(null);

  if (loading) {
    return (
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-400">Sending request...</p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-8 flex items-center justify-center min-h-[300px]">
        <p className="text-gray-500">Response will appear here</p>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (response.status >= 200 && response.status < 300) {
      return <CheckCircle className="text-green-400" size={20} />;
    } else if (response.status >= 400) {
      return <XCircle className="text-red-400" size={20} />;
    }
    return <Clock className="text-yellow-400" size={20} />;
  };

  const getStatusColor = () => {
    if (response.status >= 200 && response.status < 300) {
      return 'text-green-400';
    } else if (response.status >= 400) {
      return 'text-red-400';
    }
    return 'text-yellow-400';
  };

  // Check if response contains base64 image
  const detectImages = (obj) => {
    const images = [];
    const traverse = (data, path = '') => {
      if (typeof data === 'string' && data.startsWith('data:image')) {
        images.push({ path, data });
      } else if (typeof data === 'object' && data !== null) {
        Object.entries(data).forEach(([key, value]) => {
          traverse(value, path ? `${path}.${key}` : key);
        });
      }
    };
    traverse(obj);
    return images;
  };

  const images = detectImages(response.data);

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <span className={`font-semibold ${getStatusColor()}`}>
              {response.status} {response.statusText}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            <Clock size={16} className="inline mr-1" />
            {response.time}ms
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon size={18} className="text-purple-400" />
            <h3 className="font-semibold text-white">Images ({images.length})</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setImagePreview(img)}
                className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-600 hover:border-purple-500 transition-colors"
              >
                <img
                  src={img.data}
                  alt={`Preview ${idx + 1}`}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm">Click to enlarge</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* JSON Response */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
        <div className="bg-gray-900/50 px-4 py-2 border-b border-gray-700">
          <h3 className="font-semibold text-white">Response Body</h3>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <Highlight
            theme={themes.nightOwl}
            code={JSON.stringify(response.data, null, 2)}
            language="json"
          >
            {({ style, tokens, getLineProps, getTokenProps }) => (
              <pre style={style} className="p-4 text-sm font-mono">
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    <span className="inline-block w-8 text-gray-600 text-right mr-4">
                      {i + 1}
                    </span>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      </div>

      {/* Image Preview Modal */}
      {imagePreview && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setImagePreview(null)}
        >
          <div className="max-w-4xl max-h-[90vh] overflow-auto">
            <img
              src={imagePreview.data}
              alt="Preview"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseViewer;
