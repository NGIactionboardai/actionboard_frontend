'use client';

import { useState, useEffect } from 'react';
import { X, Hash, Search, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function DepartmentFormModal({
  mappingId,
  workspaceId,
  department, // null → create, object → edit
  onSuccess,
  onCancel,
}) {
  const isEdit = !!department;

  const [name, setName] = useState(department?.department_name || '');
  const [description, setDescription] = useState(department?.department_description || '');
  const [channelId, setChannelId] = useState(department?.channel_id || '');
  const [channelName, setChannelName] = useState(department?.channel_name || '');

  const [channels, setChannels] = useState([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [channelSearch, setChannelSearch] = useState('');
  const [showChannelPicker, setShowChannelPicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChannels = async () => {
      if (!workspaceId) return;
      setChannelsLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE_URL}/integrations/slack/workspaces/${workspaceId}/channels/`
        );
        setChannels(res.data || []);
      } catch {
        // non-fatal — channels just won't be listed
      } finally {
        setChannelsLoading(false);
      }
    };
    fetchChannels();
  }, [workspaceId]);

  const filteredChannels = channels.filter((ch) =>
    ch.name.toLowerCase().includes(channelSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Department name is required.');
      return;
    }
    if (!channelId) {
      setError('Please select a Slack channel.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload = {
        department_name: name.trim(),
        department_description: description.trim(),
        channel_id: channelId,
        channel_name: channelName,
      };
      if (isEdit) {
        await axios.patch(
          `${API_BASE_URL}/integrations/slack/mappings/${mappingId}/departments/${department.id}/`,
          payload
        );
        toast.success('Department updated.');
      } else {
        await axios.post(
          `${API_BASE_URL}/integrations/slack/mappings/${mappingId}/departments/`,
          payload
        );
        toast.success('Department added.');
      }
      onSuccess();
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data?.message ||
        data?.detail ||
        data?.department_name?.[0] ||
        data?.non_field_errors?.[0] ||
        'Something went wrong. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const selectChannel = (ch) => {
    setChannelId(ch.id);
    setChannelName(ch.name);
    setShowChannelPicker(false);
    setChannelSearch('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-[520px] max-w-full rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Department' : 'Add Department'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">

          {/* Department Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineering, Marketing, Sales"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this department…"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
            />
          </div>

          {/* Channel selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slack Channel <span className="text-red-500">*</span>
            </label>

            {channelId ? (
              <div className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2">
                <span className="flex items-center gap-1.5 text-sm text-gray-800">
                  <Hash size={13} className="text-gray-400" />
                  {channelName}
                </span>
                <button
                  onClick={() => {
                    setChannelId('');
                    setChannelName('');
                    setShowChannelPicker(true);
                  }}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowChannelPicker(!showChannelPicker)}
                className="w-full flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 text-left"
              >
                <Hash size={13} />
                Select a channel…
              </button>
            )}

            {showChannelPicker && (
              <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
                  <Search size={13} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={channelSearch}
                    onChange={(e) => setChannelSearch(e.target.value)}
                    placeholder="Search channels…"
                    className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
                    autoFocus
                  />
                </div>
                <div className="max-h-44 overflow-y-auto">
                  {channelsLoading ? (
                    <div className="py-5 text-center text-sm text-gray-400">
                      <Loader2 size={16} className="animate-spin inline mr-1" />
                      Loading…
                    </div>
                  ) : filteredChannels.length === 0 ? (
                    <div className="py-5 text-center text-sm text-gray-400">
                      {channels.length === 0 ? 'No channels found.' : 'No channels match.'}
                    </div>
                  ) : (
                    filteredChannels.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => selectChannel(ch)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50"
                      >
                        <span className="flex items-center gap-1.5 text-gray-800">
                          <Hash size={12} className="text-gray-400" />
                          {ch.name}
                        </span>
                        {ch.is_private && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            private
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full border text-gray-600 hover:bg-gray-100 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-full text-white text-sm shadow
              bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]
              hover:from-[#080aa8] hover:to-[#6d0668]
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? isEdit ? 'Saving…' : 'Adding…'
              : isEdit ? 'Save Changes' : 'Add Department'}
          </button>
        </div>
      </div>
    </div>
  );
}
