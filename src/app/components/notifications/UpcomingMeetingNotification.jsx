'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/redux/auth/authSlices';
import { selectCurrentOrganization, selectCurrentUserRole } from '@/redux/auth/organizationSlice';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getRelativeTime(utcDateStr) {
  const meetingDate = new Date(utcDateStr);
  const now = new Date();
  const diffMs = meetingDate - now;

  if (diffMs <= 0) return 'Starting now';

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `in ${diffMins} min`;
  if (diffHours < 24) return `in ${diffHours}h ${diffMins % 60}m`;
  return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
}

function formatLocalDateTime(utcDateStr) {
  return new Date(utcDateStr).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function UpcomingMeetingNotification() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = useSelector((state) => state.auth?.token);
  const currentOrg = useSelector(selectCurrentOrganization);
  const role = useSelector(selectCurrentUserRole);

  const [meeting, setMeeting] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [relativeTime, setRelativeTime] = useState('');
  const timerRef = useRef(null);

  const orgId = currentOrg?.org_id || currentOrg?.id;

  const fetchUpcoming = useCallback(async () => {
    if (!orgId || !isAuthenticated || !token) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/meetings/upcoming-notification/${orgId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.meeting) {
        setMeeting(res.data.meeting);
        setRelativeTime(getRelativeTime(res.data.meeting.start_time));
      }
    } catch {
      // silently ignore — notification is non-critical
    }
  }, [orgId, isAuthenticated, token]);

  // Fetch once org is known
  useEffect(() => {
    if (orgId && isAuthenticated && role && role !== 'viewer') {
      fetchUpcoming();
    }
  }, [orgId, isAuthenticated, role, fetchUpcoming]);

  // Slide in after meeting data arrives
  useEffect(() => {
    if (meeting && !dismissed) {
      const t = setTimeout(() => setVisible(true), 300);
      return () => clearTimeout(t);
    }
  }, [meeting, dismissed]);

  // Update relative time every minute
  useEffect(() => {
    if (!meeting) return;
    timerRef.current = setInterval(() => {
      setRelativeTime(getRelativeTime(meeting.start_time));
    }, 60000);
    return () => clearInterval(timerRef.current);
  }, [meeting]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => setDismissed(true), 350);
  };

  if (!isAuthenticated || !meeting || dismissed || role === 'viewer') return null;

  const localTime = formatLocalDateTime(meeting.start_time);
  const isUrgent = (() => {
    const diffMs = new Date(meeting.start_time) - new Date();
    return diffMs > 0 && diffMs <= 30 * 60 * 1000;
  })();

  return (
    <div
      aria-live="polite"
      aria-label="Upcoming meeting notification"
      style={{
        position: 'fixed',
        top: '88px',
        right: '24px',
        zIndex: 9999,
        width: '340px',
        maxWidth: 'calc(100vw - 32px)',
        transform: visible ? 'translateX(0)' : 'translateX(calc(100% + 32px))',
        transition: 'transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.35s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(30, 58, 138, 0.18), 0 2px 8px rgba(0,0,0,0.10)',
          border: `1.5px solid ${isUrgent ? '#fbbf24' : '#e0e7ff'}`,
          overflow: 'hidden',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: '4px',
            background: isUrgent
              ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
              : 'linear-gradient(90deg, #1e3a8a, #3b82f6)',
          }}
        />

        {/* Header row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px 8px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Bell / clock icon */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isUrgent ? '#fef3c7' : '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0,
              }}
            >
              {isUrgent ? '⏰' : '📅'}
            </div>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isUrgent ? '#b45309' : '#1e3a8a',
                }}
              >
                {isUrgent ? 'Starting Soon' : 'Upcoming Meeting'}
              </div>
              {/* Relative time badge */}
              <div
                style={{
                  display: 'inline-block',
                  marginTop: '2px',
                  padding: '1px 8px',
                  borderRadius: '20px',
                  background: isUrgent ? '#fef3c7' : '#eff6ff',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: isUrgent ? '#92400e' : '#1d4ed8',
                  border: `1px solid ${isUrgent ? '#fde68a' : '#bfdbfe'}`,
                }}
              >
                {relativeTime}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss notification"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '1px solid #e5e7eb',
              background: '#f9fafb',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: '#6b7280',
              flexShrink: 0,
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.color = '#dc2626';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f9fafb';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '0 16px 16px 16px' }}>
          {/* Meeting topic */}
          <div
            style={{
              fontSize: '15px',
              fontWeight: '700',
              color: '#111827',
              lineHeight: '1.3',
              marginBottom: '6px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={meeting.topic || 'Untitled Meeting'}
          >
            {meeting.topic || 'Untitled Meeting'}
          </div>

          {/* Org name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '10px',
            }}
          >
            <span>🏢</span>
            <span
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {meeting.organisation_name}
            </span>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid #f3f4f6', margin: '10px 0' }} />

          {/* Time */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#374151',
              marginBottom: '14px',
            }}
          >
            <span>🕐</span>
            <span>{localTime}</span>
            <span style={{ color: '#d1d5db' }}>·</span>
            <span
              style={{
                color: isUrgent ? '#b45309' : '#4b5563',
                fontWeight: isUrgent ? '600' : '400',
              }}
            >
              {isUrgent ? `⚡ ${relativeTime}` : relativeTime}
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {meeting.join_url && (
              <a
                href={meeting.join_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  display: 'block',
                  textAlign: 'center',
                  padding: '9px 0',
                  borderRadius: '8px',
                  background: '#1e3a8a',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#1e3a8a')}
              >
                Join Meeting
              </a>
            )}
            <button
              onClick={handleDismiss}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                background: '#ffffff',
                color: '#6b7280',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
