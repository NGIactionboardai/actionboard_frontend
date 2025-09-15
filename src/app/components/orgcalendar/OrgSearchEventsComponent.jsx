'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, format } from "date-fns";
import { Calendar } from "lucide-react";

export default function OrgSearchEventsComponent({
  orgId,
  orgName,
  makeApiCall,
  getAuthHeaders,
  handleEventClick,
  orgColors
}) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [duration, setDuration] = useState('3m');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const formatTime = (isoStr) =>
    new Date(isoStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const handleSearch = async () => {
    if (!query.trim()) return;

    // Validation: if start & end date, ensure order
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        toast.error('End date must be at least 1 day after start date.');
        return;
      }
    }

    setLoading(true);
    try {
      const params = { q: query, org_id: orgId };

      if (startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      } else if (duration !== 'all') {
        params.duration = duration;
      }

      const { data } = await axios.get(`${API_BASE_URL}/calendar/search-events/`, { params });
      setResults(data.events || []);
    } catch (err) {
      console.error(err);
      toast.error('Error during search');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);

    // If end date is before or same as start date, adjust it
    if (endDate && new Date(value) >= new Date(endDate)) {
      const nextDay = new Date(value);
      nextDay.setDate(nextDay.getDate() + 1);
      setEndDate(nextDay.toISOString().split('T')[0]);
    }

    // Reset duration when picking dates
    setDuration('all');
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
    setDuration('all');
  };

  const handleDurationChange = (value) => {
    setDuration(value);
    if (value !== 'all') {
      // Clear date range if duration selected
      setStartDate('');
      setEndDate('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-sm text-gray-700">
        <strong>Organization:</strong> {orgName} <br />
        <span className="text-xs text-gray-500">Search scoped to this organization only</span>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          className="flex-1 border rounded-md px-3 py-2 text-sm"
          placeholder="Search events..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Duration */}
        <select
          value={duration}
          onChange={(e) => handleDurationChange(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm text-gray-700"
        >
          <option value="3m">Last 3 Months</option>
          <option value="6m">Last 6 Months</option>
          <option value="1y">Last 1 Year</option>
          <option value="all">All</option>
        </select>

        {/* Start Date */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <DatePicker
            selected={startDate ? parse(startDate, "yyyy-MM-dd", new Date()) : null}
            onChange={(date) => {
              if (date) {
                const formatted = format(date, "yyyy-MM-dd");
                handleStartDateChange(formatted);
              } else {
                setStartDate("");
              }
            }}
            dateFormat="MM/dd/yyyy"
            placeholderText="MM/DD/YYYY"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* End Date */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <DatePicker
            selected={endDate ? parse(endDate, "yyyy-MM-dd", new Date()) : null}
            onChange={(date) => {
              if (date) {
                const formatted = format(date, "yyyy-MM-dd");
                handleEndDateChange(formatted);
              } else {
                setEndDate("");
              }
            }}
            minDate={
              startDate
                ? new Date(
                    new Date(startDate).setDate(new Date(startDate).getDate() + 1)
                  )
                : null
            }
            dateFormat="MM/dd/yyyy"
            placeholderText="MM/DD/YYYY"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
        >
          Search
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-sm text-gray-500">Searching...</div>
      ) : (
        <div className="divide-y border rounded-md">
          {results.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">No results</div>
          ) : (
            results.map((event) => {
              const orgColor = orgColors?.[orgName] || '#6B7280';
              const startDate = new Date(event.start);
              const endDate = new Date(event.end);

              return (
                <div
                  key={event.id}
                  onClick={() =>
                    handleEventClick({
                      event: {
                        id: event.id,
                        title: event.title,
                        start: startDate,
                        end: endDate,
                        backgroundColor: orgColor,
                        borderColor: orgColor,
                        textColor: '#ffffff',
                        extendedProps: {
                          description: event.description,
                          organization: orgName,
                          join_url: event?.meeting?.join_url || null,
                        }
                      }
                    })
                  }
                  className="flex items-start gap-4 p-3 hover:bg-gray-50 cursor-pointer transition"
                >
                  {/* Time Column */}
                  <div className="w-32 text-sm text-gray-700 whitespace-nowrap">
                    <div className="text-xs text-gray-500">
                      {startDate.toLocaleDateString(undefined, {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                    <div>
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </div>
                  </div>

                  {/* Title + Org */}
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: orgColor }}
                      />
                      <span className="font-medium text-sm text-gray-900">{event.title}</span>
                    </div>
                    <div className="text-xs text-gray-500">{orgName}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
