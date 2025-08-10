'use client';

import { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';


export default function AddEventModal({
  isOpen,
  onClose,
  initialDate,
  initialEndDate,
  organizations = [],
  onEventCreated,
  getAuthHeaders,
  makeApiCall,
  isZoomConnected
}) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('personal');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [createZoom, setCreateZoom] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [startAmpm, setStartAmpm] = useState('AM');

  const [endHour, setEndHour] = useState('10');
  const [endMinute, setEndMinute] = useState('00');
  const [endAmpm, setEndAmpm] = useState('AM');


  useEffect(() => {
    if (initialDate) {
      const localStart = new Date(initialDate);
      setSelectedDate(new Date(localStart));
  
      const hours = String(localStart.getHours()).padStart(2, '0');
      const minutes = String(localStart.getMinutes()).padStart(2, '0');
      setStartHour(((localStart.getHours() % 12) || 12).toString().padStart(2, '0'));
      setStartMinute(minutes);
      setStartAmpm(localStart.getHours() >= 12 ? 'PM' : 'AM');
    }
  
    if (initialEndDate) {
      const localEnd = new Date(initialEndDate);
      const hours = String(localEnd.getHours()).padStart(2, '0');
      const minutes = String(localEnd.getMinutes()).padStart(2, '0');
      setEndHour(((localEnd.getHours() % 12) || 12).toString().padStart(2, '0'));
      setEndMinute(minutes);
      setEndAmpm(localEnd.getHours() >= 12 ? 'PM' : 'AM');
    }
  }, [initialDate, initialEndDate]);
  

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEventType('personal');
    setSelectedOrg('');
    setCreateZoom(false);
    setSelectedDate(new Date());
    setStartHour('09');
    setStartMinute('00');
    setStartAmpm('AM');
    setEndHour('10');
    setEndMinute('00');
    setEndAmpm('AM');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const convertToUTCISOString = (dateObj, hourStr, minuteStr, ampmStr) => {
    let hour = parseInt(hourStr, 10);
    if (ampmStr === 'PM' && hour !== 12) hour += 12;
    if (ampmStr === 'AM' && hour === 12) hour = 0;

    const dt = new Date(dateObj);
    dt.setHours(hour);
    dt.setMinutes(parseInt(minuteStr, 10));
    dt.setSeconds(0);
    dt.setMilliseconds(0);
    return dt.toISOString();
  };

  const toLocalDateInputValue = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!title.trim()) {
      toast.error('Please enter a title.');
      return;
    }
  
    if (!description.trim()) {
      toast.error('Please enter a description.');
      return;
    }
  
    if (!startHour || !startMinute || !startAmpm || !endHour || !endMinute || !endAmpm) {
      toast.error('Please select valid time ranges.');
      return;
    }
  
    if (eventType === 'organization' && !selectedOrg) {
      toast.error('Please select an organization.');
      return;
    }
  
    try {
      setLoading(true);
  
      const payload = {
        title,
        description,
        start_time: convertToUTCISOString(selectedDate, startHour, startMinute, startAmpm),
        end_time: convertToUTCISOString(selectedDate, endHour, endMinute, endAmpm),
        event_type: eventType,
        ...(eventType === 'organization' && { org_id: selectedOrg }),
      };
  
      const endpoint =
        createZoom && eventType === 'organization'
          ? '/calendar/events/create-with-meeting/'
          : '/calendar/events/';
  
      // Use API_BASE_URL. Make sure NEXT_PUBLIC_API_BASE_URL does NOT end with a trailing slash.
      const res = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
  
      onEventCreated?.(res.data);
      toast.success('Event created successfully!');
      resetForm();
      onClose();
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.error?.type === 'overlap_error') {
        toast('Another event overlaps with this time range.', {
          icon: '⚠️',
          style: {
            borderRadius: '8px',
            background: '#000',
            color: '#ffcc00',
          },
        });
      } else {
        console.error('Failed to create event:', errorData || err.message);
        toast.error('Failed to create event.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity" />
        </Transition.Child>
  
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                    Add New Event
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
  
                <div className="space-y-4">
                  {/* Title */}
                  <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
  
                  {/* Description */}
                  <textarea
                    placeholder="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    rows={3}
                  />
  
                  {/* Date */}
                  <div className="flex items-center justify-between text-sm text-gray-700">
                    <span>
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                    <input
                      type="date"
                      value={toLocalDateInputValue(selectedDate)}
                      onChange={(e) => {
                        const [year, month, day] = e.target.value.split('-').map(Number);
                        const newDate = new Date(selectedDate);
                        newDate.setFullYear(year, month - 1, day);
                        setSelectedDate(newDate);
                      }}
                      className="border rounded px-2 py-1 text-sm"
                    />
                  </div>
  
                  {/* Time Pickers */}
                  <div className="flex gap-4">
                    {[
                      { label: 'From', hour: startHour, setHour: setStartHour, minute: startMinute, setMinute: setStartMinute, ampm: startAmpm, setAmpm: setStartAmpm },
                      { label: 'To', hour: endHour, setHour: setEndHour, minute: endMinute, setMinute: setEndMinute, ampm: endAmpm, setAmpm: setEndAmpm }
                    ].map(({ label, hour, setHour, minute, setMinute, ampm, setAmpm }) => (
                      <div className="flex flex-col w-1/2" key={label}>
                        <label className="text-sm mb-1">{label}</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min={1}
                            max={12}
                            value={hour}
                            onChange={(e) => setHour(e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                          <input
                            type="number"
                            min={0}
                            max={59}
                            value={minute}
                            onChange={(e) => setMinute(e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                          <select
                            value={ampm}
                            onChange={(e) => setAmpm(e.target.value)}
                            className="w-full border rounded px-2 py-1 text-sm"
                          >
                            <option>AM</option>
                            <option>PM</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
  
                  {/* Timezone */}
                  <p className="text-xs text-gray-500 mt-1">
                    Your timezone: <span className="font-medium">{userTimeZone}</span>
                  </p>
  
                  {/* Event Type */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700">Event Type</label>
                    <select
                      className="border rounded-md px-3 py-2 text-sm"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                    >
                      <option value="personal">Personal</option>
                      <option value="organization">Organization</option>
                    </select>
                  </div>
  
                  {/* Org + Zoom */}
                  {eventType === 'organization' && (
                    <>
                      <select
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={selectedOrg}
                        onChange={e => setSelectedOrg(e.target.value)}
                      >
                        <option value="">Select organization</option>
                        {organizations.map((org) => (
                          <option key={org.org_id} value={org.org_id}>{org.name}</option>
                        ))}
                      </select>
  
                      <label
                        className={`inline-flex items-center space-x-2 text-sm mt-2 transition-opacity ${
                          !isZoomConnected ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={createZoom}
                          onChange={e => setCreateZoom(e.target.checked)}
                          className="rounded"
                          disabled={!isZoomConnected}
                        />
                        <span className="flex items-center gap-1">
                          <img
                            src="/images/zoom02.png"
                            alt="Zoom"
                            className="w-4 h-4 object-contain"
                          />
                          <span>Create Zoom Meeting</span>
                        </span>
                      </label>

                      {!isZoomConnected && (
                        <button
                          type="button"
                          onClick={() => window.location.href = '/configure-meeting-tools'}
                          className="mt-1 ml-6 text-xs text-blue-600 hover:underline"
                        >
                          Connect Zoom
                        </button>
                      )}
                    </>
                  )}
  
                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={
                        loading ||
                        !title.trim() ||
                        !description.trim() ||
                        !startHour || !startMinute || !endHour || !endMinute ||
                        (eventType === 'organization' && !selectedOrg)
                      }
                      className={`px-4 py-2 text-sm rounded-md text-white ${
                        loading ||
                        !title.trim() ||
                        !description.trim() ||
                        !startHour || !startMinute || !endHour || !endMinute ||
                        (eventType === 'organization' && !selectedOrg)
                          ? 'bg-indigo-300 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {loading ? 'Saving...' : 'Create Event'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
