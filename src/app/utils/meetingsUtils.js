// utils/meetingsUtils.js

/**
 * Format meeting date and time for display
 * @param {string} dateTime - ISO date string
 * @returns {string} Formatted date and time
 */
export const formatMeetingDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString();
  };
  
  /**
   * Get meeting status based on start time and duration
   * @param {Object} meeting - Meeting object
   * @returns {string} Meeting status: 'scheduled', 'started', or 'ended'
   */
  export const getMeetingStatus = (meeting) => {
    if (!meeting.start_time) return 'scheduled';
    
    const now = new Date();
    const startTime = new Date(meeting.start_time);
    const endTime = new Date(startTime.getTime() + (meeting.duration * 60000));
    
    if (now < startTime) return 'scheduled';
    if (now >= startTime && now <= endTime) return 'started';
    return 'ended';
  };
  
  /**
   * Get status badge color classes
   * @param {string} status - Meeting status
   * @returns {string} CSS classes for status badge
   */
  export const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'started':
        return 'bg-green-100 text-green-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  /**
   * Generate meeting URL for navigation
   * @param {Object} meeting - Meeting object
   * @returns {string} Meeting detail URL
   */
  export const getMeetingUrl = (meeting) => {
    return `/meeting/${meeting.meeting_id || meeting.id}`;
  };
  
  /**
   * Check if meeting has join URL
   * @param {Object} meeting - Meeting object
   * @returns {boolean} Whether meeting has join URL
   */
  export const hasJoinUrl = (meeting) => {
    return Boolean(meeting.join_url);
  };
  
  /**
   * Get unique sources from meetings array
   * @param {Array} meetings - Array of meeting objects
   * @returns {Array} Array of unique sources
   */
  export const getUniqueSources = (meetings = []) => {
    const sources = meetings.map(meeting => meeting.source || 'Zoom');
    return ['All Sources', ...new Set(sources)];
  };
  
  /**
   * Get available status options
   * @returns {Array} Array of status options
   */
  export const getStatusOptions = () => {
    return ['All', 'scheduled', 'started', 'ended'];
  };
  
  /**
   * Capitalize first letter of string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };