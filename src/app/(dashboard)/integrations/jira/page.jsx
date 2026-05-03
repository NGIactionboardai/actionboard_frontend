// src/app/(dashboard)/integrations/jira/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getJiraConnectionStatus,
  getJiraWorkspaceMappings,
  selectJiraIsConnected,
  selectJiraWorkspaces,
  selectJiraProjects,
  selectJiraLoading,
  startJiraOAuth,
  saveJiraWorkspaceMappings,
} from '@/redux/integrations/jiraSlice';

export default function JiraIntegrationPage() {
  const dispatch = useDispatch();

  const isConnected = useSelector(selectJiraIsConnected);
  const workspaces = useSelector(selectJiraWorkspaces);
  const projects = useSelector(selectJiraProjects);
  const loading = useSelector(selectJiraLoading);

  // ✅ Always fetch status
  useEffect(() => {
    dispatch(getJiraConnectionStatus());
  }, [dispatch]);

  // ✅ Fetch mappings ONLY when connected
  useEffect(() => {
    if (isConnected) {
      dispatch(getJiraWorkspaceMappings());
    }
  }, [isConnected, dispatch]);

  

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">

      <div className="flex items-center gap-4 mb-8">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <img
            src="/integrations/jira-logo.png"
            alt="Jira"
            className="w-10 h-10 object-contain"
            />
        </div>

        <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Jira Integration
            </h1>
            
        </div>
      </div>

        {!isConnected ? (
          <NotConnected dispatch={dispatch} />
        ) : (
          <ConnectedView
            workspaces={workspaces}
            projects={projects}
            loading={loading}
          />
        )}

      </div>
    </main>
  );
}


function NotConnected({ dispatch }) {
    const handleConnect = () => {
      dispatch(startJiraOAuth());
    };
  
    return (
      <div className="bg-white p-10 rounded-2xl shadow-md border border-gray-200 text-center">
  
        <div className="flex justify-center mb-4">
          <img
            src="/integrations/jira-logo.png"
            alt="Jira"
            className="w-12 h-12"
          />
        </div>
  
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Connect Jira
        </h2>
  
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Connect your Jira workspace to automatically create issues from meetings
          and map your organizations to Jira projects.
        </p>
  
        <button
          onClick={handleConnect}
          className="px-6 py-2 rounded-lg text-white font-medium
          bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]
          hover:from-[#080aa8] hover:to-[#6d0668]
          transition-all shadow-md"
        >
          Connect Jira
        </button>
      </div>
    );
}


function ConnectedView({ workspaces, projects, loading }) {
    const dispatch = useDispatch();
    const [mappingState, setMappingState] = useState([]);
  
    useEffect(() => {
      if (workspaces.length) {
        setMappingState(
          workspaces.map((ws) => ({
            organisation_id: ws.organisation_id,
            project_key: ws.jira_project_key || '',
            project_name: ws.jira_project_name || '',
          }))
        );
      }
    }, [workspaces]);
  
    const handleChange = (orgId, projectKey) => {
      const selectedProject = projects.find((p) => p.key === projectKey);
  
      setMappingState((prev) =>
        prev.map((item) =>
          item.organisation_id === orgId
            ? {
                ...item,
                project_key: projectKey,
                project_name: selectedProject?.name || '',
              }
            : item
        )
      );
    };
  
    const handleSave = async () => {
      const payload = mappingState
        .filter((m) => m.project_key)
        .map((m) => ({
          organisation_id: m.organisation_id,
          project_key: m.project_key,
          project_name: m.project_name,
        }));
  
      if (!payload.length) {
        alert('Please map at least one workspace');
        return;
      }
  
      const res = await dispatch(saveJiraWorkspaceMappings(payload));
  
      if (res.meta.requestStatus === 'fulfilled') {
        dispatch(getJiraWorkspaceMappings());
      }
    };
  
    const hasChanges =
      JSON.stringify(
        workspaces.map((w) => ({
          organisation_id: w.organisation_id,
          project_key: w.jira_project_key || '',
        }))
      ) !== JSON.stringify(mappingState.map((m) => ({
        organisation_id: m.organisation_id,
        project_key: m.project_key,
      })));
  
    if (loading) {
      return (
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 text-center">
          <p className="text-gray-500">Loading workspace mappings...</p>
        </div>
      );
    }
  
    return (
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-gray-200">
  
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 pb-4 mb-6">

            <div className="flex items-center justify-between gap-4">

                {/* Left */}
                <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-2 rounded-lg border border-gray-200">
                    <img
                    src="/integrations/jira-logo.png"
                    alt="Jira"
                    className="w-8 h-8"
                    />
                </div>

                <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Workspace Mapping
                    </h2>
                    <p className="text-sm text-gray-500">
                    Map each organization to a Jira project
                    </p>
                </div>
                </div>

                {/* Right - Save Button */}
                <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`px-5 py-2 rounded-lg text-white text-sm font-medium transition-all shadow-md
                    bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]
                    hover:from-[#080aa8] hover:to-[#6d0668]
                    ${
                    !hasChanges
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    }
                `}
                >
                Save Mapping
                </button>

            </div>
            </div>
  
        {/* No orgs */}
        {workspaces.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No organizations found.
          </p>
        ) : (
          <div className="space-y-4">
  
            {workspaces.map((ws) => {
              const selected = mappingState.find(
                (m) => m.organisation_id === ws.organisation_id
              );
  
              return (
                <div
                  key={ws.organisation_id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4
                  border border-gray-200 rounded-xl p-4 hover:shadow-sm transition"
                >
                  {/* Left */}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {ws.organisation_name}
                    </p>
  
                    <p className="text-sm mt-1">
                      {selected?.project_name ? (
                        <span className="text-green-600 font-medium">
                          Mapped to: {selected.project_name}
                        </span>
                      ) : (
                        <span className="text-gray-400">
                          Not mapped
                        </span>
                      )}
                    </p>
                  </div>
  
                  {/* Right */}
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                    focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    value={selected?.project_key || ''}
                    onChange={(e) =>
                      handleChange(ws.organisation_id, e.target.value)
                    }
                  >
                    <option value="">Select Project</option>
  
                    {projects.map((proj) => (
                      <option key={proj.key} value={proj.key}>
                        {proj.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
  
          </div>
        )}
      </div>
    );
  }