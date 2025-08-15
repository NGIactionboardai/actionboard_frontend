'use client';

import axios from 'axios';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { getAuthHeaders } from '@/utils/auth';

const EditSpeakersModal = ({ isOpen, onClose, meetingId, onUpdateSuccess }) => {

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
      const res = await axios.get(
        `${API_BASE_URL}/transcripts/zoom/list-speakers/${meetingId}/`
      );

      const data = res.data;
      setSpeakerList(data.speakers);

      const initialMap = {};
      data.speakers.forEach((s) => {
        initialMap[s] = s;
      });
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

    const newErrors = {};
    speakerList.forEach((speaker) => {
      if (!speakerMap[speaker] || speakerMap[speaker].trim() === '') {
        newErrors[speaker] = 'This field is required';
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
        { speaker_map: speakerMap }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.3)] flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-md shadow-lg border p-4 sm:p-6">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-4 text-center">
          <img
            src="/icons/ab-update-speaker.png"
            alt="Edit"
            className="w-10 h-10 sm:w-12 sm:h-12 mb-2"
          />
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Edit Speaker Names
          </h3>
        </div>
  
        {/* Content */}
        {loading ? (
          <p className="text-gray-600 text-sm sm:text-base text-center">Loading speakers...</p>
        ) : (
          <div className="space-y-4">
            {speakerList.map((speaker, idx) => (
              <div key={idx}>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Speaker {speaker}
                </label>
                <input
                  type="text"
                  value={speakerMap[speaker] || ''}
                  onChange={(e) => handleChange(speaker, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs sm:text-sm"
                />
                {validationErrors[speaker] && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">
                    {validationErrors[speaker]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
  
        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto inline-flex justify-center px-4 py-2 bg-gray-500 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto inline-flex justify-center px-4 py-2 text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] text-xs sm:text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
  
};

export default EditSpeakersModal;
