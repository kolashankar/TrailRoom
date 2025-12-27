import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Power, PowerOff, Send, Check, X, ExternalLink } from 'lucide-react';
import axios from 'axios';

const Webhooks = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [supportedEvents, setSupportedEvents] = useState([]);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchWebhooks();
    fetchSupportedEvents();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/v1/webhooks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWebhooks(response.data);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportedEvents = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/v1/webhooks/events/supported`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSupportedEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching supported events:', error);
    }
  };

  const fetchDeliveries = async (webhookId) => {
    try {
      const response = await axios.get(`${backendUrl}/api/v1/webhooks/${webhookId}/deliveries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeliveries(response.data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    }
  };

  const createWebhook = async (data) => {
    try {
      await axios.post(`${backendUrl}/api/v1/webhooks`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWebhooks();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating webhook:', error);
      alert('Failed to create webhook: ' + (error.response?.data?.detail || error.message));
    }
  };

  const toggleWebhook = async (webhookId, isActive) => {
    try {
      await axios.put(
        `${backendUrl}/api/v1/webhooks/${webhookId}`,
        { is_active: !isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchWebhooks();
    } catch (error) {
      console.error('Error toggling webhook:', error);
    }
  };

  const deleteWebhook = async (webhookId) => {
    if (!window.confirm('Are you sure you want to delete this webhook?')) return;
    
    try {
      await axios.delete(`${backendUrl}/api/v1/webhooks/${webhookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
    }
  };

  const testWebhook = async (webhookId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/v1/webhooks/${webhookId}/test`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Test webhook sent! Check the deliveries tab.');
      if (selectedWebhook?.id === webhookId) {
        fetchDeliveries(webhookId);
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      alert('Failed to test webhook');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Webhooks</h1>
          <p className="text-gray-400 mt-2">
            Receive real-time notifications for events
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          Create Webhook
        </button>
      </div>

      {/* Webhooks List */}
      <div className="grid gap-4">
        {webhooks.length === 0 ? (
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-12 text-center">
            <p className="text-gray-400 mb-4">No webhooks configured yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Create Your First Webhook
            </button>
          </div>
        ) : (
          webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="bg-gray-800/50 rounded-lg border border-gray-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{webhook.name}</h3>
                    {webhook.is_active ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Active</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">Inactive</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm font-mono mb-3">{webhook.url}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {webhook.events.map((event, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                  {webhook.last_triggered_at && (
                    <p className="text-xs text-gray-500">
                      Last triggered: {new Date(webhook.last_triggered_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => testWebhook(webhook.id)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    title="Send test event"
                  >
                    <Send size={16} />
                  </button>
                  <button
                    onClick={() => toggleWebhook(webhook.id, webhook.is_active)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                    title={webhook.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {webhook.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedWebhook(webhook);
                      fetchDeliveries(webhook.id);
                    }}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                    title="View deliveries"
                  >
                    <ExternalLink size={16} />
                  </button>
                  <button
                    onClick={() => deleteWebhook(webhook.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    title="Delete webhook"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Webhook Modal */}
      {showCreateModal && (
        <CreateWebhookModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={createWebhook}
          supportedEvents={supportedEvents}
        />
      )}

      {/* Deliveries Modal */}
      {selectedWebhook && (
        <DeliveriesModal
          webhook={selectedWebhook}
          deliveries={deliveries}
          onClose={() => setSelectedWebhook(null)}
        />
      )}
    </div>
  );
};

const CreateWebhookModal = ({ onClose, onSubmit, supportedEvents }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleEvent = (event) => {
    if (formData.events.includes(event)) {
      setFormData({ ...formData, events: formData.events.filter(e => e !== event) });
    } else {
      setFormData({ ...formData, events: [...formData.events, event] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-lg w-full p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Create Webhook</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com/webhook"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Events</label>
            <div className="space-y-2">
              {supportedEvents.map((event) => (
                <label key={event} className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event)}
                    onChange={() => toggleEvent(event)}
                    className="rounded"
                  />
                  {event}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeliveriesModal = ({ webhook, deliveries, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full p-6 max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Delivery History - {webhook.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-3">
          {deliveries.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No deliveries yet</p>
          ) : (
            deliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="bg-gray-900/50 rounded-lg border border-gray-700 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-400 font-mono text-sm">{delivery.event_type}</span>
                  <div className="flex items-center gap-2">
                    {delivery.status === 'success' ? (
                      <Check className="text-green-400" size={16} />
                    ) : delivery.status === 'failed' ? (
                      <X className="text-red-400" size={16} />
                    ) : (
                      <span className="text-yellow-400 text-sm">Pending</span>
                    )}
                    {delivery.response_code && (
                      <span className="text-gray-400 text-sm">HTTP {delivery.response_code}</span>
                    )}
                  </div>
                </div>
                <p className="text-gray-400 text-xs mb-2">
                  {new Date(delivery.created_at).toLocaleString()} • Attempts: {delivery.attempts}/{delivery.max_attempts}
                </p>
                {delivery.error_message && (
                  <p className="text-red-400 text-sm mt-2">Error: {delivery.error_message}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Webhooks;
