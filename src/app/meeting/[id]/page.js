'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';





export default function MeetingDetails() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Get meeting ID from URL params
  const meetingId = params?.id;
  
  // Get auth state from Redux
  const authToken = useSelector((state) => state.auth?.token);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const user = useSelector((state) => state.auth?.user);
  
  // Local state
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const [summary, setSummary] = useState(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [meeting_insights, setMeeting_insights] = useState(null);
  const [activeTab, setActiveTab] = useState('transcript'); // For tabbed view

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

  // Fetch meeting details on component mount
  useEffect(() => {
    // Check if we have authentication
    if (!authToken && !localStorage.getItem('token')) {
      setError('Please log in to view meeting details.');
      setLoading(false);
      return;
    }
    
    if (meetingId) {
      fetchMeetingDetails();
    }
  }, [meetingId, authToken]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const headers = getAuthHeaders();
      
      console.log('Fetching meeting details for ID:', meetingId);
      console.log('Using Redux token:', !!authToken);
      console.log('User authenticated:', isAuthenticated);
      
      // Use the enhanced API call with retry logic
      const response = await makeApiCall(
        `https://actionboard-backend-1.onrender.com/api/meetings/zoom/meeting-details/${meetingId}/`,
        { headers }
      );
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Meeting data received:', data);
        setMeeting(data);
        
        // Check if transcript already exists in the response
        if (data.transcript) {
          if (typeof data.transcript === 'object') {
            setTranscript(data.transcript.full_transcript);
            setSummary(data.transcript.summary || null);
            setMeeting_insights(data.transcript.meeting_insights || null);
          } else {
            setTranscript(data.transcript);
          }
        }
        if (data.summary && !transcript) {
          setSummary(data.summary);
        }
        
        // Reset retry count on success
        setRetryCount(0);
      } else if (response.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (response.status === 403) {
        setError('Access denied. You do not have permission to view this meeting.');
      } else if (response.status === 404) {
        setError('Meeting not found.');
      } else if (response.status === 502) {
        setError('Server is temporarily unavailable. Our server may be starting up or experiencing issues.');
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        setError(`Failed to load meeting details: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('Error fetching meeting details:', err);
      
      if (err.message.includes('No authentication token')) {
        setError('Please log in to view meeting details.');
      } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please check your internet connection or try again later.');
      } else {
        setError('Failed to load meeting details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTranscribe = async () => {
    try {
      setTranscribing(true);
      const headers = getAuthHeaders();
      
      console.log('Starting transcription for meeting ID:', meetingId);
      console.log('Using headers:', headers);
      
      // Use the same base URL as the meeting details call for consistency
      const transcribeUrl = `https://actionboard-backend-1.onrender.com/api/transcripts/zoom/transcribe/${meetingId}/`;
      console.log('Transcribe URL:', transcribeUrl);
      
      const response = await makeApiCall(
        transcribeUrl,
        {
          method: 'POST',
          headers,
        }
      );
      
      console.log('Transcription response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Transcription response data:', data);
        alert('Transcription started successfully!');
        
        // Update the transcript and summary if returned
        if (data.full_transcript) {
          setTranscript(data.full_transcript);
        }
        if (data.summary) {
          setSummary(data.summary);
        }
        if (data.meeting_insights) {
          setMeeting_insights(data.meeting_insights);
        }
      } else if (response.status === 401) {
        const errorText = await response.text();
        console.error('401 Error details:', errorText);
        alert('Authentication failed. Please log in again.');
      } else if (response.status === 403) {
        const errorText = await response.text();
        console.error('403 Error details:', errorText);
        alert('Access denied. You do not have permission to transcribe this meeting.');
      } else if (response.status === 502) {
        alert('Server is temporarily unavailable. Please try again in a few moments.');
      } else {
        const errorData = await response.text();
        console.error('Transcription error response:', errorData);
        alert(`Failed to start transcription: ${response.status} - ${errorData}`);
      }
    } catch (err) {
      console.error('Error starting transcription:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      if (err.message.includes('No authentication token')) {
        alert('Please log in to start transcription.');
      } else if (err.name === 'AbortError') {
        alert('Request timed out. Please check your connection and try again.');
      } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        alert('Unable to connect to the transcription service. Please check your internet connection or try again later.');
      } else {
        alert(`Failed to start transcription: ${err.message}. Please try again.`);
      }
    } finally {
      setTranscribing(false);
    }
  };

  const fetchTranscript = async () => {
    try {
      setTranscriptLoading(true);
      const headers = getAuthHeaders();
      
      console.log('Fetching transcript for meeting ID:', meetingId);
      
      // Use the same base URL as the meeting details call for consistency
      const fetchUrl = `https://actionboard-backend-1.onrender.com/api/transcripts/zoom/fetch-transcript/${meetingId}/`;
      console.log('Fetch transcript URL:', fetchUrl);
      
      const response = await makeApiCall(fetchUrl, { headers });
      
      console.log('Fetch transcript response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetch transcript response data:', data);
        
        // Handle the response structure from your FetchTranscriptView
        if (data.full_transcript) {
          setTranscript(data.full_transcript);
        }
        if (data.summary) {
          setSummary(data.summary);
        }
        if (data.meeting_insights) {
          setMeeting_insights(data.meeting_insights);
        }
        
        // If no transcript found
        if (data.transcript === null) {
          alert('No transcript found for this meeting. Try starting transcription first.');
        }
      } else if (response.status === 401) {
        const errorText = await response.text();
        console.error('401 Error details:', errorText);
        alert('Authentication failed. Please log in again.');
      } else if (response.status === 403) {
        const errorText = await response.text();
        console.error('403 Error details:', errorText);
        alert('Access denied. You do not have permission to view this transcript.');
      } else if (response.status === 404) {
        const errorText = await response.text();
        console.error('404 Error details:', errorText);
        alert('Meeting not found.');
      } else if (response.status === 502) {
        alert('Server is temporarily unavailable. Please try again in a few moments.');
      } else {
        const errorData = await response.text();
        console.error('Fetch transcript error response:', errorData);
        alert(`Failed to fetch transcript: ${response.status} - ${errorData}`);
      }
    } catch (err) {
      console.error('Error fetching transcript:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      if (err.message.includes('No authentication token')) {
        alert('Please log in to fetch transcript.');
      } else if (err.name === 'AbortError') {
        alert('Request timed out. Please check your connection and try again.');
      } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        alert('Unable to connect to the transcript service. Please check your internet connection or try again later.');
      } else {
        alert(`Failed to fetch transcript: ${err.message}. Please try again.`);
      }
    } finally {
      setTranscriptLoading(false);
    }
  };

  const formatMeetingDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString();
  };

  const getMeetingStatus = (meeting) => {
    if (!meeting?.start_time) return 'scheduled';
    
    const now = new Date();
    const startTime = new Date(meeting.start_time);
    const endTime = new Date(startTime.getTime() + (meeting.duration * 60000));
    
    if (now < startTime) return 'scheduled';
    if (now >= startTime && now <= endTime) return 'started';
    return 'ended';
  };

  const isMeetingPast = (meeting) => {
    if (!meeting?.start_time) return false;
    
    const now = new Date();
    const startTime = new Date(meeting.start_time);
    const endTime = new Date(startTime.getTime() + (meeting.duration * 60000));
    
    return now > endTime;
  };

  const isMeetingFuture = (meeting) => {
    if (!meeting?.start_time) return true;
    
    const now = new Date();
    const startTime = new Date(meeting.start_time);
    
    return now < startTime;
  };

  const hasTranscript = () => {
    return transcript || summary || meeting_insights;
  };

  // const renderInsightValue = (value) => {
  //   if (Array.isArray(value)) {
  //     return (
  //       <ul className="list-disc list-inside space-y-1">
  //         {value.map((item, index) => (
  //           <li key={index} className="text-sm text-gray-700">{item}</li>
  //         ))}
  //       </ul>
  //     );
  //   } else if (typeof value === 'object' && value !== null) {
  //     return (
  //       <div className="space-y-2">
  //         {Object.entries(value).map(([subKey, subValue]) => (
  //           <div key={subKey}>
  //             <span className="font-medium text-gray-800 capitalize">
  //               {subKey.replace(/_/g, ' ')}:
  //             </span>
  //             <div className="ml-2 mt-1">{renderInsightValue(subValue)}</div>
  //           </div>
  //         ))}
  //       </div>
  //     );
  //   }
  //   return <p className="text-sm text-gray-700">{value}</p>;
  // };

  const renderInsightValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {value.map((item, index) => (
            <li key={index} className="text-sm text-gray-700">{item}</li>
          ))}
        </ul>
      );
    } else if (typeof value === 'object' && value !== null) {
      return (
        <div className="space-y-2">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey}>
              <span className="font-medium text-gray-800 capitalize">
                {subKey.replace(/_/g, ' ')}:
              </span>
              <div className="ml-2 mt-1">{renderInsightValue(subValue)}</div>
            </div>
          ))}
        </div>
      );
    } else if (typeof value === 'string') {
      // Handle structured summary with proper formatting
      if (value.includes('## ') || value.includes('- ')) {
        return (
          <div className="prose prose-sm max-w-none">
            {value.split('\n').map((line, index) => {
              const trimmedLine = line.trim();
              
              // Handle main headings (##)
              if (trimmedLine.startsWith('## ')) {
                return (
                  <h4 key={index} className="text-base font-semibold text-gray-900 mt-4 mb-2 first:mt-0">
                    {trimmedLine.replace('## ', '')}
                  </h4>
                );
              }
              
              // Handle bullet points (-)
              if (trimmedLine.startsWith('- ')) {
                return (
                  <div key={index} className="ml-4 mb-1">
                    <span className="inline-flex items-start">
                      <span className="text-gray-400 mr-2 mt-1.5 flex-shrink-0">•</span>
                      <span className="text-sm text-gray-700">{trimmedLine.replace('- ', '')}</span>
                    </span>
                  </div>
                );
              }
              
              // Handle empty lines
              if (trimmedLine === '') {
                return <div key={index} className="h-2"></div>;
              }
              
              // Handle regular text
              return (
                <p key={index} className="text-sm text-gray-700 mb-2">
                  {trimmedLine}
                </p>
              );
            })}
          </div>
        );
      }
      
      // For regular text without special formatting
      return <p className="text-sm text-gray-700 whitespace-pre-wrap">{value}</p>;
    }
    
    return <p className="text-sm text-gray-700">{value}</p>;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading meeting details...
          </div>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">
            {error?.includes('502') || error?.includes('server') ? 'Server Temporarily Unavailable' : 'Meeting Not Found'}
          </h2>
          <p className="mt-2 text-gray-600">{error || 'The meeting you are looking for does not exist.'}</p>
          <div className="mt-6 space-x-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go Back
            </button>
            {(error?.includes('502') || error?.includes('server') || error?.includes('connect')) && (
              <button
                onClick={fetchMeetingDetails}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const status = getMeetingStatus(meeting);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          <svg className="mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <div className="mt-2">
          <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:truncate">
            {meeting.topic || 'Meeting Details'}
          </h1>
          <div className="mt-2 flex items-center">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                status === 'started' ? 'bg-green-100 text-green-800' : 
                'bg-gray-100 text-gray-800'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <span className="ml-3 text-sm text-gray-500">
              Meeting ID: {meeting.meeting_id || meeting.id}
            </span>
          </div>
        </div>
      </div>

      {/* Meeting Information */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Meeting Information</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Start Time</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatMeetingDateTime(meeting.start_time)}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Duration</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {meeting.duration ? `${meeting.duration} minutes` : 'N/A'}
              </dd>
            </div>
            {meeting.host && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Host</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {meeting.host.full_name || meeting.host.email || 'N/A'}
                </dd>
              </div>
            )}
            {meeting.agenda && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Agenda</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {meeting.agenda}
                </dd>
              </div>
            )}
            {meeting.join_url && !isMeetingPast(meeting) && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Join URL</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <a 
                    href={meeting.join_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-500 break-all"
                  >
                    {meeting.join_url}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Action Buttons */}
      {isMeetingPast(meeting) && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Transcription Actions</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {hasTranscript() 
                ? 'Meeting has been transcribed. You can re-transcribe to update the content.'
                : 'Transcribe the meeting recording and generate insights.'
              }
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex space-x-3">
              <button
                onClick={handleTranscribe}
                disabled={transcribing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {transcribing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {hasTranscript() ? 'Re-transcribing...' : 'Transcribing...'}
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    {hasTranscript() ? 'Re-transcribe Meeting' : 'Start Transcription'}
                  </>
                )}
              </button>

              <button
                onClick={fetchTranscript}
                disabled={transcriptLoading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {transcriptLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Transcript
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Status Info for Future/Current Meetings */}
      {!isMeetingPast(meeting) && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Meeting Status</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {isMeetingFuture(meeting) 
                ? 'This meeting is scheduled for the future. Transcription will be available after the meeting ends.'
                : 'This meeting is currently in progress. Transcription will be available after the meeting ends.'
              }
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${
                isMeetingFuture(meeting) ? 'bg-blue-400' : 'bg-green-400'
              }`}></div>
              <p className="ml-3 text-sm font-medium text-gray-900">
                {isMeetingFuture(meeting) 
                  ? 'Meeting scheduled'
                  : 'Meeting in progress'
                }
              </p>
            </div>
            {isMeetingFuture(meeting) && meeting.join_url && (
              <div className="mt-4">
                <a 
                  href={meeting.join_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Join Meeting
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabbed Content Section */}
      {(transcript || summary || meeting_insights) && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Tab Navigation */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {transcript && (
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'transcript'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Transcript
                </button>
              )}
              {summary && (
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'summary'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Summary
                </button>
              )}
              {meeting_insights && (
                <button
                  onClick={() => setActiveTab('insights')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'insights'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  AI Insights
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="px-4 py-5 sm:px-6">
            {/* Transcript Tab */}
            {activeTab === 'transcript' && transcript && (
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Meeting Transcript</h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                    {transcript}
                  </pre>
                </div>
              </div>
            )}

            {/* Summary Tab */}
            {activeTab === 'summary' && summary && (
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Meeting Summary</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  {typeof summary === 'object' ? (
                    <div className="space-y-4">
                      {Object.entries(summary).map(([key, value]) => (
                        <div key={key}>
                          <h4 className="font-semibold text-gray-900 capitalize mb-2">
                            {key.replace('_', ' ')}
                          </h4>
                          {renderInsightValue(value)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{summary}</p>
                  )}
                </div>
              </div>
            )}

            {/* AI Insights Tab */}
            {activeTab === 'insights' && meeting_insights && (
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">AI-Generated Insights</h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  {typeof meeting_insights === 'object' ? (
                    <div className="space-y-4">
                      {Object.entries(meeting_insights).map(([key, value]) => (
                        <div key={key}>
                          <h4 className="font-semibold text-gray-900 capitalize mb-2">
                            {key.replace(/_/g, ' ')}
                          </h4>
                          {renderInsightValue(value)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{meeting_insights}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Items Section (if you want to add this) */}
      {meeting.action_items && meeting.action_items.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Action Items</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {meeting.action_items.map((item, index) => (
                <li key={index} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{item.content}</p>
                      {item.assigned_to && (
                        <p className="text-xs text-gray-500 mt-1">
                          Assigned to: {item.assigned_to}
                        </p>
                      )}
                      {item.due_date && (
                        <p className="text-xs text-gray-500">
                          Due: {new Date(item.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.status === 'done' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status === 'done' ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}