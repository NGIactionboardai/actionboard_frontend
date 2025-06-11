import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createZoomMeeting,
  getZoomMeetings,
  selectZoomLoading
} from '../../redux/auth/zoomSlice'; // Adjust import path as needed

const CreateMeetingModal = ({ 
  isOpen, 
  onClose, 
  organizationId,
  isZoomConnected 
}) => {
  const dispatch = useDispatch();
  const zoomLoading = useSelector(selectZoomLoading);

  const [meetingForm, setMeetingForm] = useState({
    topic: '',
    start_time: '',
    duration: 30,
    agenda: '',
    password: '',
    waiting_room: true,
    auto_recording: 'none'
  });

  const handleMeetingFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMeetingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    
    if (!isZoomConnected) {
      alert('Please connect to Zoom first to create meetings.');
      return;
    }

    try {
      // Format data to match your backend API
      const meetingData = {
        topic: meetingForm.topic,
        start_time: new Date(meetingForm.start_time).toISOString(),
        duration: parseInt(meetingForm.duration),
        // Add optional fields if they have values
        ...(meetingForm.agenda && { agenda: meetingForm.agenda }),
        ...(meetingForm.password && { password: meetingForm.password }),
        // Add settings if you want to extend the backend to accept them
        settings: {
          waiting_room: meetingForm.waiting_room,
          auto_recording: meetingForm.auto_recording,
        }
      };

      await dispatch(createZoomMeeting({ meetingData, organizationId })).unwrap();
      
      // Reset form and close modal
      setMeetingForm({
        topic: '',
        start_time: '',
        duration: 30,
        agenda: '',
        password: '',
        waiting_room: true,
        auto_recording: 'none'
      });
      onClose();
      
      // Refresh meetings list
      dispatch(getZoomMeetings(organizationId));
      
    } catch (error) {
      console.error('Failed to create meeting:', error);
      // You might want to show a user-friendly error message here
      alert('Failed to create meeting. Please try again.');
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setMeetingForm({
      topic: '',
      start_time: '',
      duration: 30,
      agenda: '',
      password: '',
      waiting_room: true,
      auto_recording: 'none'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={handleClose}
        ></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleCreateMeeting}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Create Zoom Meeting
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="topic" className="block text-sm font-medium text-gray-700">
                        Meeting Topic *
                      </label>
                      <input
                        type="text"
                        id="topic"
                        name="topic"
                        required
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter meeting topic"
                        value={meetingForm.topic}
                        onChange={handleMeetingFormChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                        Start Time *
                      </label>
                      <input
                        type="datetime-local"
                        id="start_time"
                        name="start_time"
                        required
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2"
                        value={meetingForm.start_time}
                        onChange={handleMeetingFormChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        id="duration"
                        name="duration"
                        min="1"
                        max="1440"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2"
                        value={meetingForm.duration}
                        onChange={handleMeetingFormChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="agenda" className="block text-sm font-medium text-gray-700">
                        Agenda
                      </label>
                      <textarea
                        id="agenda"
                        name="agenda"
                        rows="3"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter meeting agenda..."
                        value={meetingForm.agenda}
                        onChange={handleMeetingFormChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Meeting Password (Optional)
                      </label>
                      <input
                        type="text"
                        id="password"
                        name="password"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter meeting password"
                        value={meetingForm.password}
                        onChange={handleMeetingFormChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="auto_recording" className="block text-sm font-medium text-gray-700">
                        Auto Recording
                      </label>
                      <select
                        id="auto_recording"
                        name="auto_recording"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={meetingForm.auto_recording}
                        onChange={handleMeetingFormChange}
                      >
                        <option value="none">No Recording</option>
                        <option value="local">Local Recording</option>
                        <option value="cloud">Cloud Recording</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="waiting_room"
                        name="waiting_room"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={meetingForm.waiting_room}
                        onChange={handleMeetingFormChange}
                      />
                      <label htmlFor="waiting_room" className="ml-2 block text-sm text-gray-900">
                        Enable Waiting Room
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={zoomLoading || !meetingForm.topic.trim() || !meetingForm.start_time}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {zoomLoading ? 'Creating...' : 'Create Meeting'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMeetingModal;