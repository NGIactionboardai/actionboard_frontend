import { useState } from "react";
import _ from "lodash";
import axios from "axios";
import { toast } from "react-hot-toast";
// import { API_BASE_URL } from "@/config";

export default function EditStructuredSummary({ meetingId, draftSummary, setDraftSummary, onCancel, onSave }) {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [loading, setLoading] = useState(false);

  // 🔹 Update helpers
  const updateField = (path, value) => {
    setDraftSummary((prev) => {
      const copy = { ...prev };
      _.set(copy, path, value); // lodash.set makes nested updates easy
      return copy;
    });
  };

  // 🔹 Save handler
  const handleSave = async () => {
    try {
      setLoading(true);
      const { data } = await axios.patch(
        `${API_BASE_URL}/transcripts/${meetingId}/update-structured-summary/`,
        { structured_summary: draftSummary }
      );
      // callback with updated insights
      toast.success("Summary Updated successfully!");
      onSave()
    } catch (err) {
      console.error("Error updating structured summary:", err);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Meeting Objective */}
      <div>
        <h4 className="font-semibold text-lg mb-2">Meeting Objective</h4>
        <textarea
          className="w-full border rounded p-2"
          value={draftSummary.summary_text?.meeting_objective || ""}
          onChange={(e) =>
            updateField("summary_text.meeting_objective", e.target.value)
          }
        />
      </div>

      {/* High-level Outcomes */}
      <div>
        <h4 className="font-semibold text-lg mb-2">High-level Outcomes</h4>
        {draftSummary.summary_text?.high_level_outcomes?.map((outcome, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              className="flex-1 border rounded p-2"
              value={outcome}
              onChange={(e) => {
                const updated = [...draftSummary.summary_text.high_level_outcomes];
                updated[idx] = e.target.value;
                updateField("summary_text.high_level_outcomes", updated);
              }}
            />
            <button
              className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg"
              onClick={() => {
                const updated = draftSummary.summary_text.high_level_outcomes.filter(
                  (_, i) => i !== idx
                );
                updateField("summary_text.high_level_outcomes", updated);
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          className="mt-2 px-3 py-1 bg-[#4F39F6] hover:bg-[#432DD7] text-white text-sm rounded-lg"
          onClick={() =>
            updateField("summary_text.high_level_outcomes", [
              ...(draftSummary.summary_text?.high_level_outcomes || []),
              "",
            ])
          }
        >
          + Add Outcome
        </button>
      </div>

      {/* Key Discussion Themes */}
      <div>
        <h4 className="font-semibold text-lg mb-2">Key Discussion Themes</h4>
        {draftSummary.summary_text?.key_discussion_themes?.map((theme, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              className="flex-1 border rounded p-2"
              value={theme}
              onChange={(e) => {
                const updated = [...draftSummary.summary_text.key_discussion_themes];
                updated[idx] = e.target.value;
                updateField("summary_text.key_discussion_themes", updated);
              }}
            />
            <button
              className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg"
              onClick={() => {
                const updated = draftSummary.summary_text.key_discussion_themes.filter(
                  (_, i) => i !== idx
                );
                updateField("summary_text.key_discussion_themes", updated);
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          className="mt-2 px-3 py-1 bg-[#4F39F6] hover:bg-[#432DD7] text-white text-sm rounded-lg"
          onClick={() =>
            updateField("summary_text.key_discussion_themes", [
              ...(draftSummary.summary_text?.key_discussion_themes || []),
              "",
            ])
          }
        >
          + Add Theme
        </button>
      </div>

      {/* Minutes Sections */}
      <div>
        <h4 className="font-semibold text-lg mb-2">Minutes Sections</h4>
        {draftSummary.minutes?.sections?.map((section, idx) => (
          <div key={idx} className="border rounded p-3 mb-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                className="flex-1 border rounded p-2 font-medium"
                value={section.title}
                onChange={(e) => {
                  const updated = [...draftSummary.minutes.sections];
                  updated[idx].title = e.target.value;
                  updateField("minutes.sections", updated);
                }}
              />
              <button
                className="px-2 py-1 text-xs bg-red-500 text-white rounded-lg"
                onClick={() => {
                  const updated = draftSummary.minutes.sections.filter(
                    (_, i) => i !== idx
                  );
                  updateField("minutes.sections", updated);
                }}
              >
                Remove Section
              </button>
            </div>

            {section.points.map((point, pIdx) => (
              <div key={pIdx} className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  className="flex-1 border rounded p-2"
                  value={point}
                  onChange={(e) => {
                    const updated = [...draftSummary.minutes.sections];
                    updated[idx].points[pIdx] = e.target.value;
                    updateField("minutes.sections", updated);
                  }}
                />
                <button
                  className="px-2 py-1 text-xs bg-red-400 text-white rounded-lg"
                  onClick={() => {
                    const updated = [...draftSummary.minutes.sections];
                    updated[idx].points = updated[idx].points.filter(
                      (_, i) => i !== pIdx
                    );
                    updateField("minutes.sections", updated);
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              className="mt-2 px-3 py-1 bg-[#4F39F6] hover:bg-[#432DD7] text-white text-sm rounded-lg"
              onClick={() => {
                const updated = [...draftSummary.minutes.sections];
                updated[idx].points.push("");
                updateField("minutes.sections", updated);
              }}
            >
              + Add Point
            </button>
          </div>
        ))}
        <button
          className="mt-2 px-3 py-2 bg-[#4F39F6] hover:bg-[#432DD7] text-white text-sm rounded-lg"
          onClick={() => {
            updateField("minutes.sections", [
              ...(draftSummary.minutes?.sections || []),
              { title: "", points: [] },
            ]);
          }}
        >
          + Add Minutes Section
        </button>
      </div>

      {/* Action Items */}
      <div>
        <h4 className="font-semibold text-lg mb-3">Action Items</h4>

        {draftSummary.action_items?.length > 0 && (
          <div className="grid grid-cols-4 gap-3 text-sm font-medium text-gray-600 mb-2 px-1">
            <span>Task</span>
            <span>Responsible Person</span>
            <span>Deadline</span>
            <span></span>
          </div>
        )}

        {draftSummary.action_items?.map((item, idx) => (
          <div
            key={idx}
            className="grid grid-cols-4 gap-3 items-center mb-2 p-2 border rounded-lg bg-gray-50"
          >
            <input
              type="text"
              className="border rounded px-2 py-1 w-full text-sm"
              placeholder="Task"
              value={item.task}
              onChange={(e) => {
                const updated = [...draftSummary.action_items];
                updated[idx].task = e.target.value;
                updateField("action_items", updated);
              }}
            />
            <input
              type="text"
              className="border rounded px-2 py-1 w-full text-sm"
              placeholder="Responsible Person"
              value={item.owner}
              onChange={(e) => {
                const updated = [...draftSummary.action_items];
                updated[idx].owner = e.target.value;
                updateField("action_items", updated);
              }}
            />
            <input
              type="text"
              className="border rounded px-2 py-1 w-full text-sm"
              placeholder="Deadline"
              value={item.deadline}
              onChange={(e) => {
                const updated = [...draftSummary.action_items];
                updated[idx].deadline = e.target.value;
                updateField("action_items", updated);
              }}
            />
            <button
              className="ml-auto px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg"
              onClick={() => {
                const updated = draftSummary.action_items.filter((_, i) => i !== idx);
                updateField("action_items", updated);
              }}
            >
              Remove
            </button>
          </div>
        ))}

        <button
          className="mt-3 px-3 py-2 bg-[#4F39F6] hover:bg-[#432DD7] text-white text-sm rounded-lg"
          onClick={() =>
            updateField("action_items", [
              ...(draftSummary.action_items || []),
              { task: "", owner: "", deadline: "" },
            ])
          }
        >
          + Add Action Item
        </button>
      </div>

      {/* Save / Cancel */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSave}
          disabled={loading}
          className={`px-4 py-2 rounded-lg shadow text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#4F39F6] hover:bg-[#432DD7]"
          }`}
        >
          {loading ? "Updating..." : "Update AI Insight"}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className={`px-4 py-2 rounded-lg shadow ${
            loading ? "bg-gray-200 cursor-not-allowed" : "bg-gray-300"
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
