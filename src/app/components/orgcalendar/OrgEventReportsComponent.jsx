'use client';

import { useEffect, useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import axios from 'axios';


export default function OrgEventReportsComponent({
  orgId,
  orgName,
  makeApiCall,
  getAuthHeaders,
  orgColors
}) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState('1w');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const params = {};
        if (duration !== 'all') params.duration = duration;
        if (orgId) params.org_id = orgId;
  
        const { data } = await axios.get(`${API_BASE_URL}/calendar/event-reports/`, { params });
  
        setReport(data);
      } catch (err) {
        console.error('Error fetching org reports:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchReports();
  }, [duration, orgId]);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading report for {orgName}...</div>;
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
      {/* Header */}
      <div className="text-sm font-medium text-gray-700">
        <span className="block mb-1">Organization: <strong>{orgName}</strong></span>
      </div>

      {/* Duration Selector */}
      <div className="flex items-center justify-end">
        <label htmlFor="duration" className="mr-2 text-sm text-gray-600">Duration:</label>
        <select
          id="duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm shadow-sm"
        >
          <option value="1w">Last 1 Week</option>
          <option value="1m">Last 1 Month</option>
          <option value="3m">Last 3 Months</option>
          <option value="all">All</option>
        </select>
      </div>

      {/* Summary Block */}
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
                {block.event_count} events ({block.event_hours.toFixed(2)} hrs), {block.meeting_count} meetings
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Org Breakdown */}
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
                  {` ${org.total_hours.toFixed(2)} hrs`}<br />
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
