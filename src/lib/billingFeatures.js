const FEATURE_LABELS = {
  org_creation: "Organization Creation",
  org_meetings: "Organization Meetings",
  member_management: "Member Management",
  org_calendar: "Organization Calendar",
  personal_calendar: "Personal Calendar",
  upload_transcribe: "Upload & Transcribe",
  ai_notetaker: "AI Notetaker",
  ai_assistant: "AI Assistant",
  org_rbac: "Organization-wide RBAC",
  rbac: "Organization-wide RBAC",
  role_management: "Organization-wide RBAC",
  org_role_management: "Organization-wide RBAC",
  google_meet: "Google Meet Integration",
  google_meet_integration: "Google Meet Integration",
  teams_integration: "Microsoft Teams Integration",
  microsoft_teams: "Microsoft Teams Integration",
  slack_integration: "Slack Integration",
  jira_integration: "Jira Integration",
};

const titleCase = (key) =>
  key
    .split(/[_-]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

export const getFeatureLabel = (feature) => {
  const label = FEATURE_LABELS[feature.feature_key] || titleCase(feature.feature_key);
  return feature.limit ? `${label} (${feature.limit})` : label;
};

export const PLAN_INTEGRATIONS = [
  { key: "meeting_platforms", label: "Zoom, MS Teams, and Google Meet" },
  { key: "app_integrations", label: "Jira, Slack" },
];
