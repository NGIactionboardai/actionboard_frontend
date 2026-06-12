'use client';

import { useEffect, useState } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse } from "date-fns";
import { Calendar, Download, Printer } from "lucide-react";
import { toast } from 'react-hot-toast';

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
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
        if (orgId) params.org_id = orgId;

        const { data } = await axios.get(`${API_BASE_URL}/calendar/event-reports/`, { params });
        setReport(data);
      } catch (err) {
        console.error('Error fetching org reports:', err);
        toast.error('Failed to fetch report');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [duration, endDate, orgId]);

  const handleStartDateChange = (value) => {
    setStartDate(value);
    if (endDate && new Date(endDate) <= new Date(value)) {
      const nextDay = new Date(value);
      nextDay.setDate(nextDay.getDate() + 1);
      setEndDate(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleEndDateChange = (value) => {
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
    const { report_metadata, summary, time_breakdown, highlights, duration_type } = report;
    const generatedAt = report_metadata?.generated_at ? format(new Date(report_metadata.generated_at), 'PPp') : '';
    const periodLabel = getPeriodLabel();

    const timeRows = time_breakdown.map(b => `
      <tr>
        <td>${formatTimeLabel(b.label)}</td>
        <td>${b.event_count}</td>
        <td>${b.event_hours.toFixed(2)}</td>
        <td>${b.meeting_count}</td>
        <td>${b.meeting_hours.toFixed(2)}</td>
      </tr>`).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${orgName} – Event Report – ${periodLabel}</title>
  <style>
    body{font-family:Arial,sans-serif;margin:40px;color:#1f2937}
    h1{font-size:22px;margin-bottom:4px}
    .org{font-size:14px;color:#4b5563;margin-bottom:4px}
    .meta{color:#6b7280;font-size:12px;margin-bottom:28px}
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
  <div class="org">Organization: <strong>${orgName}</strong></div>
  <h1>Event Report</h1>
  <div class="meta">Period: ${periodLabel}&nbsp;&nbsp;|&nbsp;&nbsp;Generated: ${generatedAt}</div>

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

  <div class="section">
    <h2>Highlights</h2>
    <ul class="hl">
      ${highlights.busiest_time_block ? `<li><strong>Busiest ${duration_type === '1w' ? 'Day' : 'Month'}:</strong> ${formatTimeLabel(highlights.busiest_time_block)}</li>` : ''}
      ${highlights.peak_hour ? `<li><strong>Peak Hour:</strong> ${highlights.peak_hour}</li>` : ''}
      ${highlights.longest_event ? `<li><strong>Longest Event:</strong> ${highlights.longest_event.title} (${highlights.longest_event.duration_hours.toFixed(2)} hrs) on ${format(new Date(highlights.longest_event.start), 'MMM d, yyyy')}</li>` : '<li><strong>Longest Event:</strong> No data available.</li>'}
    </ul>
  </div>
</body>
</html>`;
  };

  const handlePrint = () => {
    const html = generatePrintHTML();
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  const handleDownload = () => {
    const html = generatePrintHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (orgName || 'org').replace(/[^\w]/g, '-');
    const periodLabel = getPeriodLabel().replace(/\s[–-]\s/g, '_to_').replace(/[^\w]/g, '-');
    a.download = `${safeName}-report-${periodLabel}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading report for {orgName}...</div>;
  }

  if (!report) {
    return <div className="text-sm text-red-500">Failed to load report.</div>;
  }

  const {
    duration_type,
    report_metadata,
    summary,
    time_breakdown,
    highlights,
  } = report;

  return (
    <div className="space-y-6 text-sm text-gray-800">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium text-gray-700">
            Organization: <strong>{orgName}</strong>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {getPeriodLabel()}
            {report_metadata?.generated_at && (
              <span className="ml-2">· Generated {format(new Date(report_metadata.generated_at), 'MMM d, yyyy, h:mm a')}</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Duration selector */}
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

          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            title="Print report"
          >
            <Printer className="w-4 h-4" /> Print
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700"
            title="Download report as HTML"
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
                  <span className="text-xs text-gray-500">
                    {block.event_count} events · {block.event_hours.toFixed(2)} hrs · {block.meeting_count} meetings
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

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
