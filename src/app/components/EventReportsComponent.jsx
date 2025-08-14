'use client';

import { useEffect, useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function EventReportsComponent({ makeApiCall, getAuthHeaders, orgColors }) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState('1w');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async () => {
    setLoading(true);

    try {
      const params = {};

      if (startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      } else if (duration !== 'all') {
        params.duration = duration;
      }

      const res = await axios.get(`${API_BASE_URL}/calendar/event-reports/`, { params });
      setReport(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [duration, endDate]);

  const handleStartDateChange = (value) => {
    setStartDate(value);

    if (endDate && new Date(value) >= new Date(endDate)) {
      const nextDay = new Date(value);
      nextDay.setDate(nextDay.getDate() + 1);
      setEndDate(nextDay.toISOString().split('T')[0]);
    }

    // setDuration('all');

  };

  const handleEndDateChange = (value) => {
    if (startDate && new Date(value) <= new Date(startDate)) {
      toast.error('End date must be after start date.');
      return;
    }
    setEndDate(value);
    setDuration('all');
  };

  const handleDurationChange = (value) => {
    setDuration(value);
    if (value !== 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading report...</div>;
  }

  if (!report) {
    return <div className="text-sm text-red-500">Failed to load report.</div>;
  }

  const {
    duration_type,
    summary,
    time_breakdown,
    organisation_breakdown,
    personal_vs_organization,
    highlights,
  } = report;

  const formatTimeLabel = (label) => {
    if (/^\d{4}-\d{2}$/.test(label)) {
      const parsedDate = parseISO(label + '-01');
      return isValid(parsedDate) ? format(parsedDate, 'MMMM yyyy') : label;
    }
    return label;
  };

  return (
    <div className="space-y-6 text-sm text-gray-800">
      {/* Duration + Date Filters */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <label className="text-sm text-gray-600">Duration:</label>
        <select
          value={duration}
          onChange={(e) => handleDurationChange(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm shadow-sm"
        >
          <option value="1w">Last 1 Week</option>
          <option value="1m">Last 1 Month</option>
          <option value="3m">Last 3 Months</option>
          <option value="all">All</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm shadow-sm"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => handleEndDateChange(e.target.value)}
          min={
            startDate
              ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1))
                  .toISOString()
                  .split('T')[0]
              : ''
          }
          className="border border-gray-300 rounded-md px-2 py-1 text-sm shadow-sm"
        />
      </div>

      {/* Summary */}
      <div className="border rounded-md p-4 bg-white shadow">
        <h2 className="text-lg font-semibold mb-3">Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="Total Events" value={summary.total_events} />
          <SummaryCard label="Total Meetings" value={summary.total_meetings} />
          <SummaryCard label="Event Hours" value={summary.total_event_hours.toFixed(2)} />
          <SummaryCard label="Meeting Hours" value={summary.total_meeting_hours.toFixed(2)} />
        </div>
      </div>

      {/* Time Breakdown */}
      <div className="border rounded-md p-4 bg-white shadow">
        <h2 className="text-lg font-semibold mb-3">
          {duration_type === '1w' ? 'Weekly Breakdown' : 'Monthly Breakdown'}
        </h2>
        <ul className="divide-y">
          {time_breakdown.map((block) => (
            <li key={block.label} className="py-2">
              <div className="font-medium">{formatTimeLabel(block.label)}</div>
              <div className="text-sm text-gray-600">
                {block.event_count} events ({block.event_hours.toFixed(2)} hrs),{' '}
                {block.meeting_count} meetings
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Organization Breakdown */}
      <div className="border rounded-md p-4 bg-white shadow">
        <h2 className="text-lg font-semibold mb-3">Organization Breakdown</h2>
        <ul className="divide-y">
          {organisation_breakdown.map((org) => (
            <li key={org.org_id} className="py-3 flex justify-between items-center">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: orgColors?.[org.org_name] || '#6B7280' }}
                  ></span>
                  <span className="font-medium">{org.org_name}</span>
                </div>
                <div className="text-xs text-gray-600">
                  {org.event_count} events, {org.meeting_count} meetings,
                  {` ${org.total_hours.toFixed(2)} hrs`}
                  <br />
                  Last Event: {format(new Date(org.last_event_date), 'MMM d, yyyy')}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Personal vs Org */}
      <div className="border rounded-md p-4 bg-white shadow">
        <h2 className="text-lg font-semibold mb-3">Personal vs Organization</h2>
        <div className="grid grid-cols-2 gap-4">
          <SummaryCard label="Personal Events" value={personal_vs_organization.personal_events} />
          <SummaryCard label="Org Events" value={personal_vs_organization.organization_events} />
          <SummaryCard label="Personal Hours" value={personal_vs_organization.personal_hours.toFixed(2)} />
          <SummaryCard label="Org Hours" value={personal_vs_organization.organization_hours.toFixed(2)} />
        </div>
      </div>

      {/* Highlights */}
      <div className="border rounded-md p-4 bg-white shadow">
        <h2 className="text-lg font-semibold mb-3">Highlights</h2>
        <ul className="text-sm space-y-2 text-gray-700">
          <li>
            <strong>Busiest {duration_type === '1w' ? 'Day' : 'Month'}:</strong>{' '}
            {formatTimeLabel(highlights.busiest_time_block)}
          </li>
          {highlights.longest_event ? (
            <li>
              <strong>Longest Event:</strong> {highlights.longest_event.title} (
              {highlights.longest_event.duration_hours.toFixed(2)} hrs) on{' '}
              {format(new Date(highlights.longest_event.start), 'MMM d, yyyy')}
            </li>
          ) : (
            <li>
              <strong>Longest Event:</strong> No data available.
            </li>
          )}
          <li>
            <strong>Most Active Org:</strong> {highlights.most_active_organisation}
          </li>
        </ul>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-gray-100 p-3 rounded-md text-center shadow-sm">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
}
