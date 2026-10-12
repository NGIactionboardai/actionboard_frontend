'use client';

import { useEffect, useId, useState } from 'react';
import { ArrowDown, ArrowUp, CalendarDays, CheckSquare, Clock, Mic } from 'lucide-react';
import { formatNextIn } from './format';

const SPARK_COLOR = '#4F46E5'; // indigo-600

// Smooth line + soft area fill. Points are spread evenly across the width.
function Sparkline({ data = [] }) {
  // useId output contains characters that aren't safe inside url(#...).
  const gradientId = `spark-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const width = 80;
  const height = 36;
  const pad = 3;

  if (data.length < 2) return <div style={{ width, height }} />;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((value, i) => [
    (i / (data.length - 1)) * width,
    // A flat series sits in the middle instead of hugging the bottom edge.
    max === min ? height / 2 : height - pad - ((value - min) / range) * (height - pad * 2),
  ]);

  let line = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const midX = (x0 + x1) / 2;
    line += ` C ${midX} ${y0}, ${midX} ${y1}, ${x1} ${y1}`;
  }
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0 overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SPARK_COLOR} stopOpacity="0.18" />
          <stop offset="100%" stopColor={SPARK_COLOR} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={SPARK_COLOR} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DeltaPill({ changePct }) {
  if (changePct === null || changePct === undefined) {
    return <span className="text-sm text-gray-500">No data last week</span>;
  }
  const up = changePct >= 0;
  const Arrow = up ? ArrowUp : ArrowDown;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
        up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
      }`}
    >
      <Arrow className="h-3.5 w-3.5" />
      {up ? '+' : ''}{changePct}% <span className="font-normal">vs last week</span>
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, footer, trend }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 min-w-0">
      <div className="h-14 w-14 shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center">
        <Icon className="h-6 w-6 text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-600 truncate">{label}</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="min-w-0">{footer}</div>
          <Sparkline data={trend} />
        </div>
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 animate-pulse">
      <div className="h-14 w-14 rounded-xl bg-gray-100" />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-28 bg-gray-100 rounded" />
        <div className="h-8 w-16 bg-gray-100 rounded" />
        <div className="h-5 w-32 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// Re-renders periodically so "Next in X min" counts down between refetches.
function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export default function KpiCards({ kpis, isLoading }) {
  const now = useNow();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
      </div>
    );
  }

  // If the summary failed to load, show dashes rather than misleading zeros.
  const k = kpis || {};
  const dash = '—';
  const meetings = k.meetings_this_week;
  const hours = k.hours_recorded;
  const decisions = k.decisions_captured;
  const upcoming = k.upcoming_today;
  const nextIn = formatNextIn(upcoming?.next_start_time, now);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      <KpiCard
        icon={CalendarDays}
        label="Meetings this week"
        value={meetings ? meetings.value : dash}
        footer={meetings && <DeltaPill changePct={meetings.change_pct} />}
        trend={meetings?.trend}
      />
      <KpiCard
        icon={Mic}
        label="Hours recorded"
        value={hours ? `${hours.value}h` : dash}
        footer={hours && <DeltaPill changePct={hours.change_pct} />}
        trend={hours?.trend}
      />
      <KpiCard
        icon={CheckSquare}
        label="Decisions captured"
        value={decisions ? decisions.value : dash}
        footer={decisions && <DeltaPill changePct={decisions.change_pct} />}
        trend={decisions?.trend}
      />
      <KpiCard
        icon={Clock}
        label="Upcoming today"
        value={upcoming ? upcoming.value : dash}
        footer={upcoming && (
          <span className="text-sm text-gray-600 truncate">{nextIn || 'Nothing else today'}</span>
        )}
        trend={upcoming?.trend}
      />
    </div>
  );
}
