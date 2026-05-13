'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Building2, Hash, Link2, Plus, Search, Trash2, Unlink, Wifi, WifiOff, X } from 'lucide-react';

import {
  fetchSlackWorkspaces,
  fetchSlackMappings,
  startSlackOAuth,
  disconnectSlackWorkspace,
  createSlackMapping,
  removeSlackMapping,
  updateSlackChannel,
  selectSlackWorkspaces,
  selectSlackMappings,
  selectSlackWorkspacesLoading,
  selectSlackMappingsLoading,
  selectSlackActionLoading,
} from '@/redux/integrations/slackSlice';

import {
  selectUserOrganizations,
  getUserOrganizations,
} from '@/redux/auth/organizationSlice';

import ConfirmModal from '@/app/components/integrations/ConfirmModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ======================
// PAGE
// ======================

export default function SlackIntegrationPage() {
  const dispatch = useDispatch();

  const workspaces = useSelector(selectSlackWorkspaces);
  const mappings = useSelector(selectSlackMappings);
  const workspacesLoading = useSelector(selectSlackWorkspacesLoading);
  const mappingsLoading = useSelector(selectSlackMappingsLoading);
  const actionLoading = useSelector(selectSlackActionLoading);
  const userOrgs = useSelector(selectUserOrganizations);

  // Disconnect workspace confirm
  const [disconnectTarget, setDisconnectTarget] = useState(null); // { id, name }

  // Remove mapping confirm
  const [removeTarget, setRemoveTarget] = useState(null); // { id, orgName }

  // Create mapping modal
  const [showCreateMapping, setShowCreateMapping] = useState(false);
  const [createOrgId, setCreateOrgId] = useState('');
  const [createWorkspaceId, setCreateWorkspaceId] = useState('');
  const [createError, setCreateError] = useState('');

  // Change channel modal
  const [channelTarget, setChannelTarget] = useState(null); // { mapping, workspaceId }
  const [channels, setChannels] = useState([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [channelSearch, setChannelSearch] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(null); // { id, name }

  // Load data + check URL params on mount
  useEffect(() => {
    dispatch(fetchSlackWorkspaces());
    dispatch(fetchSlackMappings());
    if (!userOrgs.length) {
      dispatch(getUserOrganizations());
    }

    const params = new URLSearchParams(window.location.search);
    const slackParam = params.get('slack');
    if (slackParam === 'connected') {
      toast.success('Slack workspace connected successfully.');
      window.history.replaceState({}, '', '/integrations/slack');
    } else if (slackParam === 'auth-denied') {
      toast.error('Slack connection was cancelled.');
      window.history.replaceState({}, '', '/integrations/slack');
    } else if (slackParam === 'token-error') {
      toast.error('Slack connection failed. Please try again.');
      window.history.replaceState({}, '', '/integrations/slack');
    }
  }, [dispatch]);

  // ---- Handlers ----

  const handleConnect = () => {
    dispatch(startSlackOAuth());
  };

  const handleDisconnect = async () => {
    if (!disconnectTarget) return;
    const res = await dispatch(disconnectSlackWorkspace(disconnectTarget.id));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Slack workspace disconnected.');
    } else {
      toast.error('Failed to disconnect workspace. Please try again.');
    }
    setDisconnectTarget(null);
  };

  const openCreateMappingModal = async () => {
    setCreateError('');
    setCreateOrgId('');
    setCreateWorkspaceId('');
    // Refresh mappings first so availableOrgs is never stale
    await dispatch(fetchSlackMappings());
    console.log('[Slack] userOrgs from Redux:', userOrgs);
    setShowCreateMapping(true);
  };

  const handleCreateMapping = async () => {
    if (!createOrgId || !createWorkspaceId) return;
    setCreateError('');
    console.log('[Slack] mapping payload → org_id:', createOrgId, 'workspace_id:', parseInt(createWorkspaceId, 10));
    const res = await dispatch(
      createSlackMapping({ org_id: createOrgId, workspace_id: parseInt(createWorkspaceId, 10) })
    );
    if (res.meta.requestStatus === 'fulfilled') {
      const channelName = res.payload?.default_channel_name || '';
      toast.success(`Slack channel #${channelName} created and mapped.`);
      setShowCreateMapping(false);
      setCreateOrgId('');
      setCreateWorkspaceId('');
    } else {
      const status = res.payload?.status;
      const msg = res.payload?.message || '';

      if (status === 400 || msg.toLowerCase().includes('already has a slack workspace mapped')) {
        setCreateError('This organisation already has a Slack workspace mapped.');
        // Sync Redux so the already-mapped org disappears from the dropdown
        dispatch(fetchSlackMappings());
      } else {
        toast.error('Could not create Slack channel. Please try again.');
        setShowCreateMapping(false);
      }
    }
  };

  const handleRemoveMapping = async () => {
    if (!removeTarget) return;
    const res = await dispatch(removeSlackMapping(removeTarget.id));
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Slack org mapping removed.');
    } else {
      toast.error('Failed to remove mapping. Please try again.');
    }
    setRemoveTarget(null);
  };

  const openChangeChannel = async (mapping) => {
    const workspace = workspaces.find((ws) => ws.team_id === mapping.workspace_team_id);
    if (!workspace) return;
    setChannelTarget({ mapping, workspaceId: workspace.id });
    setSelectedChannel(null);
    setChannelSearch('');
    setChannels([]);
    setChannelsLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/integrations/slack/workspaces/${workspace.id}/channels/`
      );
      setChannels(res.data);
    } catch {
      toast.error('Failed to load channels. Please try again.');
      setChannelTarget(null);
    } finally {
      setChannelsLoading(false);
    }
  };

  const handleUpdateChannel = async () => {
    if (!selectedChannel || !channelTarget) return;
    const res = await dispatch(
      updateSlackChannel({
        mappingId: channelTarget.mapping.id,
        channel_id: selectedChannel.id,
        channel_name: selectedChannel.name,
      })
    );
    if (res.meta.requestStatus === 'fulfilled') {
      toast.success('Default channel updated.');
      setChannelTarget(null);
    } else {
      toast.error('Failed to update channel. Please try again.');
    }
  };

  // Orgs that don't already have a mapping
  const mappedOrgIds = mappings.map((m) => m.organisation_id);
  const availableOrgs = userOrgs.filter(
    (org) => !mappedOrgIds.includes(org.organisation_id || org.id)
  );

  const filteredChannels = channels.filter((ch) =>
    ch.name.toLowerCase().includes(channelSearch.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <img
              src="/integrations/slack-logo.png"
              alt="Slack"
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Slack Integration
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Connect workspaces and map organisations to receive meeting summaries in Slack.
            </p>
          </div>
          <button
            onClick={() => (window.location.href = '/integrations')}
            className="ml-auto text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
          >
            ← Back to Integrations
          </button>
        </div>

        {/* ======================== */}
        {/* SECTION 1: Workspaces   */}
        {/* ======================== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Connected Workspaces
            </h2>
            <button
              onClick={handleConnect}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full text-white shadow
                bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]
                hover:from-[#080aa8] hover:to-[#6d0668]
                disabled:opacity-60"
            >
              <Plus size={14} />
              Connect Slack Workspace
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {workspacesLoading ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                Loading workspaces…
              </div>
            ) : workspaces.length === 0 ? (
              <div className="py-14 flex flex-col items-center gap-3 text-center px-6">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <WifiOff size={20} className="text-gray-400" />
                </div>
                <p className="text-gray-700 font-medium">No Slack workspaces connected</p>
                <p className="text-sm text-gray-500 max-w-sm">
                  Click &quot;Connect Slack Workspace&quot; to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {workspaces.map((ws) => (
                  <WorkspaceCard
                    key={ws.id}
                    workspace={ws}
                    onDisconnect={() => setDisconnectTarget({ id: ws.id, name: ws.team_name })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========================== */}
        {/* SECTION 2: Org Mappings   */}
        {/* ========================== */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Organisation Mappings
            </h2>
            {workspaces.length > 0 && (
              <button
                onClick={openCreateMappingModal}
                disabled={actionLoading || mappingsLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                <Link2 size={14} />
                Map Organisation
              </button>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {mappingsLoading ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                Loading mappings…
              </div>
            ) : workspaces.length > 0 && mappings.length === 0 ? (
              <div className="py-14 flex flex-col items-center gap-3 text-center px-6">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                  <Building2 size={20} className="text-amber-500" />
                </div>
                <p className="text-gray-700 font-medium">Workspace connected — no orgs mapped yet</p>
                <p className="text-sm text-gray-500 max-w-sm">
                  Map an organisation to start receiving meeting summaries in Slack.
                </p>
              </div>
            ) : mappings.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm px-6">
                Connect a Slack workspace first, then map your organisations here.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {mappings.map((mapping) => (
                  <MappingRow
                    key={mapping.id}
                    mapping={mapping}
                    onChangeChannel={() => openChangeChannel(mapping)}
                    onRemove={() => setRemoveTarget({ id: mapping.id, orgName: mapping.organisation_name })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ============= */}
      {/* MODALS        */}
      {/* ============= */}

      {/* Disconnect workspace confirm */}
      {disconnectTarget && (
        <ConfirmModal
          title="Disconnect Slack Workspace"
          description={`Disconnecting "${disconnectTarget.name}" will also remove all organisation mappings tied to this workspace. This cannot be undone.`}
          confirmText="Disconnect"
          danger
          onConfirm={handleDisconnect}
          onCancel={() => setDisconnectTarget(null)}
        />
      )}

      {/* Remove mapping confirm */}
      {removeTarget && (
        <ConfirmModal
          title="Remove Organisation Mapping"
          description={`Remove the Slack mapping for "${removeTarget.orgName}"? The Slack workspace will remain connected.`}
          confirmText="Remove"
          danger
          onConfirm={handleRemoveMapping}
          onCancel={() => setRemoveTarget(null)}
        />
      )}

      {/* Create mapping modal */}
      {showCreateMapping && (
        <CreateMappingModal
          workspaces={workspaces}
          availableOrgs={availableOrgs}
          orgId={createOrgId}
          workspaceId={createWorkspaceId}
          error={createError}
          loading={actionLoading}
          onOrgChange={setCreateOrgId}
          onWorkspaceChange={setCreateWorkspaceId}
          onConfirm={handleCreateMapping}
          onCancel={() => setShowCreateMapping(false)}
        />
      )}

      {/* Change channel modal */}
      {channelTarget && (
        <ChangeChannelModal
          mapping={channelTarget.mapping}
          channels={filteredChannels}
          allChannels={channels}
          channelsLoading={channelsLoading}
          channelSearch={channelSearch}
          selectedChannel={selectedChannel}
          actionLoading={actionLoading}
          onSearchChange={setChannelSearch}
          onSelect={setSelectedChannel}
          onConfirm={handleUpdateChannel}
          onCancel={() => setChannelTarget(null)}
        />
      )}
    </main>
  );
}

// ======================
// WORKSPACE CARD
// ======================

function WorkspaceCard({ workspace, onDisconnect }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center flex-shrink-0">
          <Wifi size={18} className="text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">{workspace.team_name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              workspace.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {workspace.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500">
            <span>{workspace.mapped_org_count} org{workspace.mapped_org_count !== 1 ? 's' : ''} mapped</span>
            <span>·</span>
            <span>Installed by {workspace.installed_by_email}</span>
          </div>
        </div>
      </div>
      <button
        onClick={onDisconnect}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full text-white bg-red-500 hover:bg-red-600"
      >
        <Unlink size={13} />
        Disconnect
      </button>
    </div>
  );
}

// ======================
// MAPPING ROW
// ======================

function MappingRow({ mapping, onChangeChannel, onRemove }) {
  const hasChannel = !!mapping.default_channel_id;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 hover:bg-gray-50">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900">{mapping.organisation_name}</span>
          <span className="text-gray-400">→</span>
          <span className="text-gray-700">{mapping.workspace_team_name}</span>
        </div>
        <div className="mt-1">
          {hasChannel ? (
            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
              <Hash size={13} className="text-gray-400" />
              {mapping.default_channel_name}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm text-amber-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              No default channel configured
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onChangeChannel}
          className="px-3 py-1.5 text-sm font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          {hasChannel ? 'Change Channel' : 'Set Channel'}
        </button>
        <button
          onClick={onRemove}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full text-red-600 border border-red-200 hover:bg-red-50"
        >
          <Trash2 size={13} />
          Remove
        </button>
      </div>
    </div>
  );
}

// ======================
// CREATE MAPPING MODAL
// ======================

function CreateMappingModal({
  workspaces,
  availableOrgs,
  orgId,
  workspaceId,
  error,
  loading,
  onOrgChange,
  onWorkspaceChange,
  onConfirm,
  onCancel,
}) {
  const canSubmit = orgId && workspaceId && !loading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-[480px] max-w-full rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Map Organisation to Slack</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          Select an organisation and a Slack workspace. A dedicated channel will be
          created automatically in Slack.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organisation
            </label>
            {availableOrgs.length === 0 ? (
              <p className="text-sm text-gray-400 border border-gray-200 rounded-lg px-3 py-2">
                All organisations are already mapped, or no organisations found.
              </p>
            ) : (
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                  focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                value={orgId}
                onChange={(e) => onOrgChange(e.target.value)}
              >
                <option value="">Select organisation…</option>
                {availableOrgs.map((org) => {
                  const id = org.org_id || org.id;
                  const name = org.name || org.organisation_name;
                  return (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slack Workspace
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={workspaceId}
              onChange={(e) => onWorkspaceChange(e.target.value)}
            >
              <option value="">Select workspace…</option>
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.team_name}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full border text-gray-600 hover:bg-gray-100 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canSubmit}
            className="px-4 py-2 rounded-full text-white text-sm shadow
              bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]
              hover:from-[#080aa8] hover:to-[#6d0668]
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating…' : 'Create Mapping'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================
// CHANGE CHANNEL MODAL
// ======================

function ChangeChannelModal({
  mapping,
  channels,
  allChannels,
  channelsLoading,
  channelSearch,
  selectedChannel,
  actionLoading,
  onSearchChange,
  onSelect,
  onConfirm,
  onCancel,
}) {
  const currentChannelId = mapping.default_channel_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-[520px] max-w-full rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Change Default Channel</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              For <span className="font-medium text-gray-700">{mapping.organisation_name}</span>
              {' '}in <span className="font-medium text-gray-700">{mapping.workspace_team_name}</span>
            </p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search channels…"
              value={channelSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
              autoFocus
            />
          </div>
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {channelsLoading ? (
            <div className="py-8 text-center text-gray-400 text-sm">Loading channels…</div>
          ) : allChannels.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">No channels found.</div>
          ) : channels.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">No channels match your search.</div>
          ) : (
            channels.map((ch) => {
              const isSelected = selectedChannel?.id === ch.id;
              const isCurrent = ch.id === currentChannelId;
              return (
                <button
                  key={ch.id}
                  onClick={() => onSelect(ch)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition mb-0.5
                    ${isSelected ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <Hash size={14} className={isSelected ? 'text-indigo-500' : 'text-gray-400'} />
                    <span className={`text-sm ${isSelected ? 'text-indigo-700 font-medium' : 'text-gray-800'}`}>
                      {ch.name}
                    </span>
                    {ch.is_private && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        private
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                        current
                      </span>
                    )}
                    {!ch.is_member && (
                      <span className="text-xs text-gray-400">not a member</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full border text-gray-600 hover:bg-gray-100 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!selectedChannel || actionLoading}
            className="px-4 py-2 rounded-full text-white text-sm shadow
              bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]
              hover:from-[#080aa8] hover:to-[#6d0668]
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? 'Saving…' : 'Save Channel'}
          </button>
        </div>
      </div>
    </div>
  );
}
