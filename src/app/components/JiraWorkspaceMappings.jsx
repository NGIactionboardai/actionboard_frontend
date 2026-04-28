'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getJiraWorkspaceMappings,
  saveJiraWorkspaceMappings,
  selectJiraIsConnected,
  selectJiraProjects,
  selectJiraWorkspaces,
  selectJiraLoading,
  selectJiraError,
  selectJiraSuccessMessage,
  selectJiraSiteName,
  selectJiraSiteUrl,
  clearJiraMessages,
} from '@/redux/auth/jiraSlice';

export default function JiraWorkspaceMappings() {
  const dispatch = useDispatch();

  const isConnected = useSelector(selectJiraIsConnected);
  const workspaces = useSelector(selectJiraWorkspaces);
  const jiraProjects = useSelector(selectJiraProjects);
  const loading = useSelector(selectJiraLoading);
  const error = useSelector(selectJiraError);
  const successMessage = useSelector(selectJiraSuccessMessage);
  const siteName = useSelector(selectJiraSiteName);
  const siteUrl = useSelector(selectJiraSiteUrl);

  const [selectedMappings, setSelectedMappings] = useState({});

  useEffect(() => {
    if (isConnected) {
      dispatch(getJiraWorkspaceMappings());
    }
  }, [dispatch, isConnected]);

  useEffect(() => {
    const initial = {};
    (workspaces || []).forEach((workspace) => {
      initial[workspace.organisation_id] = {
        project_key: workspace.jira_project_key || '',
        project_name: workspace.jira_project_name || '',
      };
    });
    setSelectedMappings(initial);
  }, [workspaces]);

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearJiraMessages());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  const hasProjects = (jiraProjects || []).length > 0;
  const hasWorkspaces = (workspaces || []).length > 0;

  const changedPayload = useMemo(() => {
    return (workspaces || [])
      .filter((workspace) => {
        const current = selectedMappings[workspace.organisation_id];
        if (!current?.project_key) return false;

        return (
          current.project_key !== (workspace.jira_project_key || '') ||
          current.project_name !== (workspace.jira_project_name || '')
        );
      })
      .map((workspace) => ({
        organisation_id: workspace.organisation_id,
        project_key: selectedMappings[workspace.organisation_id].project_key,
        project_name: selectedMappings[workspace.organisation_id].project_name,
      }));
  }, [workspaces, selectedMappings]);

  const handleProjectChange = (organisationId, projectKey) => {
    const selectedProject = (jiraProjects || []).find(
      (project) => project.key === projectKey
    );

    setSelectedMappings((prev) => ({
      ...prev,
      [organisationId]: {
        project_key: selectedProject?.key || '',
        project_name: selectedProject?.name || '',
      },
    }));
  };

  const handleSaveMappings = () => {
    if (!changedPayload.length) return;
    dispatch(saveJiraWorkspaceMappings(changedPayload));
  };

  if (!isConnected) return null;

  return (
    <div className="mt-10 w-full max-w-6xl mx-auto">
      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Jira Workspace Mapping</h2>
            <p className="mt-2 text-sm text-gray-600 leading-6">
              Map each ActionBoard workspace to a Jira project so meetings can sync into the correct Jira destination.
            </p>
            {(siteName || siteUrl) && (
              <div className="mt-3 text-sm text-gray-700">
                {siteName && <p><span className="font-medium">Connected site:</span> {siteName}</p>}
                {siteUrl && <p className="text-blue-600 break-all">{siteUrl}</p>}
              </div>
            )}
          </div>

          <button
            onClick={handleSaveMappings}
            disabled={loading || !changedPayload.length}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Mappings'}
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {typeof error === 'string' ? error : 'Something went wrong while loading Jira data.'}
          </div>
        )}

        {successMessage && (
          <div className="mt-5 rounded-xl bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
            {successMessage}
          </div>
        )}

        {!hasProjects && (
          <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-4 text-sm text-yellow-800">
            No Jira projects found. Create a project in Jira first, then refresh this page.
          </div>
        )}

        {!hasWorkspaces && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-700">
            No workspaces found to map yet.
          </div>
        )}

        {hasWorkspaces && (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="pb-2">Workspace</th>
                  <th className="pb-2">Current Mapping</th>
                  <th className="pb-2">Select Jira Project</th>
                </tr>
              </thead>

              <tbody>
                {workspaces.map((workspace) => {
                  const selected = selectedMappings[workspace.organisation_id] || {
                    project_key: '',
                    project_name: '',
                  };

                  return (
                    <tr key={workspace.organisation_id} className="bg-gray-50">
                      <td className="px-4 py-4 rounded-l-2xl">
                        <div className="font-medium text-gray-900">
                          {workspace.organisation_name || 'Unnamed Workspace'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {workspace.organisation_id}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {workspace.jira_project_key ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-medium">
                            {workspace.jira_project_key} — {workspace.jira_project_name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-200 text-gray-600 px-3 py-1 text-sm font-medium">
                            Not mapped
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 rounded-r-2xl">
                        <select
                          value={selected.project_key}
                          onChange={(e) =>
                            handleProjectChange(workspace.organisation_id, e.target.value)
                          }
                          disabled={!hasProjects || loading}
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a Jira project</option>
                          {jiraProjects.map((project) => (
                            <option key={project.key} value={project.key}>
                              {project.key} — {project.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
