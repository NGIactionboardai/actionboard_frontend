'use client';

import { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function EditEventModal({
  isOpen,
  onClose,
  eventToEdit,
  getAuthHeaders,
  makeApiCall,
  onEventUpdated
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState('personal');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [startAmpm, setStartAmpm] = useState('AM');

  const [endHour, setEndHour] = useState('10');
  const [endMinute, setEndMinute] = useState('00');
  const [endAmpm, setEndAmpm] = useState('AM');

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || '');
      setDescription(eventToEdit.description || '');
      setEventType(eventToEdit.event_type || 'personal');
      setSelectedOrg(eventToEdit.organisation_id || '');

      console.log("Enriched eventToEdit:", eventToEdit);

      const start = new Date(eventToEdit.start);
      const end = new Date(eventToEdit.end);
      setSelectedDate(start);

      const formatTime = (date, setHour, setMinute, setAmpm) => {
        let hour = date.getHours();
        const minute = date.getMinutes();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        setHour(String(hour).padStart(2, '0'));
        setMinute(String(minute).padStart(2, '0'));
        setAmpm(ampm);
      };

      formatTime(start, setStartHour, setStartMinute, setStartAmpm);
      formatTime(end, setEndHour, setEndMinute, setEndAmpm);
    }
  }, [eventToEdit]);

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

  const handleSubmit = async () => {
    try {
      setLoading(true);
  
      const payload = {
        title,
        description,
        start_time: convertToUTCISOString(selectedDate, startHour, startMinute, startAmpm),
        end_time: convertToUTCISOString(selectedDate, endHour, endMinute, endAmpm)
      };
  
      const headers = getAuthHeaders();
      const url = `https://actionboard-ai-backend.onrender.com/api/calendar/events/${eventToEdit.id}/`;
  
      const res = await makeApiCall(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      });
  
      if (res.ok) {
        const data = await res.json();
        toast.success('Event updated successfully!');
        onEventUpdated?.(data);
        onClose();
      } else {
        console.error('Failed to update event.');
        toast.error('Failed to update event.');
      }
    } catch (err) {
      console.error('Error updating event:', err);
      toast.error('Something went wrong while updating the event.');
    } finally {
      setLoading(false);
    }
  };

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                    Edit Event
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
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
                      value={selectedDate.toISOString().slice(0, 10)}
                      onChange={(e) => setSelectedDate(new Date(e.target.value))}
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

                  <p className="text-xs text-gray-500 mt-1">
                    Your timezone: <span className="font-medium">{userTimeZone}</span>
                  </p>

                  {/* Event Type (disabled) */}
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-700">Event Type</label>
                    <select
                      className="border rounded-md px-3 py-2 text-sm"
                      value={eventType}
                      disabled
                    >
                      <option value="personal">Personal</option>
                      <option value="organization">Organization</option>
                    </select>
                  </div>

                  {/* Organization (disabled) */}
                  {eventType === 'organization' && (
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={selectedOrg}
                      disabled
                    >
                      <option value="">Select organization</option>
                      <option value={selectedOrg}>{eventToEdit?.organisation_name}</option>
                    </select>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
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
