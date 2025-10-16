'use client';

import React, { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSelector, useDispatch } from 'react-redux';

import toast from 'react-hot-toast';
import AddEventModal from '../modals/AddEventModal';
import EditEventModal from '../modals/EditEventModal';
import SearchEventsComponent from '../SearchEventsComponent';
import EventReportsComponent from '../EventReportsComponent';
import OrgAddEventModal from './OrgAddEventModal';
import OrgSearchEventsComponent from './OrgSearchEventsComponent';
import OrgEventReportsComponent from './OrgEventReportsComponent';
import { getZoomConnectionStatus, selectZoomIsConnected } from '@/redux/auth/zoomSlice';
import axios from 'axios';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ORG_COLORS } from '@/app/constants/orgColors';





export default function OrgCalendar({ orgId }) {

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


    const dispatch = useDispatch();
    const isZoomConnected = useSelector(selectZoomIsConnected);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState('dayGridMonth');
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [apiEvents, setApiEvents] = useState([]);
    const [orgColors, setOrgColors] = useState({});
    const [loadingOrgs, setLoadingOrgs] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addEventDate, setAddEventDate] = useState(null);
    const [addEventStart, setAddEventStart] = useState(null);
    const [addEventEnd, setAddEventEnd] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [eventBeingEdited, setEventBeingEdited] = useState(null);

    const [orgName, setOrgName] = useState('');


    const [isEditMode, setIsEditMode] = useState(false);
    const [eventToEdit, setEventToEdit] = useState(null);

    const calendarRef = useRef(null);
    const [activeTab, setActiveTab] = useState('dayGridMonth');
    const [calendarTitle, setCalendarTitle] = useState('');

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    

    const authToken = useSelector((state) => state.auth?.token);


    const tabBtnClass = (type) =>
      `px-3 py-1 rounded text-sm ${
        activeTab === type
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`;


      const goPrev = () => {
        const api = calendarRef.current?.getApi();
        api?.prev();
        updateTitle();
      };
      
      const goNext = () => {
        const api = calendarRef.current?.getApi();
        api?.next();
        updateTitle();
      };
      
      const goToday = () => {
        const api = calendarRef.current?.getApi();
        api?.today();
        updateTitle();
      };
      
      const changeView = (viewType) => {
        const api = calendarRef.current?.getApi();
        api?.changeView(viewType);
        setActiveTab(viewType);
        updateTitle();
      };

      useEffect(() => {
        if (activeTab === "search" || activeTab === "reports") {
          setCalendarTitle(null);
        } else {
          updateTitle();
        }
      }, [activeTab]);
      
      const updateTitle = () => {
        const api = calendarRef.current?.getApi();
      
        if (!api) return;
      
        if (activeTab === "search" || activeTab === "reports") {
          setCalendarTitle(null);
        } else {
          setCalendarTitle(api.view.title);
        }
      };


      // Check connection status on component mount
      useEffect(() => {
        if (isInitialLoad) {
          dispatch(getZoomConnectionStatus()).finally(() => {
            setIsInitialLoad(false);
          });
        }
      }, [dispatch, isInitialLoad]);


    // Helper function to get auth headers (following your Redux pattern)
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

  // Enhanced API call with retry logic and proper timeout
  const makeApiCall = async (url, options = {}, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt} for ${url}`);
        console.log('Request options:', options);
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 200000); // 30 second timeout
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        console.log(`Response status: ${response.status} for ${url}`);

        // If we get a 502, wait and retry
        if (response.status === 502 && attempt < maxRetries) {
          console.log(`502 error on attempt ${attempt}, retrying in ${attempt * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }

        return response;
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt} failed for ${url}:`, error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        // Handle different types of errors
        if (error.name === 'AbortError') {
          console.log('Request timed out');
        }
        
        // If it's a network error and we have retries left, wait and retry
        if (attempt < maxRetries && (
          error.name === 'TypeError' || 
          error.name === 'AbortError' || 
          error.message.includes('fetch') ||
          error.message.includes('network')
        )) {
          console.log(`Network error on attempt ${attempt}, retrying in ${attempt * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }
        
        // If it's the last attempt or a non-retryable error, throw
        throw error;
      }
    }
    
    throw lastError;
  };

  const fetchOrg = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/organisations/${orgId}/`);
      setOrgName(res.data.name);
    } catch (err) {
      console.error('Failed to fetch organization:', err);
      setOrgName('Unknown');
    }
  };
      



  useEffect(() => {
    console.log("Org Id:", orgId);
  
    const fetchOrganizationsAndEvents = async () => {
      try {
        setLoadingOrgs(true);
        setLoadingEvents(true);
  
        // Fetch organizations
        const orgResponse = await axios.get(`${API_BASE_URL}/organisations/my-organisations/`);
        const orgs = orgResponse.data || [];
        setOrganizations(orgs);
  
        const orgColorMap = generateOrgColors(orgs);
        setOrgColors(orgColorMap);
        setLoadingOrgs(false);
  
        // Fetch events
        const eventResponse = await axios.get(`${API_BASE_URL}/calendar/all-events/`);
        const { events: rawEvents } = eventResponse.data;
  
        const enriched = rawEvents.map(event => {
          const orgName = event.organisation_name;
          const isCurrentOrg = event.organisation_id === orgId;
  
          const base = {
            id: event.id,
            start: event.start,
            end: event.end,
            backgroundColor: isCurrentOrg ? orgColorMap[orgName] || '#6b7280' : '#9CA3AF',
            borderColor: isCurrentOrg ? orgColorMap[orgName] || '#6b7280' : '#9CA3AF',
            textColor: '#fff',
            extendedProps: {
              title: event.title,
              description: event.description,
              join_url: event.meeting?.join_url || null,
              organization: isCurrentOrg ? orgName : 'Occupied',
              event_type: event.event_type,
              organisation_id: event.org_id,
              organisation_name: orgName,
              isOccupiedEvent: !isCurrentOrg
            }
          };
  
          return isCurrentOrg
            ? { ...base, title: event.title }
            : { ...base, title: 'Occupied Slot' };
        });
  
        console.log("enriched events:", enriched);
        setApiEvents(enriched);
  
        setLoadingEvents(false);
      } catch (error) {
        console.error('Error fetching organizations and events:', error);
        setLoadingOrgs(false);
        setLoadingEvents(false);
      }
    };
  
    fetchOrg(); // your already-refactored function
    fetchOrganizationsAndEvents();
  }, []);

  const generateOrgColors = (orgs) => {
    const colorMap = {};
    const usedColors = new Set();
  
    // 1️⃣ Use backend-provided color if valid
    orgs.forEach(org => {
      if (org.color && /^#[0-9A-F]{6}$/i.test(org.color)) {
        colorMap[org.name] = org.color;
        usedColors.add(org.color);
      }
    });
  
    // 2️⃣ Assign fallback unique colors for missing/invalid ones
    let colorIndex = 0;
    orgs.forEach(org => {
      if (!colorMap[org.name]) {
        while (colorIndex < ORG_COLORS.length && usedColors.has(ORG_COLORS[colorIndex])) {
          colorIndex++;
        }
        const assignedColor = ORG_COLORS[colorIndex % ORG_COLORS.length];
        colorMap[org.name] = assignedColor;
        usedColors.add(assignedColor);
        colorIndex++;
      }
    });
  
    return colorMap;
  };


    // const generateOrgColors = (orgs) => {
    //   const tailwindColors = [
    //     '#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
    //     '#3b82f6', '#14b8a6', '#ef4444', '#a855f7', '#f97316'
    //   ];
    //   const colorMap = {};
    //   orgs.forEach((org, idx) => {
    //     colorMap[org.name] = tailwindColors[idx % tailwindColors.length];
    //   });
    //   return colorMap;
    // };
    
    // const orgColors = generateOrgColors(organizations);

    // Full calendar clicks.

    const handleCalendarDateClick = (info) => {
      setAddEventDate(info.dateStr);
      setIsAddModalOpen(true);
    };

    const handleTimeRangeSelect = (info) => {
      setAddEventDate(info.startStr); // Sets start time
      setIsAddModalOpen(true);
    };

    const parseDateStrAsLocal = (s) => {
      if (!s) return null;
      // date-only "YYYY-MM-DD" -> construct local-midnight
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split('-').map(Number);
        return new Date(y, m - 1, d); // local midnight
      }
      // otherwise let Date parse (it will respect time & offset if present)
      return new Date(s);
    };
    
    const handleCalendarSelect = (info) => {
      let start = info.start instanceof Date ? new Date(info.start) : parseDateStrAsLocal(info.startStr);
      let end = info.end instanceof Date ? new Date(info.end) : parseDateStrAsLocal(info.endStr);
    
      const timeOfDay = (date) =>
        date.getHours() * 3600000 +
        date.getMinutes() * 60000 +
        date.getSeconds() * 1000 +
        date.getMilliseconds();
    
      // Always adjust for month view: force 30 min slot
      if (info.view.type === "dayGridMonth") {
        end = new Date(start.getTime() + 30 * 60 * 1000);
      } else {

        // If start === end (zero length) make it 30 minutes
        if (start.getTime() === end.getTime()) {
          end = new Date(start.getTime() + 30 * 60 * 1000);
        } else {

          // If time-of-day is equal but the span is < 24h, treat as a slot selection and give 30 mins
          const span = end.getTime() - start.getTime();
          if (timeOfDay(start) === timeOfDay(end) && span > 0 && span < 24 * 3600000) {
            end = new Date(start.getTime() + 30 * 60 * 1000);
          }
        }
      }
    
      setAddEventStart(start);
      setAddEventEnd(end);
      setIsAddModalOpen(true);
    
      
    };

    const handleEventDrop = async (info) => {
      const { event } = info;

      if (event.extendedProps?.isOccupiedEvent) {
        toast.error("Occupied slots cannot be moved or updated.");
        info.revert();
        return;
      }

      try {

        const endDate = event.end ? event.end : new Date(event.start.getTime() + 30 * 60 * 1000);

        const updatedData = {
          start_time: event.start.toISOString(),
          end_time: event.end.toISOString(),
        };

        const res = await axios.patch(
          `${API_BASE_URL}/calendar/events/${event.id}/`,
          updatedData
        );

        const updatedEvent = res.data;

        setApiEvents((prev) =>
          prev.map((evt) =>
            evt.id === event.id
              ? { ...evt, start: updatedEvent.start, end: updatedEvent.end }
              : evt
          )
        );

        toast.success('Event updated successfully');
      } catch (err) {
        if (err.response?.data?.error?.type === 'overlap_error') {
          toast(err.response.data.error.message || 'Another event overlaps with this time range.', {
            icon: '⚠️',
            style: {
              borderRadius: '8px',
              background: '#000',
              color: '#ffcc00',
            },
          });
        } else {
          toast.error('Failed to update event');
        }
        info.revert();
      }
    };
    
    const handleEventResize = handleEventDrop;

    const handleDelete = async (eventId) => {
      const confirmed = window.confirm("Are you sure you want to delete this event?");
      if (!confirmed) return;
    
      try {
        await axios.delete(`${API_BASE_URL}/calendar/events/${eventId}/`);
    
        setApiEvents(prev => prev.filter(event => String(event.id) !== String(eventId)));
        toast.success("Event deleted successfully");
        setIsEventModalOpen(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete event");
      }
    };

    
    const today = new Date();

    const skeletonEvents = Array.from({ length: 30 }, (_, i) => {
      const eventDate = new Date(today);
      const dayOffset = Math.floor(i / 2); // Two events per day
      const hourOffset = i % 2 === 0 ? 9 : 14; // 9 AM and 2 PM
    
      eventDate.setDate(today.getDate() + dayOffset);
      eventDate.setHours(hourOffset, 0, 0, 0);
    
      const endDate = new Date(eventDate);
      endDate.setHours(hourOffset + 1);
    
      return {
        id: `skeleton-${i}`,
        title: 'Loading...',
        start: eventDate.toISOString(),
        end: endDate.toISOString(),
        display: 'block',
        backgroundColor: '#e5e7eb', // Tailwind gray-200
        borderColor: '#e5e7eb',
        textColor: 'transparent',
        extendedProps: {
          isSkeleton: true
        }
      };
    });


    const handleEventClick = (info) => {
        setSelectedEvent({
          id: info.event.id,
          title: info.event.title,
          event_type: info.event.extendedProps.event_type,
          organization: info.event.extendedProps.organization,
          isOccupiedEvent: info.event.extendedProps.isOccupiedEvent,
          join_url: info.event.extendedProps.join_url,
          start: info.event.start,
          end: info.event.end,
          description: info.event.extendedProps.description,
          color: orgColors[info.event.extendedProps.organization]

        });
        setIsEventModalOpen(true);
    };
  
    const handleDateClick = (date) => {
      calendarRef.current.getApi().gotoDate(date);
      calendarRef.current.getApi().changeView('timeGridDay');
      setIsSidebarOpen(false)
    };
  
    const handleViewChange = (view) => {
      setCurrentView(view);
      if (window.innerWidth < 768 && view !== 'timeGridDay') {
        calendarRef.current.getApi().changeView('timeGridDay');
      }
    };
  
    const renderMiniCalendar = () => {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
      const weeks = [];
      let days = [];
  
      // Fill in the blanks for the first week
      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
      }
  
      // Add the days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === new Date().toDateString();
        const isSelected = date.toDateString() === currentDate.toDateString();
        
        days.push(
          <div 
            key={`day-${day}`}
            onClick={() => handleDateClick(date)}
            className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-sm
              ${isToday ? 'bg-blue-100 font-medium text-blue-800' : ''}
              ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}
            `}
          >
            {day}
          </div>
        );
  
        if (days.length === 7 || day === daysInMonth) {
          weeks.push(
            <div key={`week-${day}`} className="grid grid-cols-7 gap-1">
              {days}
            </div>
          );
          days = [];
        }
      }
  
      // Add weekday headers
      const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
      return (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 space-x-2">
            {/* Previous Year */}
            <button 
              onClick={() => setCurrentDate(new Date(year - 1, month, 1))}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              title="Previous Year"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 15l-5-5 5-5v10z" />
              </svg>
            </button>

            {/* Previous Month */}
            <button 
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              title="Previous Month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Month & Editable Year */}
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium text-gray-700">{monthName}</span>
              <input
                type="number"
                min="1900"
                max="2100"
                value={year}
                onChange={(e) => {
                  const newYear = parseInt(e.target.value, 10);
                  if (!isNaN(newYear)) {
                    setCurrentDate(new Date(newYear, month, 1));
                  }
                }}
                className="w-16 px-1 py-0.5 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Next Month */}
            <button 
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              title="Next Month"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Next Year */}
            <button 
              onClick={() => setCurrentDate(new Date(year + 1, month, 1))}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              title="Next Year"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 5l5 5-5 5V5z" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1 text-center text-xs text-gray-500 font-medium">
            {weekdays.map((day, i) => (
              <div key={i}>{day}</div>
            ))}
          </div>
          <div className="space-y-1">
            {weeks}
          </div>
        </div>
      );
    };
  
    return (
      <div className="flex flex-col h-screen border-t border-gray-200">
        <Transition appear show={isEventModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsEventModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {/* <div className="fixed inset-0 bg-gray-500/20 backdrop-blur-sm" /> */}
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
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: selectedEvent?.color }}
                      />
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold leading-6 text-gray-900 flex items-center gap-2"
                      >
                        {selectedEvent?.title}
                        {selectedEvent?.join_url && !selectedEvent?.isOccupiedEvent && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Zoom Meeting
                          </span>
                        )}
                      </Dialog.Title>
                    </div>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setIsEventModalOpen(false)}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="mt-6 space-y-5">
                    {/* Organization (skip for skeleton) */}
                    {!selectedEvent?.isOccupiedEvent && selectedEvent?.organization !== 'Personal' && (
                      <div className="flex items-start">
                        <div className="w-24 text-sm text-gray-500">Organization</div>
                        <div className="text-sm text-gray-900">{selectedEvent?.organization}</div>
                      </div>
                    )}

                    {/* When */}
                    <div className="flex items-start">
                      <div className="w-24 text-sm text-gray-500">When</div>
                      <div className="text-sm text-gray-900">
                        {selectedEvent?.start?.toLocaleString()}
                        {selectedEvent?.end && (
                          <>
                            <br />
                            to {selectedEvent.end.toLocaleString()}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    {!selectedEvent?.isOccupiedEvent && selectedEvent?.description && (
                      <div className="flex items-start">
                        <div className="w-24 text-sm text-gray-500">Details</div>
                        <div className="text-sm text-gray-900">{selectedEvent.description}</div>
                      </div>
                    )}

                    {/* Join URL */}
                    {!selectedEvent?.isOccupiedEvent && selectedEvent?.join_url && (
                      <div className="flex items-start">
                        <div className="w-24 text-sm text-gray-500">Join URL</div>
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          <a
                            href={selectedEvent.join_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                            title={selectedEvent.join_url}
                          >
                            {selectedEvent.join_url}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer buttons */}
                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                      onClick={() => setIsEventModalOpen(false)}
                    >
                      Close
                    </button>

                    {/* Hide Edit/Delete for skeleton */}
                    {!selectedEvent?.isOccupiedEvent && (
                      <>
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                          onClick={() => {
                            setIsEventModalOpen(false);
                            setTimeout(() => {
                              setEventBeingEdited(selectedEvent);
                              setIsEditModalOpen(true);
                            }, 100);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                          onClick={() => {
                            handleDelete(selectedEvent.id);
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </Dialog.Panel>


              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

        <div className="flex flex-1 overflow-hidden">

          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-[rgba(0,0,0,0.3)] transition-opacity z-30 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}


          {/* Sidebar */}
          <div
            className={`fixed md:static top-20 left-0 h-full w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto z-40 transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          >
            <div className="mb-6">
              {renderMiniCalendar()}
            </div>
  
            <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Organization
                </h3>

                {loadingOrgs ? (
                  <div className="space-y-2">
                    {[...Array(1)].map((_, i) => (
                      <div key={i} className="flex items-center px-2 py-1.5 animate-pulse">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-300 mr-2.5 flex-shrink-0"></div>
                        <div className="h-3 w-24 bg-gray-300 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  organizations
                    .filter((org) => org.org_id === orgId)
                    .map((org) => (
                      <div
                        key={org.id}
                        className="flex items-center px-2 py-1.5 rounded bg-gray-100 cursor-default"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full mr-2.5 flex-shrink-0"
                          style={{ backgroundColor: orgColors[org.name] }}
                        ></div>
                        <span className="text-sm text-gray-700 truncate">{org.name}</span>
                      </div>
                    ))
                )}
              </div>

          </div>

          {/* Floating Toggle Button for Mobile */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden fixed bottom-6 right-6 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition z-50"
          >
            {isSidebarOpen ? <X size={20} /> : <CalendarIcon size={20} />}
          </button>

  
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">

          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              
              {/* Left: Org info */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  <span className="bg-gradient-to-r from-[#0A0DC4] via-[#5A0DB4] to-[#8B0782] bg-clip-text text-transparent">
                    {orgName} Calendar
                  </span>
                  
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Org ID: <span className="font-mono">{orgId}</span>
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {currentDate.toLocaleDateString('default', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Right: Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const api = calendarRef.current.getApi();
                    api.changeView('timeGridDay', new Date());
                    setActiveTab('timeGridDay');
                    updateTitle();
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-full sm:w-auto"
                >
                  Today
                </button>

                <button
                  onClick={() => {
                    const now = new Date();
                    const rounded = new Date(
                      Math.ceil(now.getTime() / (30 * 60 * 1000)) * (30 * 60 * 1000)
                    );
                    const end = new Date(rounded.getTime() + 30 * 60 * 1000);

                    setAddEventStart(rounded.toISOString());
                    setAddEventEnd(end.toISOString());
                    setIsAddModalOpen(true);
                  }}
                  className="px-5 py-2 text-sm font-semibold text-white rounded-md transition-colors w-full sm:w-auto"
                  style={{ backgroundColor: '#2C3E50' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#1E2B37')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = '#2C3E50')
                  }
                >
                  + Add Event
                </button>
              </div>

            </div>
          </div>
  
            <div className="flex-1 overflow-auto p-4">

            <div className="flex flex-col sm:flex-row flex-wrap sm:items-center sm:justify-between mb-4 gap-3">
                  {/* Left: View switcher */}
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button onClick={() => changeView('dayGridMonth')} className={tabBtnClass('dayGridMonth')}>Month</button>
                    <button onClick={() => changeView('timeGridWeek')} className={tabBtnClass('timeGridWeek')}>Week</button>
                    <button onClick={() => changeView('timeGridDay')} className={tabBtnClass('timeGridDay')}>Day</button>
                    <button onClick={() => changeView('listWeek')} className={tabBtnClass('listWeek')}>List</button>
                    <button onClick={() => setActiveTab('search')} className={tabBtnClass('search')}>Search</button>
                    <button onClick={() => setActiveTab('reports')} className={tabBtnClass('reports')}>Reports</button>
                  </div>

                  {/* Center: Title */}
                  <div className="text-lg font-semibold text-gray-800 text-center sm:text-left">
                    {calendarTitle}
                  </div>

                  {/* Right: Navigation */}
                  {activeTab !== "search" && activeTab !== "reports" && (
                    <div className="flex gap-2 justify-center sm:justify-end">
                      <button
                        onClick={goPrev}
                        className="flex items-center gap-1 text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      >
                        <ChevronLeft size={16} />
                        Prev
                      </button>

                      <button
                        onClick={goNext}
                        className="flex items-center gap-1 text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                      >
                        Next
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}

            </div>

            {activeTab === 'search' && (
              <div className="p-4 bg-white shadow rounded">
                <h2 className="text-xl font-semibold mb-2">Search Events</h2>
                <OrgSearchEventsComponent
                  orgId={orgId}
                  orgName={orgName}
                  makeApiCall={makeApiCall}
                  getAuthHeaders={getAuthHeaders}
                  handleEventClick={handleEventClick}
                  orgColors={orgColors}
                />
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="p-4 bg-white shadow rounded">
                <h2 className="text-xl font-semibold mb-2">Event Reports</h2>
                <OrgEventReportsComponent
                  orgId={orgId}
                  orgName={orgName}
                  makeApiCall={makeApiCall}
                  getAuthHeaders={getAuthHeaders}
                  orgColors={orgColors}
                />
              </div>
            )}

            {['dayGridMonth', 'timeGridWeek', 'timeGridDay', 'listWeek'].includes(activeTab) && (
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                  initialView={activeTab}
                  headerToolbar={false}
                  viewDidMount={(view) => {
                    setActiveTab(view.view.type);
                    updateTitle();
                  }}
                  datesSet={() => {
                    updateTitle(); // every navigation
                  }}
                  height="100%"
                  selectable={true}
                  select={handleCalendarSelect}
                  nowIndicator={true}
                  editable={true}
                  eventResizableFromStart={true}
                  eventDrop={handleEventDrop}
                  eventResize={handleEventResize}
                  dayMaxEvents={1} // This limits visible events to 1 before showing "+X more"
                  eventDisplay="block"
                  events={loadingEvents ? skeletonEvents : apiEvents}
                  eventContent={(arg) => {
                    const isSkeleton = arg.event.extendedProps.isSkeleton;
                  
                    return (
                      <div className="fc-event-main-frame">
                        <div className={`fc-event-title-container ${isSkeleton ? 'animate-pulse' : ''}`}>
                          <div className="fc-event-title fc-sticky p-1">
                            <div className={`font-medium text-sm truncate ${isSkeleton ? 'bg-gray-200 h-3 w-24 rounded' : ''}`}>
                              {!isSkeleton && arg.event.title}
                            </div>
                            {!isSkeleton && (
                              <div className="text-xs font-light mt-0.5 opacity-90 truncate">
                                {arg.event.extendedProps.organization}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }}
                  // This ensures the popover shows all events properly
                  moreLinkContent={(arg) => {
                    return `+${arg.num} more`;
                  }}
                  // Optional: Customize the popover appearance
                  dayMaxEventRows={true}
                  popoverContent={(arg) => {
                    return (
                      <div className="p-2">
                        {arg.events.map((event) => (
                          <div 
                            key={event.id}
                            className="mb-2 p-2 rounded"
                            style={{
                              backgroundColor: event.backgroundColor,
                              borderColor: event.borderColor,
                              color: event.textColor
                            }}
                          >
                            <div className="font-medium">{event.title}</div>
                            <div className="text-xs opacity-90">{event.extendedProps.organization}</div>
                            {event.extendedProps.description && (
                              <div className="text-xs mt-1 opacity-80">{event.extendedProps.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  }}
                  eventClick={(info) => {
                    if (info.event.extendedProps.isSkeleton) return; // prevent modal open
                  
                  
                    // Trigger an outside click (some FC versions close popover on document click)
                    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                  
                    // Small delay to allow any FC internal handlers to finish and DOM to settle,
                    
                    setTimeout(() => {
                     
                      handleEventClick(info);
                    }, 40); 
                  }}
                  // windowResize={(arg) => {
                  //   if (window.innerWidth < 768 && currentView !== 'timeGridDay') {
                  //     arg.view.calendar.changeView('timeGridDay');
                  //   }
                  // }}
              />
            )}
            
              

              <OrgAddEventModal
                isZoomConnected={isZoomConnected}
                isOpen={isAddModalOpen}
                onClose={() => {
                  setIsAddModalOpen(false);
                  setEventToEdit(null);
                  setIsEditMode(false);
                }}
                orgId={orgId}
                orgName={orgName}
                initialDate={addEventStart}
                initialEndDate={addEventEnd}
                organizations={organizations}
                isEdit={isEditMode}
                eventToEdit={eventToEdit}
                getAuthHeaders={getAuthHeaders}
                makeApiCall={makeApiCall}
                onEventCreated={(newEvent) => {
                  const orgName = newEvent.organisation_name;

                  const formatted = {
                    id: newEvent.id,
                    title: newEvent.title,
                    start: newEvent.start,
                    end: newEvent.end,
                    organization: newEvent.event_type === 'organization' ? orgName : 'Personal',
                    description: newEvent.description,
                    backgroundColor: orgColors[orgName] || '#6b7280',
                    borderColor: orgColors[orgName] || '#6b7280',
                    textColor: '#fff',
                    extendedProps: {
                      description: newEvent.description,
                      organization: newEvent.event_type === 'organization' ? orgName : 'Personal',
                      join_url: newEvent.meeting?.join_url || null
                    }
                  };

                  setApiEvents((prev) => [...prev, formatted]);
                  setIsAddModalOpen(false);
                }}
                onEventUpdated={(updatedEvent) => {
                  const orgName = updatedEvent.organisation_name;

                  const formatted = {
                    id: updatedEvent.id,
                    title: updatedEvent.title,
                    start: updatedEvent.start,
                    end: updatedEvent.end,
                    organization: updatedEvent.event_type === 'organization' ? orgName : 'Personal',
                    description: updatedEvent.description,
                    backgroundColor: orgColors[orgName] || '#6b7280',
                    borderColor: orgColors[orgName] || '#6b7280',
                    textColor: '#fff',
                    extendedProps: {
                      description: updatedEvent.description,
                      organization: updatedEvent.event_type === 'organization' ? orgName : 'Personal',
                      join_url: updatedEvent.meeting?.join_url || null
                    }
                  };

                  // Replace updated event in local state
                  setApiEvents((prev) =>
                    prev.map((evt) => (evt.id === updatedEvent.id ? formatted : evt))
                  );

                  setIsAddModalOpen(false);
                  setEventToEdit(null);
                  setIsEditMode(false);
                }}
              />


              <EditEventModal
                isOpen={isEditModalOpen}
                onClose={() => {
                  setIsEditModalOpen(false);
                  setEventBeingEdited(null);
                }}
                eventToEdit={eventBeingEdited}
                getAuthHeaders={getAuthHeaders}
                makeApiCall={makeApiCall}
                onEventUpdated={(updatedEvent) => {
                  const orgName = updatedEvent.organisation_name;

                  const formatted = {
                    id: updatedEvent.id,
                    title: updatedEvent.title,
                    start: updatedEvent.start,
                    end: updatedEvent.end,
                    organization: updatedEvent.event_type === 'organization' ? orgName : 'Personal',
                    description: updatedEvent.description,
                    backgroundColor: orgColors[orgName] || '#6b7280',
                    borderColor: orgColors[orgName] || '#6b7280',
                    textColor: '#fff',
                    extendedProps: {
                      description: updatedEvent.description,
                      organization: updatedEvent.event_type === 'organization' ? orgName : 'Personal',
                      join_url: updatedEvent.meeting?.join_url || null
                    }
                  };

                  setApiEvents((prev) =>
                    prev.map((evt) => (evt.id === updatedEvent.id ? formatted : evt))
                  );

                  setIsEditModalOpen(false);
                  setEventBeingEdited(null);
                }}
              />
            
            </div>
          </div>
        </div>
          <style jsx global>{`
            @media (max-width: 640px) {
              /* Month view: make day cells taller */
              .fc-daygrid-day-frame {
                min-height: 110px !important;
              }
              .fc-daygrid-event {
                white-space: normal;
              }

              /* TimeGrid views: make slots taller */
              .fc-timegrid-slot {
                height: 50px !important; /* increase from default 30px */
              }
              .fc-timegrid-slot-lane {
                height: 60px !important;
              }
            }
          `}</style>
      </div>
    );
}
