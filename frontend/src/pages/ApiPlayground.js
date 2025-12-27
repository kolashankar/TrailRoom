import React, { useState } from 'react';
import { Play, Settings, Code, Send } from 'lucide-react';
import CodeGenerator from '../components/CodeGenerator';
import ResponseViewer from '../components/ResponseViewer';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ApiPlayground = () => {
  const { user } = useAuth();
  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/v1/tryon');
  const [method, setMethod] = useState('POST');
  const [headers, setHeaders] = useState({});
  const [body, setBody] = useState('{\n  "mode": "top_only",\n  "person_image": "base64...",\n  "clothing_image": "base64..."\n}');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const endpoints = [
    { path: '/api/v1/tryon', method: 'POST', description: 'Create try-on job' },
    { path: '/api/v1/tryon/:jobId', method: 'GET', description: 'Get job status' },
    { path: '/api/v1/tryon/history/list', method: 'GET', description: 'Get job history' },
    { path: '/api/v1/tryon/:jobId', method: 'DELETE', description: 'Delete job' },
    { path: '/api/v1/credits', method: 'GET', description: 'Get credit balance' },
    { path: '/api/v1/webhooks', method: 'GET', description: 'List webhooks' },
    { path: '/api/v1/webhooks', method: 'POST', description: 'Create webhook' },
    { path: '/api/v1/analytics/usage', method: 'GET', description: 'Get usage stats' },
  ];

  const handleEndpointChange = (endpoint) => {
    const selected = endpoints.find(e => e.path === endpoint);
    setSelectedEndpoint(endpoint);
    setMethod(selected?.method || 'GET');
    
    // Set default body based on endpoint
    if (endpoint === '/api/v1/tryon' && selected?.method === 'POST') {
      setBody('{\n  "mode": "top_only",\n  "person_image": "base64...",\n  "clothing_image": "base64..."\n}');
    } else if (endpoint === '/api/v1/webhooks' && selected?.method === 'POST') {
      setBody('{\n  "url": "https://example.com/webhook",\n  "name": "My Webhook",\n  "events": ["tryon.completed"]\n}');
    } else {
      setBody('');
    }
  };

  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);

    const startTime = Date.now();
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
    
    try {
      const config = {
        method: method.toLowerCase(),
        url: `${backendUrl}${selectedEndpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        }
      };

      // Add auth token
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add body for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        config.data = JSON.parse(body);
      }

      const res = await axios(config);
      const endTime = Date.now();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data: res.data,
        time: endTime - startTime
      });
    } catch (error) {
      const endTime = Date.now();
      setResponse({
        status: error.response?.status || 500,
        statusText: error.response?.statusText || 'Error',
        data: error.response?.data || { error: error.message },
        time: endTime - startTime
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Code className="text-purple-400" />
            API Playground
          </h1>
          <p className="text-gray-400 mt-2">
            Test API endpoints and generate code snippets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Request Builder */}
        <div className="space-y-4">
          {/* Endpoint Selector */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Endpoint
            </label>
            <select
              value={selectedEndpoint}
              onChange={(e) => handleEndpointChange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
            >
              {endpoints.map((endpoint) => (
                <option key={`${endpoint.method}-${endpoint.path}`} value={endpoint.path}>
                  {endpoint.method} {endpoint.path} - {endpoint.description}
                </option>
              ))}
            </select>
          </div>

          {/* Method and URL */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Request
            </label>
            <div className="flex gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none font-semibold"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>PATCH</option>
                <option>DELETE</option>
              </select>
              <input
                type="text"
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Request Body */}
          {['POST', 'PUT', 'PATCH'].includes(method) && (
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Request Body (JSON)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none font-mono text-sm"
                rows={10}
                placeholder="Enter JSON body..."
              />
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={sendRequest}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Sending...
              </>
            ) : (
              <>
                <Send size={20} />
                Send Request
              </>
            )}
          </button>
        </div>

        {/* Right Panel - Response */}
        <div className="space-y-4">
          <ResponseViewer response={response} loading={loading} />
        </div>
      </div>

      {/* Code Generation */}
      <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Code size={24} className="text-purple-400" />
          Code Snippets
        </h2>
        <CodeGenerator
          endpoint={selectedEndpoint}
          method={method}
          headers={headers}
          body={body}
          apiKey={apiKey}
        />
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="font-semibold text-blue-400 mb-2">💡 Pro Tip</h3>
        <p className="text-gray-300 text-sm">
          All requests are authenticated using your session token. You can also use API keys
          for programmatic access. Generate an API key from your settings page.
        </p>
      </div>
    </div>
  );
};

export default ApiPlayground;
