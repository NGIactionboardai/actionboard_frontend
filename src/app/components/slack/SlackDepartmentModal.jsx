'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Edit2, Sparkles, AlertTriangle, Hash, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DepartmentFormModal from './DepartmentFormModal';
import ConfirmModal from '@/app/components/integrations/ConfirmModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function SlackDepartmentModal({ mapping, workspaceId, onClose }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionEdits, setSuggestionEdits] = useState({});
  const [savingSuggestion, setSavingSuggestion] = useState(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/integrations/slack/mappings/${mapping.id}/departments/`
      );

      setDepartments(res.data?.department_mappings || []);
    } catch {
      toast.error('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  }, [mapping.id]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(
        `${API_BASE_URL}/integrations/slack/mappings/${mapping.id}/departments/${deleteTarget.id}/`
      );
      toast.success('Department removed.');
      setDepartments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    } catch {
      toast.error('Failed to remove department.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSuggest = async () => {
    setSuggestionsLoading(true);
    setSuggestions([]);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/integrations/slack/mappings/${mapping.id}/department-suggestions/`
      );
      const raw = res.data || [];

      // Stamp each suggestion with a stable key so index-shifts can't corrupt edits
      const keyed = raw.map((s, i) => ({ ...s, _key: `sug_${Date.now()}_${i}` }));
      setSuggestions(keyed);

      const edits = {};
      keyed.forEach((s) => {
        edits[s._key] = {
          department_name: s.department_name || '',
          department_description: s.department_description || s.description || '',
          channel_id: s.suggested_channel_id || '',
          channel_name: s.suggested_channel_name || '',
        };
      });
      setSuggestionEdits(edits);

      if (keyed.length === 0) {
        toast('No suggestions available right now.', { icon: 'ℹ️' });
      }
    } catch {
      toast.error('Could not load suggestions. Please try again.');
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleAddSuggestion = async (key) => {
    const edit = suggestionEdits[key] || {};
    if (!edit.department_name?.trim() || !edit.channel_id) {
      toast.error('Department name and channel are required.');
      return;
    }
    setSavingSuggestion(key);
    try {
      await axios.post(
        `${API_BASE_URL}/integrations/slack/mappings/${mapping.id}/departments/`,
        {
          department_name: edit.department_name.trim(),
          department_description: edit.department_description?.trim() || '',
          channel_id: edit.channel_id,
          channel_name: edit.channel_name,
        }
      );
      toast.success(`"${edit.department_name}" added.`);
      removeSuggestion(key);
      fetchDepartments();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.response?.data?.department_name?.[0] ||
        'Could not add department.';
      toast.error(typeof msg === 'string' ? msg : 'Could not add department.');
    } finally {
      setSavingSuggestion(null);
    }
  };

  const removeSuggestion = (key) => {
    setSuggestions((prev) => prev.filter((s) => s._key !== key));
    setSuggestionEdits((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateSuggestionEdit = (key, field, value) => {
    setSuggestionEdits((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value },
    }));
  };

  const hasDepts = departments.length > 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white w-[680px] max-w-full rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Configure Departments</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                <span className="font-medium text-gray-700">{mapping.organisation_name}</span>
                {' → '}
                <span className="font-medium text-gray-700">{mapping.workspace_team_name}</span>
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {loading
                  ? 'Loading…'
                  : `${departments.length} department${departments.length !== 1 ? 's' : ''} configured`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSuggest}
                  disabled={suggestionsLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full
                    border border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-60"
                >
                  {suggestionsLoading
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Sparkles size={13} />}
                  {suggestionsLoading ? 'Analysing…' : 'Suggest from Channels'}
                </button>
                <button
                  onClick={() => { setEditTarget(null); setShowForm(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full text-white shadow
                    bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]
                    hover:from-[#080aa8] hover:to-[#6d0668]"
                >
                  <Plus size={13} />
                  Add Department
                </button>
              </div>
            </div>

            {/* No-departments warning */}
            {!loading && !hasDepts && (
              <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">No departments configured</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Action items from meetings won&apos;t be routed automatically without department
                    mappings. Use &quot;Suggest from Channels&quot; or add one manually.
                  </p>
                </div>
              </div>
            )}

            {/* Department list */}
            {loading ? (
              <div className="py-10 text-center text-gray-400 text-sm">Loading departments…</div>
            ) : hasDepts ? (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {departments.map((dept) => (
                    <DepartmentRow
                      key={dept.id}
                      dept={dept}
                      onEdit={() => { setEditTarget(dept); setShowForm(true); }}
                      onDelete={() => setDeleteTarget(dept)}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {/* AI suggestions */}
            {suggestions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-purple-500" />
                  <h3 className="text-sm font-semibold text-gray-700">AI Suggestions</h3>
                  <span className="text-xs text-gray-400">Review and add the ones you want</span>
                </div>
                <div className="space-y-3">
                  {suggestions.map((s) => (
                    <SuggestionRow
                      key={s._key}
                      suggestion={s}
                      edit={suggestionEdits[s._key] || {}}
                      saving={savingSuggestion === s._key}
                      onChange={(field, value) => updateSuggestionEdit(s._key, field, value)}
                      onAdd={() => handleAddSuggestion(s._key)}
                      onSkip={() => removeSuggestion(s._key)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border text-gray-600 hover:bg-gray-100 text-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Department form — z-[60] to layer above this modal */}
      {showForm && (
        <DepartmentFormModal
          mappingId={mapping.id}
          workspaceId={workspaceId}
          department={editTarget}
          onSuccess={() => {
            setShowForm(false);
            setEditTarget(null);
            fetchDepartments();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditTarget(null);
          }}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmModal
          title="Remove Department"
          description={`Remove "${deleteTarget.department_name}"? Action items for this department won't be routed automatically.`}
          confirmText={deleting ? 'Removing…' : 'Remove'}
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}

// ── Department row ──────────────────────────────────────────────────────────

function DepartmentRow({ dept, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-gray-900">{dept.department_name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            dept.is_active !== false
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {dept.is_active !== false ? 'Active' : 'Inactive'}
          </span>
        </div>
        {dept.department_description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-sm">
            {dept.department_description}
          </p>
        )}
        {dept.channel_name && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-0.5">
            <Hash size={11} />
            {dept.channel_name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          title="Edit"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Suggestion row ──────────────────────────────────────────────────────────

function SuggestionRow({ suggestion, edit, saving, onChange, onAdd, onSkip }) {
  return (
    <div className="border border-purple-100 bg-purple-50/40 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
          AI Suggestion
        </span>
        <button
          onClick={onSkip}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Skip
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Department Name
          </label>
          <input
            type="text"
            value={edit.department_name || ''}
            onChange={(e) => onChange('department_name', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm
              focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Slack Channel
          </label>
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-sm">
            <Hash size={12} className="text-gray-400 flex-shrink-0" />
            <span className="text-gray-700 truncate">{edit.channel_name || '—'}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Description
        </label>
        <textarea
          value={edit.department_description || ''}
          onChange={(e) => onChange('department_description', e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm
            focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onAdd}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full text-white shadow
            bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]
            hover:from-[#080aa8] hover:to-[#6d0668]
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
          {saving ? 'Adding…' : 'Add Department'}
        </button>
      </div>
    </div>
  );
}
