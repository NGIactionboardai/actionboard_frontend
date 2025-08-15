'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { parseISO, differenceInHours, differenceInMinutes } from 'date-fns';
import EditSpeakersModal from '@/app/components/EditSpeakersModal';
import SpeakerPieChart from '@/app/components/meetings/SpeakerPieChart';
import PositiveContributionPieChart from '@/app/components/meetings/PositiveContributionPieChart';
import SentimentDistributionBarChart from '@/app/components/meetings/SentimentDistributionBarChart';
import SentimentMeter from '@/app/components/meetings/SentimentMeter';
import SentimentSummaryTable from '@/app/components/meetings/SentimentSummaryTable';
import axios from 'axios';






export default function MeetingDetails() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
  const [sentimentAnalysis, setSentimentAnalysis] = useState(null);
  const [sentimentSummaries, setSentimentSummaries] = useState(null);
  const [sentimentReasoning, setSentimentReasoning] = useState(null);
  const [summary, setSummary] = useState(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [meeting_insights, setMeeting_insights] = useState(null);
  const [meeting_sentiment_summary, setMeeting_sentiment_summary] = useState(null)
  const [speaker_summaries, setSpeaker_summaries] = useState(null)
  const [speaker_summary_table, setSpeaker_summary_table] = useState(null)
  const [sentiment_summaries, setSentiment_summaries] = useState(null)
  const [activeTab, setActiveTab] = useState('insights'); // For tabbed view
  const [transcriptionStatus, setTranscriptionStatus] = useState(null);
  const [autoTranscribed, setAutoTranscribed] = useState(false);
  const [userConfirmed, setUserConfirmed] = useState(false);
  const [transcriptUpdatedAt, setTranscriptUpdatedAt] = useState(null);
  const [hoursLeft, setHoursLeft] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [speakersUpdated, setSpeakersUpdated] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);


  const [selectedSpeaker, setSelectedSpeaker] = useState('');

  const isTranscriptionOngoing = transcriptionStatus === 'pending' || transcriptionStatus === 'processing';

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
      checkTranscriptionStatus()
    }
  }, [meetingId, authToken]);

  useEffect(() => {
    if (speaker_summaries && Object.keys(speaker_summaries).length > 0 && !selectedSpeaker) {
      setSelectedSpeaker(Object.keys(speaker_summaries)[0]);
    }
  }, [speaker_summaries, selectedSpeaker]);

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
  
      console.log('Fetching meeting details for ID:', meetingId);
      console.log('Using Redux token:', !!authToken);
      console.log('User authenticated:', isAuthenticated);
  
      const { data, status } = await axios.get(
        `${API_BASE_URL}/meetings/zoom/meeting-details/${meetingId}/`
      );
  
      console.log('Response status:', status);
      console.log('Meeting data received:', data);
  
      setMeeting(data);
  
      if (data.transcript) {
        if (typeof data.transcript === 'object') {
          setTranscript(data.transcript.utterances || []);
          setSummary(data.transcript.summary || null);
          setMeeting_insights(data.transcript.meeting_insights || null);
          setMeeting_sentiment_summary(data.transcript.meeting_sentiment_summary || null);
          setSpeaker_summaries(data.transcript.meeting_insights?.speaker_summaries || null);
          setSpeaker_summary_table(data.transcript.per_speaker_sentiment?.speaker_summary_table || null);
          setSentiment_summaries(data.transcript.sentiment_summaries || null);
        } else {
          setTranscript(data.transcript);
        }
      }
  
      if (data.summary && !data.transcript) {
        setSummary(data.summary);
      }
  
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching meeting details:', err);
  
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError('Authentication failed. Please log in again.');
            break;
          case 403:
            setError('Access denied. You do not have permission to view this meeting.');
            break;
          case 404:
            setError('Meeting not found.');
            break;
          case 502:
            setError('Server is temporarily unavailable. Our server may be starting up or experiencing issues.');
            break;
          default:
            setError(`Failed to load meeting details: ${err.response.status} - ${err.response.statusText}`);
            break;
        }
      } else if (err.message.includes('No authentication token')) {
        setError('Please log in to view meeting details.');
      } else if (err.message.includes('Network Error')) {
        setError('Unable to connect to the server. Please check your internet connection or try again later.');
      } else {
        setError('Failed to load meeting details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  

  const getCooldownTimeLeft = (endTime, cooldownMinutes = 3) => {
    if (!endTime) return 0;
    const now = new Date();
    const end = parseISO(endTime);
    const diff = differenceInMinutes(now, end);
    return Math.max(0, cooldownMinutes - diff);
  };

  const cooldownLeft = getCooldownTimeLeft(meeting?.end_time);
  const isUploadOnly = meeting?.recordings?.length === 0;

  const handleTranscribe = async () => {
    try {
      setTranscribing(true);
      console.log('Starting transcription for meeting ID:', meetingId);
  
      const transcribeUrl = `${API_BASE_URL}/transcripts/zoom/transcribe/${meetingId}/`;
  
      const response = await axios.post(transcribeUrl, { force: true });
      console.log('Transcription response status:', response.status);
      console.log('Transcription response data:', response.data);
  
      // Trigger immediate status update
      const initialStatus = await checkTranscriptionStatus();
  
      // Start polling if pending or processing
      if (initialStatus === 'pending' || initialStatus === 'processing') {
        pollTranscriptionStatus();
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        console.error(`Transcription error response: ${status}`, data);
  
        switch (status) {
          case 401:
            alert('Authentication failed. Please log in again.');
            break;
          case 403:
            alert('Access denied. You do not have permission to transcribe this meeting.');
            break;
          case 502:
            alert('Server is temporarily unavailable. Please try again in a few moments.');
            break;
          default:
            alert(`Failed to start transcription: ${status} - ${data?.detail || JSON.stringify(data)}`);
        }
      } else if (err.message.includes('No authentication token')) {
        alert('Please log in to start transcription.');
      } else if (err.name === 'AbortError') {
        alert('Request timed out. Please check your connection and try again.');
      } else if (err.message.includes('Network Error')) {
        alert('Unable to connect to the transcription service. Please check your internet connection or try again later.');
      } else {
        alert(`Failed to start transcription: ${err.message}. Please try again.`);
      }
    } finally {
      setTranscribing(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUploadTranscribe = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
  
    try {
      setTranscribing(true);
  
      console.log('Uploading audio file for transcription - Meeting ID:', meetingId);
  
      const uploadUrl = `${API_BASE_URL}/transcripts/zoom/upload-audio-transcribe/${meetingId}/`;
  
      const formData = new FormData();
      formData.append('audio', selectedFile);
  
      const response = await axios.post(uploadUrl, formData);
  
      console.log('Upload & Transcribe response status:', response.status);
  
      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        console.log('Upload transcription response data:', data);
  
        setShowUploadModal(false);
        setSelectedFile(null);
  
        const initialStatus = await checkTranscriptionStatus();
  
        if (initialStatus === 'pending' || initialStatus === 'processing') {
          pollTranscriptionStatus();
        }
      } else {
        alert(`Upload failed with status: ${response.status}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
  
      if (err.response) {
        if (err.response.status === 401) {
          alert('Authentication failed. Please log in again.');
        } else if (err.response.status === 403) {
          alert('Access denied. You do not have permission.');
        } else if (err.response.status === 502) {
          alert('Server is temporarily unavailable. Try again shortly.');
        } else {
          alert(`Upload failed: ${err.response.status} - ${err.response.data}`);
        }
      } else if (err.message.includes('No authentication token')) {
        alert('Please log in to upload a transcript.');
      } else {
        alert(`Unexpected error: ${err.message}`);
      }
    } finally {
      setTranscribing(false);
    }
  };
  

  const pollTranscriptionStatus = (interval = 5000, maxAttempts = 20) => {
    let attempts = 0;
  
    const poller = setInterval(async () => {
      attempts += 1;
      const status = await checkTranscriptionStatus();
  
      if (status === 'completed' || status === 'failed' || attempts >= maxAttempts) {
        clearInterval(poller);
  
        // Call fetchTranscript after polling ends
        fetchTranscript();
      }
    }, interval);
  };
  

  const checkTranscriptionStatus = async () => {
    try {
      const statusUrl = `${API_BASE_URL}/transcripts/zoom/transcribe-status/${meetingId}/`;
      const response = await axios.get(statusUrl);
  
      const data = response.data;
      console.log('Transcription status:', data.status);
  
      setTranscriptionStatus(data.status);
      setAutoTranscribed(data.auto_transcribed);
      setUserConfirmed(data.user_confirmed);
      setSpeakersUpdated(data.speakers_updated);
      setRetryCount(data.retry_count);
  
      if (data.created_at) {
        const createdAt = parseISO(data.created_at);
        const hoursLeft = Math.max(0, 24 - differenceInHours(new Date(), createdAt));
        setHoursLeft(hoursLeft);
      } else {
        setHoursLeft(null);
      }
  
      return data.status;
    } catch (err) {
      if (err.response) {
        console.error('Failed to fetch transcription status:', err.response.status, err.response.data);
      } else {
        console.error('Error checking transcription status:', err.message);
      }
      return null;
    }
  };

  const handleKeepTranscript = async () => {
    try {
      const url = `${API_BASE_URL}/transcripts/zoom/auto-transcribe/keep/${meetingId}/`;
      await axios.post(url);
      setUserConfirmed(true);
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.error || "Failed to keep transcript.");
      } else {
        console.error("Error keeping transcript:", err);
        alert("An error occurred while keeping the transcript.");
      }
    }
  };
  


  const fetchTranscript = async () => {
    try {
      setTranscriptLoading(true);
  
      console.log('Fetching transcript for meeting ID:', meetingId);
      const fetchUrl = `${API_BASE_URL}/transcripts/zoom/fetch-transcript/${meetingId}/`;
      console.log('Fetch transcript URL:', fetchUrl);
  
      const response = await axios.get(fetchUrl);
      const data = response.data;
  
      console.log('Fetch transcript response data:', data);
  
      if (data.full_transcript) setTranscript(data.full_transcript);
      if (data.summary) setSummary(data.summary);
      if (data.meeting_insights) setMeeting_insights(data.meeting_insights);
  
      if (data.transcript === null) {
        alert('No transcript found for this meeting. Try starting transcription first.');
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        console.error(`${status} Error details:`, data);
  
        if (status === 401) alert('Authentication failed. Please log in again.');
        else if (status === 403) alert('Access denied. You do not have permission to view this transcript.');
        else if (status === 404) alert('Meeting not found.');
        else if (status === 502) alert('Server is temporarily unavailable. Please try again in a few moments.');
        else alert(`Failed to fetch transcript: ${status} - ${JSON.stringify(data)}`);
      } else {
        console.error('Error fetching transcript:', err);
        if (err.message.includes('No authentication token')) {
          alert('Please log in to fetch transcript.');
        } else if (err.name === 'AbortError') {
          alert('Request timed out. Please check your connection and try again.');
        } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
          alert('Unable to connect to the transcript service. Please check your internet connection or try again later.');
        } else {
          alert(`Failed to fetch transcript: ${err.message}. Please try again.`);
        }
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

    return meeting?.status
    // if (!meeting?.start_time) return 'scheduled';
    
    // const now = new Date();
    // const startTime = new Date(meeting.start_time);
    // const endTime = new Date(startTime.getTime() + (meeting.duration * 60000));
    
    // if (now < startTime) return 'scheduled';
    // if (now >= startTime && now <= endTime) return 'started';
    // return 'ended';
  };

  const isMeetingPast = (meeting) => {

    if (meeting?.status === 'ended') return true
    else return false

    // if (!meeting?.start_time) return false;
    
    // const now = new Date();
    // const startTime = new Date(meeting.start_time);
    // const endTime = new Date(startTime.getTime() + (meeting.duration * 60000));
    
    // return now > endTime;
  };

  const isMeetingFuture = (meeting) => {
    if (meeting?.status == "scheduled") return true;
    else return false

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
      <div className="mb-8 space-y-2">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          <svg className="mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back
        </button>

        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-bold leading-7 text-gray-900 truncate">
            Org: {meeting.organisation.name || "Organization"}
          </h1>
          <h3 className="text-md sm:text-lg font-semibold leading-6 text-gray-700 truncate">
            {meeting.topic || 'Meeting Details'}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
            <span className={`px-2 py-1 text-xs sm:text-sm inline-flex leading-5 font-semibold rounded-full 
              ${status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                status === 'started' ? 'bg-green-100 text-green-800' : 
                'bg-gray-100 text-gray-800'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>

            {/* Transcription Status Badge */}
            <span className={`px-2 py-1 text-xs sm:text-sm inline-flex leading-5 font-semibold rounded-full
              ${transcriptionStatus === 'completed'
                ? 'bg-green-100 text-green-800'
                : transcriptionStatus === 'not_found'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-indigo-100 text-indigo-800'}`}>
              {transcriptionStatus === 'completed'
                ? 'Transcribed'
                : transcriptionStatus === 'not_found'
                ? 'Not Transcribed'
                : 'In Progress'}
            </span>

            {/* <span className="text-sm text-gray-500 truncate">
              Meeting ID: {meeting.meeting_id || meeting.id}
            </span> */}
          </div>
        </div>
      </div>

      {/* Transcription In Progress */}
      {(transcriptionStatus === 'pending' || transcriptionStatus === 'processing') && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-md shadow mb-6">
          <p className="font-medium text-sm sm:text-base">Transcription in progress.</p>
          <p className="text-xs sm:text-sm mt-1">
            You'll receive a notification once it’s complete. Please check back later.
          </p>
        </div>
      )}

      {/* Auto-transcript save prompt */}
      {transcriptionStatus === 'completed' && autoTranscribed && !userConfirmed && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md shadow-sm sm:flex sm:justify-between sm:items-center">
          <p className="text-sm text-gray-700 break-words sm:flex-1">
            This transcript was auto-generated.
            {hoursLeft !== null && hoursLeft > 0 && (
              <> You have approximately <strong>{hoursLeft} hour{hoursLeft !== 1 && 's'}</strong> left to keep it.</>
            )}
          </p>
          <button
            onClick={handleKeepTranscript}
            className="mt-2 sm:mt-0 sm:ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Transcript
          </button>
        </div>
      )}

      {/* Meeting Information */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg sm:text-xl leading-6 font-medium text-gray-900">Meeting Information</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm sm:text-base font-medium text-gray-500">Meeting ID</dt>
              <dd className="mt-1 text-sm sm:text-base text-gray-900 sm:mt-0 sm:col-span-2 break-all">
                {meeting.meeting_id || meeting.id}
              </dd>
            </div>

            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm sm:text-base font-medium text-gray-500">Start Time</dt>
              <dd className="mt-1 text-sm sm:text-base text-gray-900 sm:mt-0 sm:col-span-2">
                {formatMeetingDateTime(meeting.start_time)}
              </dd>
            </div>

            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm sm:text-base font-medium text-gray-500">Duration</dt>
              <dd className="mt-1 text-sm sm:text-base text-gray-900 sm:mt-0 sm:col-span-2">
                {meeting.duration ? `${meeting.duration} minutes` : 'N/A'}
              </dd>
            </div>

            {meeting.host && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm sm:text-base font-medium text-gray-500">Host</dt>
                <dd className="mt-1 text-sm sm:text-base text-gray-900 sm:mt-0 sm:col-span-2 break-words">
                  {meeting.host.full_name || meeting.host.email || 'N/A'}
                </dd>
              </div>
            )}

            {meeting.agenda && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm sm:text-base font-medium text-gray-500">Agenda</dt>
                <dd className="mt-1 text-sm sm:text-base text-gray-900 sm:mt-0 sm:col-span-2">
                  {meeting.agenda}
                </dd>
              </div>
            )}

            {meeting.join_url && !isMeetingPast(meeting) && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm sm:text-base font-medium text-gray-500">Join URL</dt>
                <dd className="mt-1 text-sm sm:text-base text-gray-900 sm:mt-0 sm:col-span-2 break-all">
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
          {transcriptionStatus === 'completed' && (
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Transcription Actions</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 break-words">
                {hasTranscript()
                  ? 'Meeting has been transcribed. You can re-transcribe to update the content.'
                  : 'Transcribe the meeting recording and generate insights.'
                }
              </p>
            </div>
          )}

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
              {isUploadOnly ? (
                cooldownLeft > 0 ? (
                  <p className="text-sm text-yellow-600 break-words">
                    We’re still processing your meeting. Please wait <strong>{cooldownLeft} minute{cooldownLeft !== 1 ? 's' : ''}</strong> before uploading a file.
                  </p>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                    <button
                      onClick={() => setShowUploadModal(true)}
                      disabled={transcribing || isTranscriptionOngoing}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {hasTranscript() ? 'Upload & Re-transcribe' : 'Upload & Transcribe'}
                    </button>

                    {!(transcribing || isTranscriptionOngoing) && (
                      !speakersUpdated ? (
                        <button
                          onClick={() => setShowEditModal(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                          Edit Speakers
                        </button>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                          <svg className="-ml-1 mr-1 h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Speakers Updated
                        </span>
                      )
                    )}
                  </div>
                )
              ) : (
                <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                  <button
                    onClick={handleTranscribe}
                    disabled={transcribing || isTranscriptionOngoing || (autoTranscribed && !userConfirmed)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={transcriptLoading || isTranscriptionOngoing || (autoTranscribed && !userConfirmed)}
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
              )}
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


      {(transcriptionStatus === 'pending' || transcriptionStatus === 'processing') ? (
        null
      ) : (transcript || summary || meeting_insights) && (
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Tab Navigation */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar">
              {meeting_insights && (
                <button
                  onClick={() => setActiveTab("insights")}
                  className={`flex-shrink-0 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "insights"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  AI Insights
                </button>
              )}
              {transcript && (
                <button
                  onClick={() => setActiveTab("transcript")}
                  className={`flex-shrink-0 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "transcript"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Transcript
                </button>
              )}
              {meeting_insights && (
                <button
                  onClick={() => setActiveTab("speaker_summary")}
                  className={`flex-shrink-0 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "speaker_summary"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Speaker Summary
                </button>
              )}
              {meeting_sentiment_summary && (
                <button
                  onClick={() => setActiveTab("meeting_sentiment")}
                  className={`flex-shrink-0 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "meeting_sentiment"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Overall Meeting Sentiment
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="px-4 py-5 sm:px-6">
            {/* AI Insights Tab */}
            {activeTab === "insights" && meeting_insights && (
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  AI-Generated Insights
                </h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  {typeof meeting_insights === "object" ? (
                    <div className="space-y-4">
                      {Object.entries(meeting_insights).map(([key, value]) => (
                        <div key={key}>
                          <h4 className="font-semibold text-gray-900 capitalize mb-2">
                            {key.replace(/_/g, " ")}
                          </h4>
                          {renderInsightValue(value)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                      {meeting_insights}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Transcript Tab */}
            {activeTab === "transcript" && Array.isArray(transcript) && (
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Meeting Transcript
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-[70vh] sm:max-h-96 overflow-y-auto space-y-4">
                  {transcript.map((utterance, idx) => {
                    const formatTime = (ms) => {
                      const totalSeconds = Math.floor(ms / 1000);
                      const hours = Math.floor(totalSeconds / 3600);
                      const minutes = Math.floor((totalSeconds % 3600) / 60);
                      const seconds = totalSeconds % 60;
                      return [hours, minutes, seconds]
                        .map((val) => String(val).padStart(2, "0"))
                        .join(":");
                    };

                    return (
                      <div key={idx}>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          <span className="font-semibold text-indigo-700">
                            Speaker {utterance.speaker}
                          </span>
                          &nbsp;&nbsp;
                          <span className="text-gray-950">
                            [{formatTime(utterance.start)}]
                          </span>
                          &nbsp;&nbsp;
                          {utterance.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Speaker Summary Tab */}
            {activeTab === "speaker_summary" && (
              <>
                {speaker_summary_table ? (
                  <div className="mb-3">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Speaker Summary
                    </h3>

                    {/* Dropdown */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Speaker:
                      </label>
                      <select
                        value={selectedSpeaker}
                        onChange={(e) => setSelectedSpeaker(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        <option value="" disabled>
                          Select a speaker
                        </option>
                        {Object.keys(speaker_summaries).map((speakerKey) => (
                          <option key={speakerKey} value={speakerKey}>
                            {speakerKey}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedSpeaker && (
                      <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {speaker_summaries[selectedSpeaker]}
                        </p>
                      </div>
                    )}

                    {selectedSpeaker && (
                      <div className="max-w-full sm:max-w-md mx-auto">
                        <SpeakerPieChart
                          data={speaker_summary_table.find((entry) =>
                            selectedSpeaker
                              .toLowerCase()
                              .includes(entry.Speaker.toLowerCase())
                          )}
                        />
                      </div>
                    )}

                    {/* Comparative Table */}
                    <div className="mt-10 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Speaker
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-green-600 uppercase tracking-wider">
                              Pos %
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-blue-600 uppercase tracking-wider">
                              Neu %
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-red-600 uppercase tracking-wider">
                              Neg %
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Overall
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {speaker_summary_table.map((entry, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition">
                              <td className="px-4 py-2 text-sm text-gray-800 font-medium">
                                {entry.Speaker}
                              </td>
                              <td className="px-4 py-2 text-sm text-green-700">
                                {entry["Pos %"]}
                              </td>
                              <td className="px-4 py-2 text-sm text-blue-700">
                                {entry["Neu %"]}
                              </td>
                              <td className="px-4 py-2 text-sm text-red-700">
                                {entry["Neg %"]}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    entry.Overall === "Positive"
                                      ? "bg-green-100 text-green-800"
                                      : entry.Overall === "Negative"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {entry.Overall}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Charts */}
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-2">
                          Positive Contribution to Group Sentiment
                        </h4>
                        <PositiveContributionPieChart data={speaker_summary_table} />
                      </div>
                      <div>
                        <h4 className="text-md font-semibold text-gray-800 mb-2">
                          Sentiment Distribution by Speaker
                        </h4>
                        <SentimentDistributionBarChart data={speaker_summary_table} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic mt-4">
                    No speaker summaries available.
                  </p>
                )}
              </>
            )}

            {/* Meeting Sentiment Tab */}
            {activeTab === "meeting_sentiment" &&
              meeting_sentiment_summary &&
              Array.isArray(transcript) && (
                <div>
                  <SentimentSummaryTable summary={meeting_sentiment_summary} />
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


      {showUploadModal && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md sm:max-w-lg md:max-w-xl p-4 sm:p-6">
            {/* Icon Header */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 rounded-full p-2 sm:p-3">
                <img
                  src="/icons/ab-upload-icon.png"
                  alt="Upload"
                  className="w-10 h-10 sm:w-12 sm:h-12"
                />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-base sm:text-lg font-semibold text-center text-gray-900 mb-2">
              Upload Recording File
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 text-center mb-4">
              Choose an audio or video file to transcribe.
            </p>

            {/* File Input */}
            <input
              type="file"
              onChange={handleFileChange}
              accept="audio/*,video/*"
              className="block w-full text-xs sm:text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            {/* Actions */}
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleUploadTranscribe}
                disabled={transcribing || isTranscriptionOngoing}
                className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {transcribing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg
                      className="-ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    {hasTranscript() ? 'Re-Upload' : 'Upload'}
                  </>
                )}
              </button>

              <button
                onClick={() => setShowUploadModal(false)}
                disabled={transcribing}
                className="inline-flex justify-center items-center px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      <EditSpeakersModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        meetingId={meetingId}
        onUpdateSuccess={async () => {
          await checkTranscriptionStatus();
          await fetchTranscript();
        }}
      />



      </div>

      
  );
}