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
import { format } from "date-fns";
import { generateMeetingPDF } from '@/app/utils/pdfGenerator';
import { ArrowLeft, Building2, FileDown } from 'lucide-react';
import EditStructuredSummary from '@/app/components/meeting/EditStructuredSummary';
import _ from "lodash";
import SendSummaryModal from '@/app/components/meeting/SendSummaryModal';
import { motion, AnimatePresence } from "framer-motion";





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
  const [orgId, setOrgId] = useState(null);
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

  const [rawMeetingInsights, setRawMeetingInsights] = useState(null); // wrapper
  const [meeting_insights, setMeeting_insights] = useState(null);     // selected lang
  const [speaker_summaries, setSpeaker_summaries] = useState(null);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [selectedSummaryLang, setSelectedSummaryLang] = useState("en");



  // const [meeting_insights, setMeeting_insights] = useState(null);
  const [meeting_sentiment_summary, setMeeting_sentiment_summary] = useState(null)
  // const [speaker_summaries, setSpeaker_summaries] = useState(null)
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
  const [fileError, setFileError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [speakersUpdated, setSpeakersUpdated] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [multilingualUtterence, setMultilingualUtterence] = useState(null);
  const [selectedLang, setSelectedLang] = useState("en"); // default English
  const [isEditingAiInsight, setIsEditingAiInsight] = useState(false);
  const [draftSummary, setDraftSummary] = useState(null);

  const [members, setMembers] = useState([]);
  const [isSendSummaryModalOpen, setIsSendSummaryModalOpen] = useState(false);


  const [selectedSpeaker, setSelectedSpeaker] = useState('');

  const isTranscriptionOngoing = transcriptionStatus === 'pending' || transcriptionStatus === 'processing';


  // Normalize meeting insight
  function normalizeMeetingInsights(ci) {
    if (!ci) return null;
  
    // Already new format
    if (ci.languages) return ci;
  
    // Old format -> wrap as English
    return {
      detected_language: "en",
      languages: {
        en: ci,
      },
    };
  }

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
    if (speaker_summaries && Object.keys(speaker_summaries).length > 0) {
      // If no selection OR the current one no longer exists
      if (!selectedSpeaker || !speaker_summaries[selectedSpeaker]) {
        setSelectedSpeaker(Object.keys(speaker_summaries)[0]);
      }
    }
  }, [speaker_summaries, selectedSpeaker]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!orgId) return;  // token handled globally by interceptor
  
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/organisations/${orgId}/members/`);
        setMembers(res.data.members || []);
      } catch (err) {
        console.error('Error fetching members', err);
      }
    };
  
    fetchMembers();
  }, [orgId]);

  useEffect(() => {
    if (!rawMeetingInsights || !selectedLang) return;
  
    const bundle =
      rawMeetingInsights.languages?.[selectedLang] ||
      rawMeetingInsights.languages?.["en"];
  
    setMeeting_insights(bundle || null);
    setSpeaker_summaries(bundle?.speaker_summaries || null);
    setDraftSummary(_.cloneDeep(bundle?.structured_summary || {}));
  
  }, [selectedLang, rawMeetingInsights]);


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
      setOrgId(data.organisation.org_id)
  
      if (data.transcript) {
        if (typeof data.transcript === 'object') {
          setTranscript(data.transcript.utterances || null);
          setMultilingualUtterence(data.transcript.multilingual_utterances || null);
          setSummary(data.transcript.summary || null);
          // setMeeting_insights(data.transcript.meeting_insights || null);
          // setDraftSummary(_.cloneDeep(data.transcript.meeting_insights?.structured_summary || {}));
          setMeeting_sentiment_summary(data.transcript.meeting_sentiment_summary || null);
          // setSpeaker_summaries(data.transcript.meeting_insights?.speaker_summaries || null);
          setSpeaker_summary_table(data.transcript.per_speaker_sentiment?.speaker_summary_table || null);
          setSentiment_summaries(data.transcript.sentiment_summaries || null);

          const normalized = normalizeMeetingInsights(
            data.transcript.meeting_insights
          );
          
          setRawMeetingInsights(normalized);
          
          const langs = normalized?.languages
            ? Object.keys(normalized.languages)
            : [];
          
          setAvailableLanguages(langs);
          
          // default language
          const initialLang = langs.includes("en")
            ? "en"
            : langs[0] || "en";
          
          setSelectedLang(initialLang);
          
          const bundle = normalized?.languages?.[initialLang] || null;
          
          setMeeting_insights(bundle);
          setSpeaker_summaries(bundle?.speaker_summaries || null);
          setDraftSummary(_.cloneDeep(bundle?.structured_summary || {}));

          // Normalize meeting insights (remove speaker_summaries)
          // if (data.transcript.meeting_insights) {
          //   const { speaker_summaries, ...insightsWithoutSpeakers } =
          //     data.transcript.meeting_insights;

          //   // Old structure: structured_summary is a string
          //   // New structure: structured_summary is an object
          //   let normalizedInsights = insightsWithoutSpeakers;

          //   if (
          //     typeof insightsWithoutSpeakers.structured_summary === "string"
          //   ) {
          //     normalizedInsights = {
          //       ...insightsWithoutSpeakers,
          //       structured_summary: {
          //         minutes: insightsWithoutSpeakers.structured_summary,
          //       },
          //     };
          //   }

          //   setMeeting_insights(normalizedInsights);
          // } else {
          //   setMeeting_insights(null);
          // }

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

  function getUtteranceText(u, lang) {
    return (
      u?.translations?.[lang] ||
      u?.translations?.["en"] ||
      u?.text ||
      ""
    );
  }

  const formatSpeakerLabel = (speaker) => {
    // If the speaker is still a placeholder like "A", "B", "C" → show "Speaker A"
    if (/^[A-Z]$/.test(speaker)) {
      return `Speaker ${speaker}`;
    }
    // Otherwise, assume it's a real name → show as-is
    return speaker;
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

  // handler
  const MAX_FILE_SIZE_MB = 50;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      setFileError("Only audio files are allowed. Please upload an audio file.");
      setSelectedFile(null);
      event.target.value = null; // reset the input
    } else if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File size should be smaller than ${MAX_FILE_SIZE_MB}MB.`);
      setSelectedFile(null);
      event.target.value = null; // reset the input
    } else {
      setFileError("");
      setSelectedFile(file);
    }
  };


  const handleUploadTranscribe = async () => {
    if (!selectedFile) {
      setFileError("Please select an audio file first."); // use modal error instead of alert
      return;
    }
  
    try {
      setTranscribing(true);
      setUploadProgress(0);
  
      const uploadUrl = `${API_BASE_URL}/transcripts/zoom/upload-audio-transcribe/${meetingId}/`;
  
      const formData = new FormData();
      formData.append('audio', selectedFile);
  
      const response = await axios.post(uploadUrl, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        }
      });
  
      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        console.log('Upload transcription response data:', data);
  
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadProgress(0);
  
        const initialStatus = await checkTranscriptionStatus();
        if (initialStatus === 'pending' || initialStatus === 'processing') {
          pollTranscriptionStatus();
        }
      } else {
        setFileError(`Upload failed with status: ${response.status}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setFileError("Upload failed. Please try again.");
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

  // const formatMeetingDateTime = (dateTime) => {
  //   if (!dateTime) return 'N/A';
  //   return new Date(dateTime).toLocaleString();
  // };

  const formatMeetingDateTime = (dateTime) => {
    if (!dateTime) return "N/A";

    const date = new Date(dateTime); // automatically converts UTC to local time

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // convert to 12-hour format

    return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
  };

  const getMeetingStatus = (meeting) => {

    return meeting?.status
  };

  const isMeetingPast = (meeting) => {

    if (meeting?.status === 'ended') return true
    else return false
  };

  const isMeetingFuture = (meeting) => {
    if (meeting?.status == "scheduled") return true;
    else return false

  };

  const hasTranscript = () => {
    return transcript || summary || meeting_insights;
  };


  const renderInsightValue = (value, key = "") => {
    // keep a counter for numbered headings
    let headingCount = 0;
  
    if (typeof value === "string") {
      if (value.includes("## ") || value.includes("- ")) {
        return (
          <div className="prose prose-sm max-w-none">
            {value.split("\n").map((line, index) => {
              const trimmedLine = line.trim();
  
              // Headings
              if (trimmedLine.startsWith("## ")) {
                headingCount += 1; // increment each time we see a heading
                return (
                  <h4
                    key={index}
                    className="text-base font-semibold text-gray-900 mt-4 mb-2 first:mt-0"
                  >
                    {`${headingCount}. ${trimmedLine.replace("## ", "")}`}
                  </h4>
                );
              }
  
              // Bullets
              if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("• ")) {
                return (
                  <div key={index} className="list-disc list-inside text-sm  text-gray-700 pl-2">
                    <li className='ml-3'>
                    {trimmedLine.replace(/^(-\s|•\s?)/, "")}
                    </li>
                  </div>
                );
              }
  
              // Empty line spacing
              if (trimmedLine === "") {
                return <div key={index} className="h-2"></div>;
              }
  
              // Regular paragraph
              return (
                <p key={index} className="text-sm text-gray-700 mb-2">
                  {trimmedLine}
                </p>
              );
            })}
          </div>
        );
      }
      return <p className="text-sm text-gray-700 whitespace-pre-wrap">{value}</p>;
    }
  
    // fallback for other cases...
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {value.map((item, index) => (
            <li key={index} className="text-sm text-gray-700">
              {typeof item === "object" ? JSON.stringify(item) : item}
            </li>
          ))}
        </ul>
      );
    }
  
    if (typeof value === "object" && value !== null) {
      return (
        <div className="space-y-2">
          {Object.entries(value).map(([subKey, subValue]) => (
            <div key={subKey}>
              <span className="font-medium text-gray-800 capitalize">
                {subKey.replace(/_/g, " ")}:
              </span>
              <div className="ml-2 mt-1">
                {renderInsightValue(subValue, subKey)}
              </div>
            </div>
          ))}
        </div>
      );
    }
  
    return <p className="text-sm text-gray-700">{value}</p>;
  };

  function isValidStructuredSummary(structuredSummary) {
    if (!structuredSummary || typeof structuredSummary !== "object") return false;
  
    try {
      // Check required keys
      if (!("minutes" in structuredSummary)) return false;
      if (!("summary_text" in structuredSummary)) return false;
      if (!("action_items" in structuredSummary)) return false;
  
      // Validate types
      if (typeof structuredSummary.summary_text !== "object") return false;
      if (!Array.isArray(structuredSummary.action_items)) return false;
      if (typeof structuredSummary.minutes !== "object") return false;
  
      // Deep check
      if (!("sections" in structuredSummary.minutes)) return false;
      if (
        !("meeting_objective" in structuredSummary.summary_text) ||
        !("high_level_outcomes" in structuredSummary.summary_text) ||
        !("key_discussion_themes" in structuredSummary.summary_text)
      ) {
        return false;
      }
  
      return true;
    } catch {
      return false;
    }
  }
   

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
      <div className="mb-8 space-y-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 group cursor-pointer"
          >
            <ArrowLeft className="mr-1 h-4 w-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Back
          </button>

          <div className="space-y-3">
            {/* Organization name with icon - subtle and secondary */}
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-gray-400" />
              <span className="text-xl sm:text-2xl font-bold text-gray-600">
                {meeting.organisation.name || "Organization"}
              </span>
            </div>

            {/* Meeting topic - primary heading */}
            <h1 className="text-xl sm:text-2xl font-bold leading-tight text-gray-900 break-words">
              {meeting.topic || 'Meeting Details'}
            </h1>

            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
              <span className={`px-3 py-1.5 text-xs sm:text-sm inline-flex items-center leading-4 font-medium rounded-full border transition-colors duration-200
                ${status === 'scheduled' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : status === 'started' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                  status === 'scheduled' 
                    ? 'bg-blue-400' 
                    : status === 'started' 
                    ? 'bg-green-400' 
                    : 'bg-gray-400'
                }`}></span>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>

              {/* Transcription Status Badge */}
              <span className={`px-3 py-1.5 text-xs sm:text-sm inline-flex items-center leading-4 font-medium rounded-full border transition-colors duration-200
                ${transcriptionStatus === 'completed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : transcriptionStatus === 'not_found'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : transcriptionStatus === 'failed'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                  transcriptionStatus === 'completed'
                    ? 'bg-emerald-400'
                    : transcriptionStatus === 'not_found'
                    ? 'bg-amber-400'
                    : transcriptionStatus === 'failed'
                    ? 'bg-red-400'
                    : 'bg-indigo-400'
                }`}></span>
                {transcriptionStatus === 'completed'
                  ? 'Transcribed'
                  : transcriptionStatus === 'not_found'
                  ? 'Not Transcribed'
                  : transcriptionStatus === 'failed'
                  ? 'Transcription Failed'
                  : 'Transcribing...'}
              </span>
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

                      <button
                        onClick={() => setShowEditModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Edit Speakers
                      </button>
                      // !speakersUpdated ? (
                      //   <button
                      //     onClick={() => setShowEditModal(true)}
                      //     className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      //   >
                      //     <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      //     </svg>
                      //     Edit Speakers
                      //   </button>
                      // ) : (
                      //   <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                      //     <svg className="-ml-1 mr-1 h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      //     </svg>
                      //     Speakers Updated
                      //   </span>
                      // )
                    )}
                  </div>
                )
              ) : (
                <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                  <button
                    onClick={handleTranscribe}
                    disabled={transcribing || isTranscriptionOngoing || (autoTranscribed && !userConfirmed) }
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

                  {!(transcribing || isTranscriptionOngoing) && (

                    <button
                      onClick={() => setShowEditModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Edit Speakers
                    </button>
                    // !speakersUpdated ? (
                    //   <button
                    //     onClick={() => setShowEditModal(true)}
                    //     className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    //   >
                    //     <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    //     </svg>
                    //     Edit Speakers
                    //   </button>
                    // ) : (
                    //   <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
                    //     <svg className="-ml-1 mr-1 h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    //     </svg>
                    //     Speakers Updated
                    //   </span>
                    // )
                  )}

                  {/* <button
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
                  </button> */}
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
            <nav className="flex space-x-3 overflow-x-auto no-scrollbar">
              {[
                meeting_insights && { key: "insights", label: "AI Insights" },
                transcript && { key: "transcript", label: "Transcript" },
                meeting_insights && { key: "speaker_summary", label: "Speaker Summary" },
                meeting_sentiment_summary && {
                  key: "meeting_sentiment",
                  label: "Overall Meeting Sentiment",
                },
              ]
                .filter(Boolean)
                .map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`relative flex-shrink-0 px-5 py-2.5 text-sm font-medium transition-all duration-300 ease-in-out rounded-sm
                      ${
                        activeTab === key
                          ? "text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] shadow-sm"
                          : "text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-800"
                      }`}
                  >
                    {label}
                    {activeTab === key && (
                      <span className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-[#0A0DC4] to-[#8B0782]" />
                    )}
                  </button>
                ))}
            </nav>
          </div>

          {/* Tab Content */}

          <div className="px-4 py-5 sm:px-6 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab} // important for exit/enter animations
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                layout
              >
                {/* --- AI Insights --- */}
                {activeTab === "insights" && meeting_insights && (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        AI-Generated Insights
                      </h3>

                      {isValidStructuredSummary(meeting_insights?.structured_summary) && (
                        <div className="flex flex-wrap items-center gap-2">
                          {availableLanguages.length > 1 && (
                            <select
                              value={selectedLang}
                              onChange={(e) => setSelectedLang(e.target.value)}
                              className="border rounded-md px-2 py-1 text-sm"
                            >
                              {availableLanguages.map((lang) => (
                                <option key={lang} value={lang}>
                                  {lang.toUpperCase()}
                                </option>
                              ))}
                            </select>
                          )}

                          <button
                            onClick={() =>
                              generateMeetingPDF(meeting, meeting_insights, speaker_summaries)
                            }
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[#0A0DC4] to-[#8B0782] hover:from-[#080aa8] hover:to-[#6d0668] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <FileDown className="w-4 h-4" />
                            <span className="hidden xs:inline">Download PDF</span>
                            <span className="xs:hidden">PDF</span>
                          </button>

                          <button
                            onClick={() => {
                              setDraftSummary(_.cloneDeep(meeting_insights?.structured_summary || {}));
                              setIsEditingAiInsight(true);
                            }}
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-100 focus:outline-none"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              setIsSendSummaryModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-gray-700 border border-gray-300 hover:bg-gray-100 focus:outline-none"
                          >
                            Share
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditingAiInsight ? (
                      <EditStructuredSummary
                        meetingId={meeting.meeting_id}
                        draftSummary={draftSummary}
                        setDraftSummary={setDraftSummary}
                        summaryLang={selectedSummaryLang}
                        onCancel={() => setIsEditingAiInsight(false)}
                        onSave={() => {
                          setMeeting_insights((prev) => ({
                            ...prev,
                            structured_summary: draftSummary,
                          }));
                          setIsEditingAiInsight(false);
                        }}
                      />
                    ) : (
                        <div className="bg-green-50 p-4 rounded-lg space-y-8">
                          {/* 🔹 Schema Guard */}
                          {!isValidStructuredSummary(meeting_insights?.structured_summary) ? (
                            <div className="p-4 text-center text-sm text-red-600 bg-red-50 rounded-md">
                              This transcript is using an older summary format. Please retranscribe to view insights.
                            </div>
                          ) : (
                            <div className="space-y-8">
                              {/* Meeting Summary */}
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                  Meeting Summary
                                </h4>
                                <div className="prose prose-sm max-w-none space-y-4">
                                  <h5 className="font-medium text-gray-900">Meeting Objective:</h5>
                                  <p className='text-gray-700'>
                                    {meeting_insights.structured_summary.summary_text.meeting_objective}
                                  </p>
                                  <div>
                                    <h5 className="font-medium text-gray-900">High-level Outcomes:</h5>
                                    <ul className="ml-3 list-disc list-inside text-gray-700">
                                      {meeting_insights.structured_summary.summary_text.high_level_outcomes.map(
                                        (outcome, index) => (
                                          <li key={index}>{outcome}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-gray-900">Key Discussion Themes:</h5>
                                    <ul className="ml-3 list-disc list-inside text-gray-700">
                                      {meeting_insights.structured_summary.summary_text.key_discussion_themes.map(
                                        (theme, index) => (
                                          <li key={index}>{theme}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              </div>

                              {/* Minutes of the Meeting */}
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                  Minutes of the Meeting
                                </h4>

                                {/* Date & Attendees */}
                                <div className="mb-6">
                                  <p className="text-sm text-gray-700">
                                    <span className="font-medium">Date:</span>{" "}
                                    {meeting?.end_time
                                      ? format(new Date(meeting.end_time), "MMMM d, yyyy, h:mm a")
                                      : "N/A"}
                                  </p>

                                  {meeting_insights.structured_summary.attendees?.length > 0 && (
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                      <span className="text-sm font-medium text-gray-800">
                                        Attendees:
                                      </span>
                                      {meeting_insights.structured_summary.attendees.map(
                                        (attendee, index) => (
                                          <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-800"
                                          >
                                            {attendee}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Minutes Sections */}
                                <div className="space-y-4">
                                  {meeting_insights.structured_summary.minutes.sections.map(
                                    (section, index) => (
                                      <div key={index}>
                                        <h5 className="font-medium text-gray-900">
                                          {index + 1}. {section.title}
                                        </h5>
                                        <ul className="ml-3 list-disc list-inside text-gray-700">
                                          {section.points.map((point, idx) => (
                                            <li key={idx}>{point}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )
                                  )}
                                </div>

                              </div>

                              {/* Action Items */}
                              {meeting_insights.structured_summary.action_items.length > 0 && (
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                    Action Items
                                  </h4>
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full border border-gray-200 text-sm text-left">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="px-3 py-2 font-medium text-gray-700 border-b">
                                            Task
                                          </th>
                                          <th className="px-3 py-2 font-medium text-gray-700 border-b">
                                            Responsible Person
                                          </th>
                                          <th className="px-3 py-2 font-medium text-gray-700 border-b">
                                            Deadline
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {meeting_insights.structured_summary.action_items.map(
                                          (item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                              <td className="px-3 py-2 border-b text-gray-700">
                                                {item.task}
                                              </td>
                                              <td className="px-3 py-2 border-b text-gray-700">
                                                {item.owner || "N/A"}
                                              </td>
                                              <td className="px-3 py-2 border-b text-gray-700">
                                                {item.deadline}
                                              </td>
                                            </tr>
                                          )
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                    )}

                    
                    
                  </div>
                )}

                {/* --- Transcript --- */}
                {activeTab === "transcript" && (
                  <div className="space-y-4">

                    {/* Header (mirror summary style) */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Meeting Transcript
                      </h3>

                      {availableLanguages.length > 1 && (
                        <select
                          value={selectedLang}
                          onChange={(e) => setSelectedLang(e.target.value)}
                          className="border rounded-md px-2 py-1 text-sm"
                        >
                          {availableLanguages.map((lang) => (
                            <option key={lang} value={lang}>
                              {lang.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Body */}
                    <div className="bg-white p-4 rounded-xl shadow-sm max-h-[70vh] sm:max-h-96 overflow-y-auto divide-y divide-gray-100">
                      {Array.isArray(transcript) && transcript.length > 0 ? (
                        transcript.map((u, idx) => {
                          const formatTime = (ms) => {
                            const totalSeconds = Math.floor(ms / 1000);
                            const hours = Math.floor(totalSeconds / 3600);
                            const minutes = Math.floor((totalSeconds % 3600) / 60);
                            const seconds = totalSeconds % 60;
                            return [hours, minutes, seconds]
                              .map((v) => String(v).padStart(2, "0"))
                              .join(":");
                          };

                          return (
                            <div key={idx} className="py-2">
                              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                <span className="inline-block bg-indigo-100 text-indigo-700 font-medium px-2 py-0.5 rounded-md mr-2">
                                  {formatSpeakerLabel(u.speaker)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  [{formatTime(u.start)}]
                                </span>
                              </p>

                              <p className="mt-1 text-gray-900">
                                {getUtteranceText(u, selectedLang)}
                              </p>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-gray-500 italic">No transcript available.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* --- Speaker Summary --- */}
                {activeTab === "speaker_summary" && (
                  <>
                    {speaker_summary_table ? (
                      <div className="mb-3">
                        
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                          Speaker Summary
                        </h3>
                        {availableLanguages.length > 1 && (
                          <div className='mb-4 flex flex-row gap-3'>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Language:
                              </label>
                            </div>

                            <div></div>
                            
                            <select
                              value={selectedLang}
                              onChange={(e) => setSelectedLang(e.target.value)}
                              className="border rounded-md px-2 py-1 text-sm"
                            >
                              {availableLanguages.map((lang) => (
                                <option key={lang} value={lang}>
                                  {lang.toUpperCase()}
                                </option>
                              ))}
                            </select>
                          </div>
                            
                          )}

                        

                        {/* Speaker Selection Row */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Speaker:
                          </label>

                          {/* Scrollable Chip Container */}
                          <div className="relative">
                            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md">
                              {Object.keys(speaker_summaries).map((speakerKey) => (
                                <button
                                  key={speakerKey}
                                  onClick={() => setSelectedSpeaker(speakerKey)}
                                  className={`flex-shrink-0 px-3 py-1.5 rounded-full border text-sm font-medium transition ${
                                    selectedSpeaker === speakerKey
                                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                      : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
                                  }`}
                                >
                                  {speakerKey}
                                </button>
                              ))}
                            </div>

                            {/* subtle gradient fade on right for overflow hint */}
                            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white" />
                          </div>
                        </div>

                        {/* Speaker Summary */}
                        {selectedSpeaker && (
                          <div className="bg-blue-50 p-4 rounded-lg mb-6">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">
                              {speaker_summaries[selectedSpeaker]}
                            </p>
                          </div>
                        )}

                        {/* Speaker Pie Chart */}
                        {selectedSpeaker && (
                          <div className="max-w-full sm:max-w-md mx-auto">
                            <SpeakerPieChart
                              data={speaker_summary_table.find((entry) => {
                                // Extract just the letter from "Speaker B" -> "B"
                                const selectedLetter = selectedSpeaker.replace('Speaker ', '').trim();
                                return entry.Speaker.toLowerCase() === selectedLetter.toLowerCase();
                              })}
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

                {/* --- Meeting Sentiment --- */}
                {activeTab === "meeting_sentiment" &&
                  meeting_sentiment_summary &&
                  Array.isArray(transcript) && (
                    <div>
                      <SentimentSummaryTable summary={meeting_sentiment_summary} />
                    </div>
                )}

              </motion.div>
            </AnimatePresence>
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
              Choose an audio file to transcribe.
            </p>

            {/* File Input */}
            <input
              type="file"
              onChange={handleFileChange}
              accept="audio/*"
              className="block w-full text-xs sm:text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            {fileError && (
              <p className="mt-2 text-xs sm:text-sm text-red-600 text-center">{fileError}</p>
            )}

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

            {transcribing && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            {uploadProgress > 0 && transcribing && (
              <p className="text-xs text-gray-600 mt-1 text-center">
                Uploading... {uploadProgress}%
              </p>
            )}

            
          </div>
        </div>
      )}


      <EditSpeakersModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        meetingId={meetingId}
        utterances={transcript}
        selectedLang={selectedLang}          
        onLanguageChange={setSelectedLang}
        availableLanguages={availableLanguages}   
        onUpdateSuccess={async () => {
          await checkTranscriptionStatus();
          await fetchMeetingDetails();
        }}
      />

      <SendSummaryModal
        isOpen={isSendSummaryModalOpen}
        onClose={() => setIsSendSummaryModalOpen(false)}
        meeting={meeting}
        orgId={orgId}
        members={members}
        onSuccess={() => {
          setIsSendSummaryModalOpen(false);
        }}
      />



      </div>

      
  );
}