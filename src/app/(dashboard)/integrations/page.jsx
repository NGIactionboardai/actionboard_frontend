// src/app/(dashboard)/integrations/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, ChevronUp } from "lucide-react";

// ZOOM
import {
  selectZoomIsConnected,
  selectZoomSuccessMessage,
  setShowConnectionModal,
  setShowDisconnectModal
} from "@/redux/auth/zoomSlice";

// GOOGLE
import {
  selectGoogleIsConnected,
  selectGoogleEmail,
  selectGoogleName,
  startGoogleOAuth,
  disconnectGoogle,
  fetchGoogleStatus
} from "@/redux/integrations/googleCalendarSlice";

// JIRA
import {
  selectJiraIsConnected,
  startJiraOAuth,
  disconnectJira,
  getJiraConnectionStatus,
  selectJiraLoading
} from "@/redux/integrations/jiraSlice";
import { useMeetingsModal } from "@/app/hooks/useMeetings";
import ZoomConfig from "@/app/components/ZoomConfig";
import ConfirmModal from "@/app/components/integrations/ConfirmModal";

export default function IntegrationsPage() {
  const dispatch = useDispatch();

  const isZoomConnected = useSelector(selectZoomIsConnected);
  const successMessage = useSelector(selectZoomSuccessMessage);
  const {
        isCreateMeetingModalOpen,
        setIsCreateMeetingModalOpen,
        isZoomConnectionModalOpen,
        setIsZoomConnectionModalOpen,
        handleCreateMeetingClick
      } = useMeetingsModal(successMessage);

  const isGoogleConnected = useSelector(selectGoogleIsConnected);
  const googleEmail = useSelector(selectGoogleEmail);
  const googleName = useSelector(selectGoogleName);
  const [showGoogleConnectModal, setShowGoogleConnectModal] = useState(false);
  const [showGoogleDisconnectModal, setShowGoogleDisconnectModal] = useState(false);

  const isJiraConnected = useSelector(selectJiraIsConnected);
  const jiraLoading = useSelector(selectJiraLoading);
  const [showJiraConnectModal, setShowJiraConnectModal] = useState(false);
  const [showJiraDisconnectModal, setShowJiraDisconnectModal] = useState(false);

  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    dispatch(getJiraConnectionStatus());
    dispatch(fetchGoogleStatus());
  }, [dispatch]);

  const toggleExpand = (key) => {
    setExpanded(expanded === key ? null : key);
  };


  const handleGoogleConnect = async () => {
    const res = await dispatch(startGoogleOAuth());
  
    if (res.payload?.auth_url) {
      setShowGoogleConnectModal(false); // close modal
      window.location.href = res.payload.auth_url;
    }
  };
  
  const handleGoogleDisconnect = () => {
    dispatch(disconnectGoogle());
    setShowGoogleDisconnectModal(false);
  };

  const handleJiraClick = () => {
    if (isJiraConnected) {
      setShowJiraDisconnectModal(true);
    } else {
      setShowJiraConnectModal(true);
    }
  };

  const handleJiraConnect = async () => {
    const res = await dispatch(startJiraOAuth());
  
    if (res.payload?.auth_url) {
      window.location.href = res.payload.auth_url;
    }
  };

  const handleJiraDisconnect = () => {
    dispatch(disconnectJira());
    setShowJiraDisconnectModal(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900">
            Integrations
          </h1>
          <p className="text-lg text-gray-500 mt-1">
            Connect your tools to automate meetings, sync data, and boost productivity.
          </p>
        </div>

        {/* SECTION: MEETING */}
        <Section title="Meeting Platforms">

          {/* ZOOM */}
          <IntegrationRow
            name="Zoom"
            icon="/meeting-tools-icons/zoom-logo.png"
            description="Create and manage Zoom meetings."
            isConnected={isZoomConnected}
            expanded={expanded === "zoom"}
            onToggle={() => toggleExpand("zoom")}
            onConnect={() => dispatch(setShowConnectionModal(true))}
            onDisconnect={() => dispatch(setShowDisconnectModal(true))}
          >
            <DetailItem label="Status" value="Connected to Zoom account" />
          </IntegrationRow>

          {/* GOOGLE */}
            <IntegrationRow
                name="Google Meet"
                icon="/meeting-tools-icons/meet-logo.png"
                description="Sync with Google Calendar for meetings."
                isConnected={isGoogleConnected}
                expanded={expanded === "google"}
                onToggle={() => toggleExpand("google")}
                onConnect={() => setShowGoogleConnectModal(true)}
                onDisconnect={() => setShowGoogleDisconnectModal(true)}
            >
                <DetailItem label="Email" value={googleEmail} />
                <DetailItem label="Name" value={googleName} />
            </IntegrationRow>

        </Section>

        {/* SECTION: PRODUCTIVITY */}
        <Section title="Productivity">

          {/* JIRA */}
          <IntegrationRow
            name="Jira"
            icon="/integrations/jira-logo.png"
            description="Turn meeting notes into Jira issues."
            isConnected={isJiraConnected}
            expanded={expanded === "jira"}
            onToggle={() => toggleExpand("jira")}
            onConnect={handleJiraClick}
            onDisconnect={handleJiraClick}
            extraAction={{
              label: "Manage",
              onClick: () => (window.location.href = "/integrations/jira")
            }}
            loading={jiraLoading}
          >
            <DetailItem label="Status" value="Connected workspace" />
          </IntegrationRow>

        </Section>

      </div>


      {/* Modals */}
      <ZoomConfig
        isOpen={isZoomConnectionModalOpen}
        onClose={() => setIsZoomConnectionModalOpen(false)}
      />

    {showGoogleConnectModal && (
        <ConfirmModal
            title="Connect Google Calendar"
            description="To create and manage Google Meet meetings, we need access to your Google Calendar. You will be redirected to Google."
            confirmText="Continue"
            onConfirm={handleGoogleConnect}
            onCancel={() => setShowGoogleConnectModal(false)}
        />
    )}

    {showGoogleDisconnectModal && (
        <ConfirmModal
            title="Disconnect Google Calendar"
            description="Are you sure you want to disconnect your Google account?"
            confirmText="Disconnect"
            danger
            onConfirm={handleGoogleDisconnect}
            onCancel={() => setShowGoogleDisconnectModal(false)}
        />
    )}


    {showJiraConnectModal && (
        <ConfirmModal
            title="Connect Jira"
            description="Connect your Jira account to automatically create issues from meetings."
            confirmText="Continue"
            onConfirm={handleJiraConnect}
            onCancel={() => setShowJiraConnectModal(false)}
        />
    )}

    {showJiraDisconnectModal && (
        <ConfirmModal
            title="Disconnect Jira"
            description="Are you sure you want to disconnect your Jira account?"
            confirmText="Disconnect"
            danger
            onConfirm={handleJiraDisconnect}
            onCancel={() => setShowJiraDisconnectModal(false)}
        />
    )}
    
    </main>
  );
}



