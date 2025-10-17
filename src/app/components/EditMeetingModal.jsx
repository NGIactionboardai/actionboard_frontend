// EditMeetingModal.jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { editZoomMeeting, getZoomMeetings, selectZoomLoading, selectZoomUserInfo } from "../../redux/auth/zoomSlice";

const EditMeetingModal = ({ isOpen, onClose, organizationId, meeting, isZoomConnected }) => {
  const dispatch = useDispatch();
  const zoomLoading = useSelector(selectZoomLoading);
  const zoomUserInfo = useSelector(selectZoomUserInfo);

  const [form, setForm] = useState({
    topic: "",
    start_time: "",
    duration: 30,
    agenda: "",
    password: "",
    waiting_room: false,
    auto_recording: "none",
    join_before_host: true,
    audio: true,
    video: false,
  });
  const [resendInvites, setResendInvites] = useState(true);

  useEffect(() => {
    if (meeting) {
        setForm({
            topic: meeting.topic || "",
            start_time: meeting.start_time
              ? new Date(meeting.start_time).toISOString().slice(0, 16)
              : "",
            duration: meeting.duration || 30,
            agenda: meeting.agenda || "",
            password: meeting.password || "",
            // Use defaults — backend doesn’t store these yet
            waiting_room: false,
            auto_recording: "none",
            join_before_host: true,
            audio: form.audio ? 'both' : 'none',
            video: false,
          });
    }
  }, [meeting]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isZoomConnected) {
      alert("Please connect to Zoom first.");
      return;
    }
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; 

      const meetingData = {
        topic: form.topic,
        start_time: new Date(form.start_time).toISOString(),
        duration: parseInt(form.duration, 10),
        agenda: form.agenda,
        password: form.password,
        waiting_room: form.waiting_room,
        join_before_host: form.join_before_host,
        auto_recording: form.auto_recording,
        audio: form.audio ? "both" : "none",
        video: form.video,
        timezone,
      };
      await dispatch(editZoomMeeting({
        organizationId,
        meetingId: meeting.id,
        meetingData,
        resendInvites
      })).unwrap();

      // close & refresh
      dispatch(getZoomMeetings(organizationId));
      onClose();
    } catch (err) {
      console.error("Failed to edit meeting", err);
      alert("Could not update meeting. See console for details.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center">
        <div 
          className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="
          relative inline-block align-bottom bg-white rounded-lg text-left shadow-xl transform transition-all
          w-full max-w-lg
          sm:my-8
          overflow-hidden
        ">
          {/* Make form scrollable on mobile */}
          <div className="max-h-[80vh] overflow-y-auto px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                          Edit Zoom Meeting
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
                              value={form.topic}
                              onChange={handleChange}
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
                              value={form.start_time}
                              onChange={handleChange}
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
                              value={form.duration}
                              onChange={handleChange}
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
                              value={form.agenda}
                              onChange={handleChange}
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
                              value={form.password}
                              onChange={handleChange}
                            />
                          </div>

                          <div>
                            <label htmlFor="auto_recording" className="block text-sm font-medium text-gray-700">
                              Auto Recording
                            </label>
                            <select
                              id="auto_recording"
                              name="auto_recording"
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 
                                        focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                                        sm:text-sm rounded-md"
                              value={form.auto_recording}
                              onChange={handleChange}
                            >
                              <option value="none">No Recording</option>
                              <option value="local">Local Recording</option>

                              {/* Only show Cloud Recording if account_type is 2 (Licensed) or 3 (On-Prem) */}
                              {zoomUserInfo?.account_type && zoomUserInfo.account_type !== 1 && (
                                <option value="cloud">Cloud Recording</option>
                              )}
                            </select>

                            {/* Optional helper text */}
                            {zoomUserInfo?.account_type === 1 && (
                              <p className="mt-1 text-xs text-gray-500">
                                Cloud recording is available only for Licensed or On-Prem Zoom accounts.
                              </p>
                            )}
                          </div>

                          <div className="flex items-center">
                            <input
                              id="waiting_room"
                              name="waiting_room"
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              checked={form.waiting_room}
                              onChange={handleChange}
                            />
                            <label htmlFor="waiting_room" className="ml-2 block text-sm text-gray-900">
                              Enable Waiting Room
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              id="join_before_host"
                              name="join_before_host"
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              checked={form.join_before_host}
                              onChange={handleChange}
                            />
                            <label htmlFor="join_before_host" className="ml-2 block text-sm text-gray-900">
                              Enable Join Before host
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              id="audio"
                              name="audio"
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              checked={form.audio}
                              onChange={handleChange}
                            />
                            <label htmlFor="audio" className="ml-2 block text-sm text-gray-900">
                              Enable Audio (default ON)
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input
                              id="video"
                              name="video"
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              checked={form.video}
                              onChange={handleChange}
                            />
                            <label htmlFor="video" className="ml-2 block text-sm text-gray-900">
                              Enable Video (default OFF)
                            </label>
                          </div>

                          <div className="flex items-center">
                            <input 
                                id="invite"
                                name="invite"
                                type="checkbox" 
                                checked={resendInvites} 
                                onChange={() => setResendInvites(v => !v)} 
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="invite" className="ml-2 block text-sm text-gray-900">Resend invites to previous invitees</label>
                         </div>

                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer buttons */}
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={zoomLoading || !form.topic.trim() || !form.start_time}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {zoomLoading ? 'Updating...' : 'Update Meeting'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMeetingModal;
