'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { ArrowRight, CalendarDays, Clock, User } from 'lucide-react';
import { useGetDashboardSummaryQuery, useGetUserOrganizationsQuery } from '@/redux/api/organizationApi';
import OrgLogo, { COMMON_BORDER_COLOR } from '../organizations/OrgLogo';
import { OrgCardSkeleton } from '../organizations/dashboard/OrgCards';
import { formatNextIn } from '../organizations/dashboard/format';

function formatNextMeeting(next) {
  if (!next) return 'No upcoming meetings';
  const when = new Date(next.start_time).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
  return `${next.topic || 'Untitled meeting'} · ${when}`;
}

function ArrowBadge() {
  return (
    <span className="h-10 w-10 shrink-0 rounded-full bg-indigo-50 flex items-center justify-center">
      <ArrowRight className="h-5 w-5 text-indigo-600" />
    </span>
  );
}

function PersonalCalendarCard({ user, upcomingToday }) {
  const nextIn = formatNextIn(upcomingToday?.next_start_time);
  return (
    <Link
      href="/calendar/personal"
      className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="h-16 w-16 shrink-0 rounded-2xl bg-indigo-600 flex items-center justify-center">
        <User className="h-8 w-8 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-semibold text-gray-900">Personal calendar</h2>
        <p className="mt-0.5 text-sm text-gray-500 truncate">
          Your own events and meetings from every organization{user?.email ? ` · ${user.email}` : ''}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Upcoming today:</span>
            <span className="font-medium text-gray-900">{upcomingToday ? upcomingToday.value : '—'}</span>
          </span>
          {nextIn && (
            <span className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 text-gray-400" />
              {nextIn}
            </span>
          )}
        </div>
      </div>
      <ArrowBadge />
    </Link>
  );
}

function OrgCalendarCard({ org, stats }) {
  return (
    <Link
      href={`/calendar/${org.org_id}`}
      className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <OrgLogo org={org} size="lg" ringColor={COMMON_BORDER_COLOR} />
      <div className="flex-1 min-w-0 space-y-1.5">
        <h3 className="text-lg font-semibold text-gray-900 truncate" title={org.name}>{org.name}</h3>
        <p className="flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="text-gray-500">Upcoming:</span>
          <span className="font-medium text-gray-900">{stats ? stats.upcoming_meetings : '—'}</span>
        </p>
        <p className="flex items-center gap-2 text-sm text-gray-500 min-w-0">
          <Clock className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="truncate">{stats ? formatNextMeeting(stats.next_meeting) : '—'}</span>
        </p>
      </div>
      <ArrowBadge />
    </Link>
  );
}

/** /calendar — personal calendar card first, then one card per organization calendar. */
export default function CalendarHub() {
  const user = useSelector((state) => state.auth?.user);
  const { data: orgs = [], isLoading } = useGetUserOrganizationsQuery();
  const { data: summary } = useGetDashboardSummaryQuery();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px] mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">Calendars</h1>
      <p className="mt-1 text-gray-600">Open your personal calendar or any organization&apos;s schedule.</p>

      <div className="mt-8">
        <PersonalCalendarCard user={user} upcomingToday={summary?.kpis?.upcoming_today} />
      </div>

      <h2 className="mt-10 text-2xl font-bold text-gray-900">Organization calendars</h2>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <OrgCardSkeleton key={i} />)
          : orgs.map((org) => (
              <OrgCalendarCard key={org.org_id} org={org} stats={summary?.orgs?.[org.org_id]} />
            ))}
      </div>
      {!isLoading && orgs.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-12 text-center">
          <p className="font-semibold text-gray-900">No organization calendars yet</p>
          <p className="mt-1 text-sm text-gray-500">
            <Link href="/organizations" className="text-indigo-600 hover:underline">Create or join an organization</Link> to see its calendar here.
          </p>
        </div>
      )}
    </div>
  );
}
