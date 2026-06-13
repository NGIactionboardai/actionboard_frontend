'use client';

import { useEffect, useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse } from "date-fns";
import { Calendar, Download } from "lucide-react";

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

  const formatTimeLabel = (label) => {
    if (!label) return '—';
    if (/^\d{4}-\d{2}$/.test(label)) {
      const parsedDate = parseISO(label + '-01');
      return isValid(parsedDate) ? format(parsedDate, 'MMMM yyyy') : label;
    }
    return label;
  };

  const getPeriodLabel = () => {
    if (!report) return '';
    const { report_metadata, duration_type } = report;
    if (report_metadata?.period_start && report_metadata?.period_end) {
      return `${format(new Date(report_metadata.period_start), 'MMM d, yyyy')} – ${format(new Date(report_metadata.period_end), 'MMM d, yyyy')}`;
    }
    const labels = { '1w': 'Last 1 Week', '1m': 'Last 1 Month', '3m': 'Last 3 Months', all: 'All Time' };
    return labels[duration_type] || duration_type;
  };

  const generatePrintHTML = () => {
    if (!report) return '';
    const { report_metadata, summary, time_breakdown, organisation_breakdown, personal_vs_organization, highlights, duration_type } = report;
    const generatedAt = report_metadata?.generated_at ? format(new Date(report_metadata.generated_at), 'PPp') : '';
    const periodLabel = getPeriodLabel();
    const logoUrl = `${window.location.origin}/nous_logo.png`;

    const timeRows = time_breakdown.map(b => `
      <tr>
        <td>${formatTimeLabel(b.label)}</td>
        <td>${b.event_count}</td>
        <td>${b.event_hours.toFixed(2)}</td>
        <td>${b.meeting_count}</td>
        <td>${b.meeting_hours.toFixed(2)}</td>
      </tr>`).join('');

    const orgRows = (organisation_breakdown || []).map(o => `
      <tr>
        <td>${o.org_name}</td>
        <td>${o.event_count}</td>
        <td>${o.meeting_count}</td>
        <td>${o.total_hours.toFixed(2)}</td>
        <td>${o.last_event_date ? format(new Date(o.last_event_date), 'MMM d, yyyy') : '—'}</td>
      </tr>`).join('');

    const pvSection = personal_vs_organization ? `
      <div class="section">
        <h2>Personal vs Organization</h2>
        <div class="grid4">
          <div class="card"><div class="val">${personal_vs_organization.personal_events}</div><div class="lbl">Personal Events</div></div>
          <div class="card"><div class="val">${personal_vs_organization.organization_events}</div><div class="lbl">Org Events</div></div>
          <div class="card"><div class="val">${personal_vs_organization.personal_hours.toFixed(2)}</div><div class="lbl">Personal Hours</div></div>
          <div class="card"><div class="val">${personal_vs_organization.organization_hours.toFixed(2)}</div><div class="lbl">Org Hours</div></div>
        </div>
      </div>` : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Event Report – ${periodLabel}</title>
  <style>
    body{font-family:Arial,sans-serif;margin:40px;color:#1f2937}
    .header{display:flex;align-items:center;gap:16px;margin-bottom:24px}
    .logo{height:40px;width:auto;object-fit:contain}
    h1{font-size:22px;margin:0 0 4px 0}
    .meta{color:#6b7280;font-size:12px}
    .section{margin-bottom:20px;border:1px solid #e5e7eb;border-radius:6px;padding:16px;page-break-inside:avoid}
    .section h2{font-size:15px;font-weight:600;margin:0 0 12px 0}
    .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
    .grid5{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
    .card{background:#f3f4f6;padding:10px;border-radius:4px;text-align:center}
    .card .val{font-size:18px;font-weight:700}
    .card .lbl{font-size:10px;color:#6b7280;margin-top:2px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{text-align:left;padding:7px 8px;background:#f9fafb;font-weight:600;border-bottom:1px solid #e5e7eb}
    td{padding:7px 8px;border-bottom:1px solid #f3f4f6}
    ul.hl{list-style:none;padding:0;margin:0;font-size:13px}
    ul.hl li{margin-bottom:6px}
    @media print{body{margin:20px}}
  </style>
</head>
<body>
  <div class="header">
    <img src="${logoUrl}" alt="Nous Meeting" class="logo" />
    <div>
      <h1>Event Report</h1>
      <div class="meta">Period: ${periodLabel}&nbsp;&nbsp;|&nbsp;&nbsp;Generated: ${generatedAt}</div>
    </div>
  </div>

  <div class="section">
    <h2>Summary</h2>
    <div class="${summary.avg_events_per_day !== null ? 'grid5' : 'grid4'}">
      <div class="card"><div class="val">${summary.total_events}</div><div class="lbl">Total Events</div></div>
      <div class="card"><div class="val">${summary.total_meetings}</div><div class="lbl">Meetings</div></div>
      <div class="card"><div class="val">${summary.total_event_hours.toFixed(2)}</div><div class="lbl">Event Hours</div></div>
      <div class="card"><div class="val">${summary.total_meeting_hours.toFixed(2)}</div><div class="lbl">Meeting Hours</div></div>
      ${summary.avg_events_per_day !== null ? `<div class="card"><div class="val">${summary.avg_events_per_day}</div><div class="lbl">Avg Events/Day</div></div>` : ''}
    </div>
  </div>

  <div class="section">
    <h2>${duration_type === '1w' ? 'Weekly Breakdown' : 'Monthly Breakdown'}</h2>
    <table>
      <thead><tr><th>Period</th><th>Events</th><th>Event Hrs</th><th>Meetings</th><th>Meeting Hrs</th></tr></thead>
      <tbody>${timeRows}</tbody>
    </table>
  </div>

  ${orgRows ? `<div class="section">
    <h2>Organization Breakdown</h2>
    <table>
      <thead><tr><th>Organization</th><th>Events</th><th>Meetings</th><th>Hours</th><th>Last Event</th></tr></thead>
      <tbody>${orgRows}</tbody>
    </table>
  </div>` : ''}

  ${pvSection}

  <div class="section">
    <h2>Highlights</h2>
    <ul class="hl">
      ${highlights.busiest_time_block ? `<li><strong>Busiest ${duration_type === '1w' ? 'Day' : 'Month'}:</strong> ${formatTimeLabel(highlights.busiest_time_block)}</li>` : ''}
      ${highlights.peak_hour ? `<li><strong>Peak Hour:</strong> ${highlights.peak_hour}</li>` : ''}
      ${highlights.longest_event ? `<li><strong>Longest Event:</strong> ${highlights.longest_event.title} (${highlights.longest_event.duration_hours.toFixed(2)} hrs) on ${format(new Date(highlights.longest_event.start), 'MMM d, yyyy')}</li>` : ''}
      ${highlights.most_active_organisation ? `<li><strong>Most Active Org:</strong> ${highlights.most_active_organisation}</li>` : ''}
    </ul>
  </div>
</body>
</html>`;
  };

  const handleDownload = () => {
    const html = generatePrintHTML();
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading report...</div>;
  }

  if (!report) {
    return <div className="text-sm text-red-500">Failed to load report.</div>;
  }

  const {
    duration_type,
    report_metadata,
    summary,
    time_breakdown,
    organisation_breakdown,
    personal_vs_organization,
    highlights,
  } = report;

  return (
    <div className="space-y-6 text-sm text-gray-800">
      {/* Toolbar: filters + actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Period meta */}
        <div className="text-xs text-gray-500">
          <span className="font-medium">{getPeriodLabel()}</span>
          {report_metadata?.generated_at && (
            <span className="ml-2 text-gray-400">
              · Generated {format(new Date(report_metadata.generated_at), 'MMM d, yyyy, h:mm a')}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Duration selector */}
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

          {/* Start Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <DatePicker
              selected={startDate ? parse(startDate, "yyyy-MM-dd", new Date()) : null}
              onChange={(date) => {
                if (date) handleStartDateChange(format(date, "yyyy-MM-dd"));
                else setStartDate("");
              }}
              dateFormat="MM/dd/yyyy"
              placeholderText="Start date"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <DatePicker
              selected={endDate ? parse(endDate, "yyyy-MM-dd", new Date()) : null}
              onChange={(date) => {
                if (date) handleEndDateChange(format(date, "yyyy-MM-dd"));
                else setEndDate("");
              }}
              minDate={startDate ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1)) : null}
              dateFormat="MM/dd/yyyy"
              placeholderText="End date"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700"
            title="Open printable report"
          >
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="border rounded-md p-4 bg-white shadow">
        <h2 className="text-lg font-semibold mb-3">Summary</h2>
        <div className={`grid gap-4 ${summary.avg_events_per_day !== null ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'}`}>
          <SummaryCard label="Total Events" value={summary.total_events} />
          <SummaryCard label="Total Meetings" value={summary.total_meetings} />
          <SummaryCard label="Event Hours" value={summary.total_event_hours.toFixed(2)} />
          <SummaryCard label="Meeting Hours" value={summary.total_meeting_hours.toFixed(2)} />
          {summary.avg_events_per_day !== null && (
            <SummaryCard label="Avg Events / Day" value={summary.avg_events_per_day} />
          )}
        </div>
      </div>

      {/* Time Breakdown */}
      <div className="border rounded-md p-4 bg-white shadow">
        <h2 className="text-lg font-semibold mb-3">
          {duration_type === '1w' ? 'Weekly Breakdown' : 'Monthly Breakdown'}
        </h2>
        <ul className="divide-y">
          {time_breakdown.map((block) => {
            const maxEvents = Math.max(...time_breakdown.map(b => b.event_count), 1);
            const pct = Math.round((block.event_count / maxEvents) * 100);
            return (
              <li key={block.label} className="py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{formatTimeLabel(block.label)}</span>
                  <span className="text-xs text-gray-500">{block.event_count} events · {block.event_hours.toFixed(2)} hrs · {block.meeting_count} meetings</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Organization Breakdown */}
      {organisation_breakdown?.length > 0 && (
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
                    />
                    <span className="font-medium">{org.org_name}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {org.event_count} events · {org.meeting_count} meetings · {org.total_hours.toFixed(2)} hrs
                    {org.last_event_date && (
                      <span className="ml-1">· Last: {format(new Date(org.last_event_date), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Personal vs Org */}
      {personal_vs_organization && (
        <div className="border rounded-md p-4 bg-white shadow">
          <h2 className="text-lg font-semibold mb-3">Personal vs Organization</h2>
          <div className="grid grid-cols-2 gap-4">
            <SummaryCard label="Personal Events" value={personal_vs_organization.personal_events} />
            <SummaryCard label="Org Events" value={personal_vs_organization.organization_events} />
            <SummaryCard label="Personal Hours" value={personal_vs_organization.personal_hours.toFixed(2)} />
            <SummaryCard label="Org Hours" value={personal_vs_organization.organization_hours.toFixed(2)} />
          </div>
        </div>
      )}

      {/* Highlights */}
      <div className="border rounded-md p-4 bg-white shadow">
        <h2 className="text-lg font-semibold mb-3">Highlights</h2>
        <ul className="text-sm space-y-2 text-gray-700">
          {highlights.busiest_time_block && (
            <li>
              <strong>Busiest {duration_type === '1w' ? 'Day' : 'Month'}:</strong>{' '}
              {formatTimeLabel(highlights.busiest_time_block)}
            </li>
          )}
          {highlights.peak_hour && (
            <li><strong>Peak Hour:</strong> {highlights.peak_hour}</li>
          )}
          {highlights.longest_event ? (
            <li>
              <strong>Longest Event:</strong> {highlights.longest_event.title} (
              {highlights.longest_event.duration_hours.toFixed(2)} hrs) on{' '}
              {format(new Date(highlights.longest_event.start), 'MMM d, yyyy')}
            </li>
          ) : (
            <li><strong>Longest Event:</strong> No data available.</li>
          )}
          {highlights.most_active_organisation && (
            <li><strong>Most Active Org:</strong> {highlights.most_active_organisation}</li>
          )}
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
