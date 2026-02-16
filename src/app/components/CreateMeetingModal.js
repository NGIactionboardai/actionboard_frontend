import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  createZoomMeeting,
  getZoomMeetings,
  selectZoomLoading,
  selectZoomUserInfo
} from '../../redux/auth/zoomSlice'; // Adjust import path as needed

const CreateMeetingModal = ({ 
  isOpen, 
  onClose, 
  organizationId,
  isZoomConnected,
  setShowRecordingInfoModal
}) => {
  const dispatch = useDispatch();
  const zoomLoading = useSelector(selectZoomLoading);
  const zoomUserInfo = useSelector(selectZoomUserInfo);

  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const [nextUrl, setNextUrl] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const memberListRef = useRef(null);


  const [meetingForm, setMeetingForm] = useState({
    topic: '',
    start_time: '',
    duration: 30,
    agenda: '',
    password: '',
    waiting_room: false,
    auto_recording: 'none',
    join_before_host: true,
    audio: true,  
    video: false, 
  });

  const handleMeetingFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMeetingForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleMember = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, organizationId]);

  const fetchMembers = async () => {
    if (!organizationId) return;
  
    try {
      setMembersLoading(true);
  
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/organisations/${organizationId}/members/`
      );
  
      setMembers(res.data.members || []);
      setNextUrl(res.data.next);
      setHasMore(Boolean(res.data.next));
    } catch (err) {
      console.error("Error fetching members", err);
    } finally {
      setMembersLoading(false);
    }
  };

  const loadMoreMembers = useCallback(async () => {
    if (!nextUrl || isFetchingMore) return;
  
    setIsFetchingMore(true);
  
    try {
      const res = await axios.get(nextUrl);
  
      setMembers(prev => {
        const map = new Map(prev.map(m => [m.id, m]));
        res.data.members.forEach(m => map.set(m.id, m));
        return Array.from(map.values());
      });
  
      setNextUrl(res.data.next);
      setHasMore(Boolean(res.data.next));
    } catch (err) {
      console.error("Failed to load more members:", err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [nextUrl, isFetchingMore]);

  const sendInvites = async (meetingId) => {
    if (!selectedMembers.length) return;
  
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/meetings/send-meeting-invitations/${organizationId}/`,
        {
          meeting_id: meetingId,
          member_ids: selectedMembers,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      );

      return true;
    } catch (err) {
      console.error("Failed to send invites", err);
    }
  };
  


  useEffect(() => {
    const el = memberListRef.current;
    if (!el) return;
  
    const handleScroll = () => {
      if (!hasMore || isFetchingMore) return;
  
      const threshold = 60;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - threshold) {
        loadMoreMembers();
      }
    };
  
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [hasMore, isFetchingMore, loadMoreMembers]);



  const handleCreateMeeting = async (e) => {
    e.preventDefault();
  
    if (!isZoomConnected) {
      alert('Please connect to Zoom first to create meetings.');
      return;
    }
  
    try {
      const meetingData = {
        topic: meetingForm.topic,
        start_time: new Date(meetingForm.start_time).toISOString(),
        duration: parseInt(meetingForm.duration),
        ...(meetingForm.agenda && { agenda: meetingForm.agenda }),
        ...(meetingForm.password && { password: meetingForm.password }),
        settings: {
          waiting_room: meetingForm.waiting_room,
          auto_recording: meetingForm.auto_recording,
          join_before_host: meetingForm.join_before_host,
          audio: meetingForm.audio ? 'both' : 'none',
          video: meetingForm.video,
        }
      };
  
      const res = await dispatch(
        createZoomMeeting({ meetingData, organizationId })
      ).unwrap();
  
      const meetingId = res?.meeting?.id;
  
      let invitesSent = false;

      if (meetingId && selectedMembers.length > 0) {
        invitesSent = await sendInvites(meetingId);
      }


      // Toast feedback
      if (selectedMembers.length === 0) {
        toast.success("Meeting created successfully");
      } else if (invitesSent) {
        toast.success(`Meeting created and ${selectedMembers.length} invite${selectedMembers.length > 1 ? "s" : ""} sent`);
      } else {
        toast.success("Meeting created, but invites failed to send");
      }
  
      // reset
      setSelectedMembers([]);
      setMeetingForm({
        topic: '',
        start_time: '',
        duration: 30,
        agenda: '',
        password: '',
        waiting_room: false,
        auto_recording: 'none',
        join_before_host: true,
        audio: true,
        video: false,
      });
  
      onClose();
      setTimeout(() => setShowRecordingInfoModal(true), 300);
      dispatch(getZoomMeetings(organizationId));
  
    } catch (error) {
      console.error('Failed to create meeting:', error);
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
      waiting_room: false,
      auto_recording: 'none',
      join_before_host: true,
      audio: true,  
      video: false, 
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen  px-4 py-6 text-center">
        <div 
          className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity" 
          aria-hidden="true"
          // onClick={handleClose}
        ></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="
          relative inline-flex flex-col
          bg-white rounded-lg text-left shadow-2xl transform transition-all
          w-full max-w-lg
          sm:my-8
          max-h-[90vh]
          overflow-hidden
        ">
          
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <h3 className="text-xl font-semibold text-gray-900" id="modal-title">
              Create Zoom Meeting
            </h3>
          </div>

          {/* Scrollable Content */}
          <form onSubmit={handleCreateMeeting} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-5">
                
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Topic <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="topic"
                    name="topic"
                    required
                    className="mt-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-lg px-3 py-2 transition-colors"
                    placeholder="Enter meeting topic"
                    value={meetingForm.topic}
                    onChange={handleMeetingFormChange}
                  />
                </div>

                <div>
                  <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="start_time"
                    name="start_time"
                    required
                    className="mt-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-lg px-3 py-2 transition-colors"
                    value={meetingForm.start_time}
                    onChange={handleMeetingFormChange}
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    min="1"
                    max="1440"
                    className="mt-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-lg px-3 py-2 transition-colors"
                    value={meetingForm.duration}
                    onChange={handleMeetingFormChange}
                  />
                </div>

                <div>
                  <label htmlFor="agenda" className="block text-sm font-medium text-gray-700 mb-1">
                    Agenda
                  </label>
                  <textarea
                    id="agenda"
                    name="agenda"
                    rows="3"
                    className="mt-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-lg px-3 py-2 transition-colors resize-none"
                    placeholder="Enter meeting agenda..."
                    value={meetingForm.agenda}
                    onChange={handleMeetingFormChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invite Members (optional)
                  </label>

                  <div 
                    ref={memberListRef}
                    className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto"
                  >
                    {membersLoading ? (
                      <p className="text-sm text-gray-500 p-3">Loading members...</p>
                    ) : members.length === 0 ? (
                      <p className="text-sm text-gray-500 p-3">No members found</p>
                    ) : (
                      <>
                        {members.map(member => (
                          <label
                            key={member.id}
                            className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            <input
                              type="checkbox"
                              checked={selectedMembers.includes(member.id)}
                              onChange={() => toggleMember(member.id)}
                              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                            />

                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm text-gray-900 truncate">
                                {member.name || member.email}
                              </span>
                              {member.name && (
                                <span className="text-xs text-gray-500 truncate">
                                  {member.email}
                                </span>
                              )}
                            </div>
                          </label>
                        ))}

                        {isFetchingMore && (
                          <p className="text-xs text-gray-500 px-3 py-2 text-center">
                            Loading more...
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {selectedMembers.length > 0 && (
                    <p className="text-xs text-indigo-600 font-medium mt-1.5">
                      {selectedMembers.length} member{selectedMembers.length > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Password (Optional)
                  </label>
                  <input
                    type="text"
                    id="password"
                    name="password"
                    className="mt-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-lg px-3 py-2 transition-colors"
                    placeholder="Enter meeting password"
                    value={meetingForm.password}
                    onChange={handleMeetingFormChange}
                  />
                </div>

                <div>
                  <label htmlFor="auto_recording" className="block text-sm font-medium text-gray-700 mb-1">
                    Auto Recording
                  </label>
                  <select
                    id="auto_recording"
                    name="auto_recording"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 
                              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                              sm:text-sm rounded-lg transition-colors"
                    value={meetingForm.auto_recording}
                    onChange={handleMeetingFormChange}
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
                    <p className="mt-1.5 text-xs text-gray-500">
                      Cloud recording is available only for Licensed or On-Prem Zoom accounts.
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center">
                    <input
                      id="waiting_room"
                      name="waiting_room"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={meetingForm.waiting_room}
                      onChange={handleMeetingFormChange}
                    />
                    <label htmlFor="waiting_room" className="ml-2.5 block text-sm text-gray-700">
                      Enable Waiting Room
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="join_before_host"
                      name="join_before_host"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={meetingForm.join_before_host}
                      onChange={handleMeetingFormChange}
                    />
                    <label htmlFor="join_before_host" className="ml-2.5 block text-sm text-gray-700">
                      Enable Join Before Host
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="audio"
                      name="audio"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={meetingForm.audio}
                      onChange={handleMeetingFormChange}
                    />
                    <label htmlFor="audio" className="ml-2.5 block text-sm text-gray-700">
                      Enable Audio <span className="text-xs text-gray-500">(default ON)</span>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="video"
                      name="video"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={meetingForm.video}
                      onChange={handleMeetingFormChange}
                    />
                    <label htmlFor="video" className="ml-2.5 block text-sm text-gray-700">
                      Enable Video <span className="text-xs text-gray-500">(default OFF)</span>
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* Fixed Footer */}
            <div className="sticky bottom-0 z-10 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={zoomLoading || !meetingForm.topic.trim() || !meetingForm.start_time}
                className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {zoomLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Meeting'
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );

  
};

export default CreateMeetingModal;