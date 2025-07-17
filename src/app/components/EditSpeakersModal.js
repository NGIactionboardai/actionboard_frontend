'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { getAuthHeaders } from '@/utils/auth';

const EditSpeakersModal = ({ isOpen, onClose, meetingId, onUpdateSuccess }) => {
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
    // Try Redux token first, then localStorage as fallback
    const token = authToken || localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchSpeakers = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`https://actionboard-ai-backend.onrender.com/api/transcripts/zoom/list-speakers/${meetingId}/`, {
        headers,
      });
      const data = await response.json();
      setSpeakerList(data.speakers);
      const initialMap = {};
      data.speakers.forEach((s) => (initialMap[s] = s));
      setSpeakerMap(initialMap);
    } catch (err) {
      console.error('Error fetching speakers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (original, value) => {
    setSpeakerMap((prev) => ({
      ...prev,
      [original]: value,
    }));
  };

  const handleSubmit = async () => {
    // Step 1: Validate all fields are filled
    const newErrors = {};
    speakerList.forEach((speaker) => {
      if (!speakerMap[speaker] || speakerMap[speaker].trim() === '') {
        newErrors[speaker] = 'This field is required';
      }
    });
  
    // If there are validation errors, set them and stop
    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors); // 👈 make sure this state is defined in your component
      return;
    }
  
    // No validation errors — proceed with submit
    setValidationErrors({});
    setSubmitting(true);
  
    try {
      const headers = getAuthHeaders();
      const response = await fetch(
        `https://actionboard-ai-backend.onrender.com/api/transcripts/zoom/update-speakers/${meetingId}/`,
        {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ speaker_map: speakerMap }),
        }
      );
  
      if (response.ok) {
        onUpdateSuccess?.();
        onClose();
      } else {
        const err = await response.text();
        alert(`Failed to update speakers: ${response.status} - ${err}`);
      }
    } catch (err) {
      console.error(err);
      alert('Unexpected error while updating speakers.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.3)] transition-opacity flex items-center justify-center">
      <div className="relative p-6 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex items-center flex-col space-x-3 mb-4">
          <img src="/icons/ab-update-speaker.png" alt="Edit" className="w-10 h-10" />
          <h3 className="text-lg font-medium text-gray-900">Edit Speaker Names</h3>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading speakers...</p>
        ) : (
          <div className="space-y-4">
            {speakerList.map((speaker, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speaker {speaker}
                </label>
                <input
                  type="text"
                  value={speakerMap[speaker] || ''}
                  onChange={(e) => handleChange(speaker, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {validationErrors[speaker] && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors[speaker]}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="inline-flex justify-center px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex justify-center px-4 py-2 text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSpeakersModal;
