'use client';

import axios from 'axios';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const EditSpeakersModal = ({ 
  isOpen, 
  onClose, 
  meetingId, 
  onUpdateSuccess, 
  utterances = [] // 👈 pass transcript here
}) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [speakerList, setSpeakerList] = useState([]);
  const [speakerMap, setSpeakerMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const authToken = useSelector((state) => state.auth?.token);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchSpeakers();
    }
  }, [isOpen]);

  const getAuthHeaders = () => {
    const token = authToken || localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found. Please log in.');

    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchSpeakers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/transcripts/zoom/list-speakers/${meetingId}/`,
        { headers: getAuthHeaders() }
      );

      const data = res.data;
      setSpeakerList(data.speakers || []);

      const initialMap = {};
      (data.speakers || []).forEach((s) => {
        initialMap[s.name] = s.name;
      });
      setSpeakerMap(initialMap);
    } catch (err) {
      console.error('Error fetching speakers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (originalName, value) => {
    setSpeakerMap((prev) => ({
      ...prev,
      [originalName]: value,
    }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    speakerList.forEach((s) => {
      if (!speakerMap[s.name] || speakerMap[s.name].trim() === '') {
        newErrors[s.name] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    setValidationErrors({});
    setSubmitting(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/transcripts/zoom/update-speakers/${meetingId}/`,
        { speaker_map: speakerMap },
        { headers: getAuthHeaders() }
      );

      if (res.status >= 200 && res.status < 300) {
        onUpdateSuccess?.();
        onClose();
      } else {
        alert(`Failed to update speakers: ${res.status} - ${res.statusText}`);
      }
    } catch (err) {
      console.error('Error updating speakers:', err);
      alert('Unexpected error while updating speakers.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map((val) => String(val).padStart(2, "0")).join(":");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.3)] flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-5xl bg-white rounded-md shadow-lg border 
                      max-h-[90vh] flex flex-col"> {/* constrain height + flex layout */}
        
        {/* Header */}
        <div className="flex flex-col items-center mb-4 text-center p-4 sm:p-6">
          <img
            src="/icons/ab-update-speaker.png"
            alt="Edit"
            className="w-10 h-10 sm:w-12 sm:h-12 mb-2"
          />
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Edit Speaker Names
          </h3>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 sm:px-6 
                        flex-1 overflow-y-auto"> 
          {/* Left: Speaker Editing */}
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-600 text-sm sm:text-base text-center">
                Loading speakers...
              </p>
            ) : (
              speakerList.map((s, idx) => (
                <div key={idx}>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    {s.code ? `Speaker ${s.code}` : 'Speaker'}
                  </label>
                  <input
                    type="text"
                    value={speakerMap[s.name] || ''}
                    onChange={(e) => handleChange(s.name, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                              focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
                  />
                  {validationErrors[s.name] && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">
                      {validationErrors[s.name]}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Right: Transcript Preview */}
          <div className="bg-gray-50 p-3 rounded-md border max-h-[60vh] overflow-y-auto text-sm">
            <h4 className="font-medium text-gray-800 mb-2">Transcript Preview</h4>
            {utterances.length > 0 ? (
              utterances.map((u, idx) => (
                <div key={idx} className="mb-2">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold text-indigo-700">
                      {speakerMap[u.speaker] || u.speaker}
                    </span>{" "}
                    <span className="text-gray-500">[{formatTime(u.start)}]</span>
                  </p>
                  <p className="text-gray-900">{u.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No transcript available.</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t">
          <button
            onClick={onClose}
            className="w-full sm:w-auto inline-flex justify-center px-4 py-2 
                      bg-gray-500 text-white text-xs sm:text-sm font-medium 
                      rounded-md hover:bg-gray-600 focus:outline-none 
                      focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto inline-flex justify-center px-4 py-2 
                      text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] 
                      hover:from-[#080aa8] hover:to-[#6d0668] 
                      text-xs sm:text-sm font-medium rounded-md 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 
                      focus:ring-indigo-500 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSpeakersModal;
