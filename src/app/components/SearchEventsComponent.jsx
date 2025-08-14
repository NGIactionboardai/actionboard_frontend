// SearchEventsComponent.jsx
'use client';

import axios from 'axios';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function SearchEventsComponent({
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

  function formatTime(isoStr) {
    return new Date(isoStr).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const params = { q: query };

      // Priority: date range over duration
      if (startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      } else if (duration !== 'all') {
        params.duration = duration;
      }

      const res = await axios.get(`${API_BASE_URL}/calendar/search-events/`, {
        params,
      });

      setResults(res.data.events);
    } catch (err) {
      console.error(err);
      toast.error('Error during search');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);
    setDuration('all'); // disable duration if date selected

    // Auto-adjust end date if it's before the next day
    if (endDate && new Date(endDate) <= new Date(value)) {
      const nextDay = new Date(value);
      nextDay.setDate(nextDay.getDate() + 1);
      setEndDate(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
    setDuration('all'); // disable duration if date selected
  };

  const handleDurationChange = (value) => {
    setDuration(value);
    if (value !== 'all') {
      // Clear date range if duration selected
      setStartDate('');
      setEndDate('');
    }
  };

  const formatDate = (isoString) => {
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(isoString).toLocaleString(undefined, options);
  };

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          className="flex-1 border rounded-md px-3 py-2 text-sm"
          placeholder="Search events..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Duration Select */}
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

        {/* Date Range */}
        <input
          type="date"
          value={startDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm text-gray-700"
        />
        <input
          type="date"
          value={endDate}
          min={startDate ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1)).toISOString().split('T')[0] : ''}
          onChange={(e) => handleEndDateChange(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm text-gray-700"
        />

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
          {results.map((event) => {
            const orgName = event.organisation_name || 'Personal';
            const color = orgColors?.[orgName] || '#6B7280';

            const startDateObj = new Date(event.start);
            const dateDisplay = startDateObj.toLocaleDateString(undefined, {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            const timeDisplay = `${formatTime(event.start)} - ${formatTime(event.end)}`;

            return (
              <div
                key={event.id}
                onClick={() =>
                  handleEventClick({
                    event: {
                      id: event.id,
                      title: event.title,
                      start: new Date(event.start),
                      end: new Date(event.end),
                      backgroundColor: color,
                      borderColor: color,
                      textColor: '#ffffff',
                      extendedProps: {
                        description: event.description,
                        organization: orgName,
                        join_url: event?.meeting?.join_url || null,
                      },
                    },
                  })
                }
                className="flex items-start gap-4 p-3 hover:bg-gray-50 cursor-pointer transition"
              >
                {/* Time + Date */}
                <div className="w-32 text-sm text-gray-700 whitespace-nowrap">
                  <div className="text-xs text-gray-500">{dateDisplay}</div>
                  <div>{timeDisplay}</div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-sm text-gray-900">{event.title}</span>
                  </div>
                  <div className="text-xs text-gray-500">{orgName}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
