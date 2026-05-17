'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X, Send, RefreshCw, Hash, AlertTriangle,
  CheckCircle2, XCircle, Loader2, CheckCheck, Sparkles,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ConfidenceBadge from './ConfidenceBadge';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ActionItemRoutingModal({ meetingId, source = 'normal', onClose }) {
  // Fetch state
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Three distinct states from the API
  const [routingPrepared, setRoutingPrepared] = useState(null); // null | false | true
  const [suggestions, setSuggestions] = useState([]);

  // Prepare state (POST endpoint)
  const [preparing, setPreparing] = useState(false);

  // Selection + send
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState(null); // { sent: [], failed: [] }

  // Per-suggestion local overrides: { [id]: { channel_id, channel_name, is_manual } }
  const [overrides, setOverrides] = useState({});
  // Currently patching approval for suggestion id
  const [approving, setApproving] = useState(null);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    setSendResults(null);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/integrations/slack/routing/meetings/${meetingId}/suggestions/?source=${source}`
      );
      const prepared = res.data?.routing_prepared ?? false;
      const items = res.data?.suggestions ?? [];

      setRoutingPrepared(prepared);
      setSuggestions(items);

      // Pre-select all non-sent items
      const ids = new Set(items.filter((s) => s.routing_status !== 'sent').map((s) => s.id));
      setSelectedIds(ids);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to load routing suggestions.';
      setFetchError(typeof msg === 'string' ? msg : 'Failed to load routing suggestions.');
    } finally {
      setLoading(false);
    }
  }, [meetingId, source]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // ── Prepare (on-demand generation) ───────────────────────────────────────

  const handlePrepareRouting = async () => {
    setPreparing(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/integrations/slack/routing/meetings/${meetingId}/prepare/?source=${source}`
      );
      const items = res.data?.suggestions ?? [];
      setRoutingPrepared(true);
      setSuggestions(items);

      const ids = new Set(items.filter((s) => s.routing_status !== 'sent').map((s) => s.id));
      setSelectedIds(ids);
    } catch (err) {
      const status = err.response?.status;
      if (status === 400) {
        toast.error(
          err.response?.data?.detail ||
          'This organisation is not mapped to a Slack workspace.'
        );
      } else if (status === 403) {
        toast.error('Only org admins can generate Slack routing.');
      } else if (status === 404) {
        toast.error('Meeting not found.');
      } else {
        toast.error('Routing preparation failed. Please try again.');
      }
    } finally {
      setPreparing(false);
    }
  };

  // ── Selection ─────────────────────────────────────────────────────────────

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectableIds = suggestions.filter((s) => s.routing_status !== 'sent').map((s) => s.id);
  const allSelected = selectableIds.length > 0 && selectedIds.size === selectableIds.length;

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(selectableIds));
  };

  // ── Approve ───────────────────────────────────────────────────────────────

  const handleApprove = async (id) => {
    setApproving(id);
    try {
      const override = overrides[id] || {};
      await axios.patch(`${API_BASE_URL}/integrations/slack/routing/suggestions/${id}/`, {
        is_approved: true,
        ...(override.channel_id
          ? { manual_channel_id: override.channel_id, manual_channel_name: override.channel_name }
          : {}),
      });
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, routing_status: 'approved' } : s))
      );
    } catch {
      toast.error('Could not approve this item.');
    } finally {
      setApproving(null);
    }
  };

  // ── Channel override ──────────────────────────────────────────────────────

  const handleChannelOverride = async (id, channelId, channelName) => {
    setOverrides((prev) => ({
      ...prev,
      [id]: { channel_id: channelId, channel_name: channelName, is_manual: true },
    }));
    try {
      await axios.patch(`${API_BASE_URL}/integrations/slack/routing/suggestions/${id}/`, {
        manual_channel_id: channelId,
        manual_channel_name: channelName,
      });
    } catch {
      // silent — user sees the local override badge regardless
    }
  };

  // ── Send ──────────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (selectedIds.size === 0) return;
    setSending(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/integrations/slack/routing/send/`, {
        meeting_id: meetingId,
        suggestion_ids: [...selectedIds],
      });
      const results = res.data || {};
      setSendResults(results);

      const sentIds = new Set((results.sent || []).map((s) => (typeof s === 'object' ? s.id : s)));
      setSuggestions((prev) =>
        prev.map((s) => (sentIds.has(s.id) ? { ...s, routing_status: 'sent' } : s))
      );
      setSelectedIds(new Set());

      if ((results.sent || []).length > 0) {
        toast.success(
          `${results.sent.length} item${results.sent.length !== 1 ? 's' : ''} sent to Slack.`
        );
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to send items.';
      toast.error(typeof msg === 'string' ? msg : 'Failed to send items.');
    } finally {
      setSending(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  // No department mappings = every suggestion lacks a department name
  const hasNoDeptMappings =
    suggestions.length > 0 &&
    suggestions.every((s) => !s.suggested_department_name && !s.suggested_department);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-[800px] max-w-full rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Send Action Items to Slack</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Review AI-suggested routing, then send selected items.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Loading ── */}
          {loading && (
            <div className="py-16 flex flex-col items-center gap-3 text-gray-400">
              <Loader2 size={28} className="animate-spin" />
              <span className="text-sm">Loading suggestions…</span>
            </div>
          )}

          {/* ── Fetch error ── */}
          {!loading && fetchError && (
            <div className="px-6 py-10 text-center space-y-3">
              <p className="text-sm text-red-600">{fetchError}</p>
              <button
                onClick={fetchSuggestions}
                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
              >
                <RefreshCw size={13} /> Try again
              </button>
            </div>
          )}

          {/* ── Routing not yet generated ── */}
          {!loading && !fetchError && routingPrepared === false && (
            <div className="px-6 py-14 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                <Sparkles size={22} className="text-indigo-500" />
              </div>
              <div>
                <p className="text-gray-900 font-medium">Routing not generated yet</p>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  Generate AI-suggested routing to map action items to the right Slack
                  channels based on your department configuration.
                </p>
              </div>
              <button
                onClick={handlePrepareRouting}
                disabled={preparing}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm shadow
                  bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]
                  hover:from-[#080aa8] hover:to-[#6d0668]
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {preparing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {preparing ? 'Generating routing…' : 'Generate Slack Routing'}
              </button>
              {preparing && (
                <p className="text-xs text-gray-400">This may take a few seconds…</p>
              )}
            </div>
          )}

          {/* ── Prepared but no action items ── */}
          {!loading && !fetchError && routingPrepared === true && suggestions.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500 text-sm">This meeting has no action items to route.</p>
            </div>
          )}

          {/* ── Ready to review ── */}
          {!loading && !fetchError && routingPrepared === true && suggestions.length > 0 && (
            <div className="px-6 py-4 space-y-4">

              {/* No-dept warning banner */}
              {hasNoDeptMappings && (
                <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">No department mappings found</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      You can still route items manually by overriding channels below. Configure
                      department mappings in Integrations → Slack for automatic routing.
                    </p>
                  </div>
                </div>
              )}

              {/* Select-all row */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  Select all ({selectableIds.length})
                </label>
                <span className="text-xs text-gray-400">{selectedIds.size} selected</span>
              </div>

              {/* Item rows */}
              <div className="space-y-3">
                {suggestions.map((s) => (
                  <ActionItemRow
                    key={s.id}
                    suggestion={s}
                    selected={selectedIds.has(s.id)}
                    override={overrides[s.id]}
                    approving={approving === s.id}
                    onToggle={() => toggleSelect(s.id)}
                    onApprove={() => handleApprove(s.id)}
                    onChannelOverride={(chId, chName) => handleChannelOverride(s.id, chId, chName)}
                  />
                ))}
              </div>

              {/* Send results summary */}
              {sendResults && (
                <div className="border border-gray-200 rounded-xl p-4 space-y-2 bg-gray-50">
                  {(sendResults.sent || []).length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle2 size={15} />
                      {sendResults.sent.length} item{sendResults.sent.length !== 1 ? 's' : ''} sent
                      successfully.
                    </div>
                  )}
                  {(sendResults.failed || []).length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle size={15} />
                      {sendResults.failed.length} item{sendResults.failed.length !== 1 ? 's' : ''}{' '}
                      failed.{' '}
                      <button onClick={handleSend} className="underline hover:no-underline ml-1">
                        Retry failed
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — only shown when there are items to act on */}
        {!loading && !fetchError && routingPrepared === true && suggestions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border text-gray-600 hover:bg-gray-100 text-sm"
            >
              Close
            </button>
            <button
              onClick={handleSend}
              disabled={sending || selectedIds.size === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm shadow
                bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]
                hover:from-[#080aa8] hover:to-[#6d0668]
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {sending ? 'Sending…' : `Send Selected (${selectedIds.size})`}
            </button>
          </div>
        )}

        {/* Footer for non-review states: just a close button */}
        {!loading && (routingPrepared === false || (routingPrepared === true && suggestions.length === 0)) && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border text-gray-600 hover:bg-gray-100 text-sm"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Per-item row ─────────────────────────────────────────────────────────────

function ActionItemRow({ suggestion, selected, override, approving, onToggle, onApprove, onChannelOverride }) {
  const [showOverrideInput, setShowOverrideInput] = useState(false);
  const [overrideInput, setOverrideInput] = useState('');

  const isSent = suggestion.routing_status === 'sent';
  const isApproved = suggestion.routing_status === 'approved';
  const needsReview = suggestion.requires_manual_review;
  const confidence = suggestion.confidence_score;
  const isLowConfidence = typeof confidence === 'number' && confidence < 0.6;

  // Use final_channel_name if the item was already sent/modified, else suggested
  const displayChannel =
    override?.channel_name ||
    suggestion.final_channel_name ||
    suggestion.suggested_channel_name;

  const isManualOverride = override?.is_manual || suggestion.is_user_modified;

  const rowClass = isSent
    ? 'border-green-200 bg-green-50/30'
    : needsReview || isLowConfidence
    ? 'border-amber-200 bg-amber-50/20'
    : 'border-gray-200 bg-white';

  const commitOverride = () => {
    const val = overrideInput.trim().replace(/^#/, '');
    if (val) onChannelOverride(null, val);
    setShowOverrideInput(false);
    setOverrideInput('');
  };

  return (
    <div className={`border rounded-xl p-4 ${rowClass}`}>
      <div className="flex items-start gap-3">

        {/* Checkbox / sent icon */}
        {!isSent ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
          />
        ) : (
          <CheckCheck size={16} className="mt-0.5 text-green-500 flex-shrink-0" />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Task text + status badges */}
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium leading-snug ${isSent ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
              {suggestion.action_item_text || suggestion.task_text || suggestion.text || '—'}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0">
              {isSent && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                  Sent
                </span>
              )}
              {isApproved && !isSent && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                  Approved
                </span>
              )}
              {needsReview && !isSent && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                  Needs review
                </span>
              )}
            </div>
          </div>

          {/* Assignee */}
          {(suggestion.assigned_to || suggestion.assignee) && (
            <p className="text-xs text-gray-500 mt-0.5">
              Assignee: {suggestion.assigned_to || suggestion.assignee}
            </p>
          )}

          {/* Meta chips */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {typeof confidence === 'number' && <ConfidenceBadge confidence={confidence} />}

            {/* Department name (backend returns the name field, id is internal) */}
            {(suggestion.suggested_department_name || suggestion.final_department_name) && (
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                {suggestion.final_department_name || suggestion.suggested_department_name}
              </span>
            )}

            {displayChannel && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                <Hash size={11} className="text-gray-400" />
                {displayChannel}
                {isManualOverride && (
                  <span className="ml-1 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">
                    Manual override
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Channel override control */}
          {!isSent && (
            <div className="mt-2">
              {showOverrideInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={overrideInput}
                    onChange={(e) => setOverrideInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && commitOverride()}
                    placeholder="Channel name (without #)"
                    className="flex-1 border border-gray-300 rounded-lg px-2.5 py-1 text-xs
                      focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={commitOverride}
                    className="text-xs px-2.5 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Set
                  </button>
                  <button
                    onClick={() => setShowOverrideInput(false)}
                    className="text-xs px-2.5 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setOverrideInput(displayChannel || '');
                    setShowOverrideInput(true);
                  }}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  {isManualOverride ? 'Change override' : 'Override channel'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Approve button */}
        {!isSent && !isApproved && (
          <button
            onClick={onApprove}
            disabled={approving}
            className="flex-shrink-0 text-xs px-2.5 py-1 border border-gray-300 rounded-full
              hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
          >
            {approving && <Loader2 size={12} className="animate-spin" />}
            Approve
          </button>
        )}
      </div>
    </div>
  );
}