function Section({ title, children }) {
    return (
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-500 uppercase tracking-wider mb-3">
          {title}
        </h2>
  
        <div className="bg-white border border-gray-200 rounded-2xl divide-y">
          {children}
        </div>
      </div>
    );
}



function IntegrationRow({
    name,
    icon,
    description,
    isConnected,
    onConnect,
    onDisconnect,
    extraAction,
    expanded,
    onToggle,
    children,
    loading
  }) {
    return (
      <div className="transition">
  
        {/* ROW */}
        <div
          className="flex items-center justify-between px-5 py-5 hover:bg-gray-50 cursor-pointer"
          onClick={onToggle}
        >
          {/* LEFT */}
          <div className="flex items-center gap-4">
  
            <div className="w-12 h-12 rounded-xl border bg-white flex items-center justify-center shadow-sm">
              <img src={icon} className="w-7 h-7" />
            </div>
  
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xl font-semibold text-gray-900">{name}</p>
  
                <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${
                  isConnected ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                }`}>
                  {isConnected ? "Connected" : "Not Connected"}
                </span>
              </div>
  
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
          </div>
  
          {/* RIGHT */}
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
  
            {isConnected ? (
              <>
                {extraAction && (
                  <button
                    onClick={extraAction.onClick}
                    className="px-3 py-1.5 text-base rounded-full border hover:bg-gray-100"
                  >
                    {extraAction.label}
                  </button>
                )}
  
                <button
                  onClick={onDisconnect}
                  className="px-3 py-1.5 text-base rounded-full text-white bg-red-500 hover:bg-red-600"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={onConnect}
                disabled={loading}
                className="px-4 py-1.5 text-base rounded-full text-white shadow
                bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]
                hover:from-[#080aa8] hover:to-[#6d0668]"
              >
                {loading ? "Connecting..." : "Connect"}
              </button>
            )}
  
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
  
        {/* EXPANDED PANEL */}
        {expanded && isConnected && (
          <div className="px-6 pb-4 pt-2 bg-gray-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
              {children}
            </div>
          </div>
        )}
  
      </div>
    );
}



function DetailItem({ label, value }) {
    return (
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value || "—"}</p>
      </div>
    );
}