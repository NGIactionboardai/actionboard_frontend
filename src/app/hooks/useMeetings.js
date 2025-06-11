// hooks/useMeetings.js
'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getZoomMeetings,
  getZoomConnectionStatus,
  setCurrentOrganization,
  selectZoomMeetings,
  selectZoomLoading,
  selectZoomError,
  selectZoomIsConnected,
  selectZoomSuccessMessage,
  clearMessages
} from '../../redux/auth/zoomSlice';

export const useMeetings = (organizationId) => {
  const dispatch = useDispatch();
  
  // Redux state
  const zoomMeetings = useSelector(selectZoomMeetings);
  const zoomLoading = useSelector(selectZoomLoading);
  const zoomError = useSelector(selectZoomError);
  const isZoomConnected = useSelector(selectZoomIsConnected);
  const successMessage = useSelector(selectZoomSuccessMessage);

  // Set current organization and check Zoom status on mount
  useEffect(() => {
    if (organizationId) {
      console.log('Setting current organization and checking Zoom status...');
      dispatch(setCurrentOrganization(organizationId));
      dispatch(getZoomConnectionStatus(organizationId));
    }
  }, [dispatch, organizationId]);

  // Fetch meetings when Zoom is connected and organization ID is available
  useEffect(() => {
    if (isZoomConnected && organizationId) {
      console.log('Zoom is connected, loading meetings for org:', organizationId);
      dispatch(getZoomMeetings(organizationId));
    }
  }, [dispatch, isZoomConnected, organizationId]);

  // Clear error messages after 5 seconds
  useEffect(() => {
    if (zoomError) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [zoomError, dispatch]);

  // Handle connection status changes (refresh meetings list on reconnect)
  useEffect(() => {
    if (isZoomConnected && organizationId) {
      // Refresh meetings when connection is established
      dispatch(getZoomMeetings(organizationId));
    }
  }, [isZoomConnected, organizationId, dispatch]);

  return {
    zoomMeetings,
    zoomLoading,
    zoomError,
    isZoomConnected,
    successMessage
  };
};

// hooks/useMeetingsFilters.js
export const useMeetingsFilters = (meetings = []) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  // Get unique meeting sources for filter
  const getUniqueSources = (meetings) => {
    const sources = meetings.map(meeting => meeting.source || 'Zoom');
    return ['All Sources', ...new Set(sources)];
  };

  const uniqueSources = getUniqueSources(meetings);
  const uniqueStatuses = ['All', 'scheduled', 'started', 'ended'];

  // Filter meetings based on filters
  const filteredMeetings = meetings.filter(meeting => {
    // Text search filter
    const matchesSearch = meeting.topic?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Source filter
    const meetingSource = meeting.source || 'Zoom';
    const matchesSource = sourceFilter === 'All Sources' || meetingSource === sourceFilter;
    
    // Status filter
    const matchesStatus = statusFilter === 'All' || meeting.status === statusFilter;
    
    // Date filter
    let matchesDate = true;
    if (dateFilter.startDate && meeting.start_time) {
      matchesDate = matchesDate && new Date(meeting.start_time) >= new Date(dateFilter.startDate);
    }
    if (dateFilter.endDate && meeting.start_time) {
      const endDate = new Date(dateFilter.endDate);
      endDate.setDate(endDate.getDate() + 1);
      matchesDate = matchesDate && new Date(meeting.start_time) < endDate;
    }
    
    return matchesSearch && matchesSource && matchesStatus && matchesDate;
  });

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSourceFilter('All Sources');
    setStatusFilter('All');
    setDateFilter({
      startDate: '',
      endDate: ''
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    sourceFilter,
    setSourceFilter,
    statusFilter,
    setStatusFilter,
    dateFilter,
    handleDateFilterChange,
    clearFilters,
    uniqueSources,
    uniqueStatuses,
    filteredMeetings
  };
};

// hooks/useMeetingsModal.js
export const useMeetingsModal = (successMessage) => {
  const [isCreateMeetingModalOpen, setIsCreateMeetingModalOpen] = useState(false);
  const [isZoomConnectionModalOpen, setIsZoomConnectionModalOpen] = useState(false);

  // Handle successful actions
  useEffect(() => {
    if (successMessage) {
      // Close connection modal after successful connection/disconnection
      if (successMessage.includes('disconnected') || successMessage.includes('connected')) {
        const timer = setTimeout(() => {
          setIsZoomConnectionModalOpen(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [successMessage]);

  const handleZoomConnectionClick = () => {
    setIsZoomConnectionModalOpen(true);
  };

  const handleCreateMeetingClick = () => {
    setIsCreateMeetingModalOpen(true);
  };

  return {
    isCreateMeetingModalOpen,
    setIsCreateMeetingModalOpen,
    isZoomConnectionModalOpen,
    setIsZoomConnectionModalOpen,
    handleZoomConnectionClick,
    handleCreateMeetingClick
  };
};