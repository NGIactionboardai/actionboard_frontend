"use client";

const FEATURE_MESSAGES = {
  upload_transcribe: "Upload & Transcribe",
  ai_notetaker: "AI Notetaker",
  ai_assistant: "AI Assistant",
};

export default function UpgradeModal({ type, featureKey, onClose }) {
  const isLimit = type === "limit";
  const featureName = FEATURE_MESSAGES[featureKey] || "This feature";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isLimit ? "Usage Limit Reached" : "Upgrade Required"}
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {isLimit
            ? `You've reached your limit for ${featureName}. Upgrade to continue using it.`
            : `${featureName} is not available on your current plan.`}
        </p>

        {/* CTA */}
        <button
          onClick={() => window.location.href = "/pricing"}
          className="w-full bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] text-white py-2 rounded-lg hover:opacity-90 transition"
        >
          Upgrade Plan
        </button>

        {/* Secondary */}
        <button
          onClick={onClose}
          className="w-full mt-3 text-gray-500 hover:text-gray-700"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}