'use client';

import Link from 'next/link';
import { Popover } from '@headlessui/react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import { ArrowRight, CalendarDays, Clock, Users } from 'lucide-react';
import OrgLogo, { COMMON_BORDER_COLOR } from '../OrgLogo';
import { formatLastActive } from './format';

const ROLE_STYLES = {
  owner:  { label: 'Owner',  cls: 'bg-purple-100 text-purple-700' },
  admin:  { label: 'Admin',  cls: 'bg-blue-100 text-blue-700' },
  member: { label: 'Member', cls: 'bg-green-100 text-green-700' },
  viewer: { label: 'Viewer', cls: 'bg-gray-100 text-gray-600' },
};

export function RoleBadge({ role }) {
  const meta = ROLE_STYLES[role];
  if (!meta) return null;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

function OwnerMenu({ org, onEdit, onDelete, className = 'relative' }) {
  return (
    <Popover className={className} onClick={(e) => e.stopPropagation()}>
      <Popover.Button className="p-1 rounded-full hover:bg-gray-100 focus:outline-none" aria-label={`${org.name} actions`}>
        <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
      </Popover.Button>
      <Popover.Panel className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg ring-1 ring-black/5 z-20">
        <div className="py-1 text-sm text-gray-700">
          <button onClick={() => onEdit(org)} className="w-full text-left px-4 py-2 hover:bg-gray-100">Edit</button>
          <button onClick={() => onDelete(org)} className="w-full text-left px-4 py-2 hover:bg-red-100 text-red-600">Delete</button>
        </div>
      </Popover.Panel>
    </Popover>
  );
}

// Stats come from the dashboard summary, which can lag behind the org list
// (or fail) — show a dash instead of a misleading zero.
function statRows(stats) {
  return [
    { icon: Users, label: 'Members', value: stats ? stats.member_count : '—' },
    { icon: CalendarDays, label: 'Upcoming Meetings', value: stats ? stats.upcoming_meetings : '—' },
    { icon: Clock, label: 'Last Active', value: stats ? formatLastActive(stats.last_active_at) : '—' },
  ];
}

export function OrgCard({ org, stats, href, onOpen, onEdit, onDelete }) {
  const isOwner = org.role === 'owner';
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <Link href={href} onClick={onOpen} className="flex gap-5 p-5">
        <OrgLogo org={org} size="xl" ringColor={COMMON_BORDER_COLOR} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 pr-6">
            <h3 className="text-lg font-semibold text-gray-900 truncate" title={org.name}>{org.name}</h3>
            {org.role && !isOwner && <RoleBadge role={org.role} />}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <dl className="flex-1 min-w-0 space-y-1.5">
              {statRows(stats).map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4 text-gray-400 shrink-0" />
                  <dt className="text-gray-500 truncate">{label}:</dt>
                  <dd className="ml-auto font-medium text-gray-900 whitespace-nowrap">{value}</dd>
                </div>
              ))}
            </dl>
            <span className="h-10 w-10 shrink-0 rounded-full bg-indigo-50 flex items-center justify-center">
              <ArrowRight className="h-5 w-5 text-indigo-600" />
            </span>
          </div>
        </div>
      </Link>
      {isOwner && <OwnerMenu org={org} onEdit={onEdit} onDelete={onDelete} className="absolute top-4 right-3 z-10" />}
    </div>
  );
}

export function OrgListRow({ org, stats, onOpen, onEdit, onDelete }) {
  const isOwner = org.role === 'owner';
  const [members, upcoming, lastActive] = statRows(stats);
  return (
    <div
      onClick={onOpen}
      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition cursor-pointer"
    >
      <OrgLogo org={org} size="md" ringColor={COMMON_BORDER_COLOR} />
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="font-semibold text-gray-900 truncate">{org.name}</span>
        {org.role && !isOwner && <RoleBadge role={org.role} />}
      </div>
      {[members, upcoming, lastActive].map(({ icon: Icon, label, value }) => (
        <div key={label} className="hidden md:flex items-center gap-2 w-44 text-sm">
          <Icon className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="text-gray-500 truncate">{label}:</span>
          <span className="font-medium text-gray-900 whitespace-nowrap">{value}</span>
        </div>
      ))}
      <div className="w-8 shrink-0 flex justify-end">
        {isOwner && <OwnerMenu org={org} onEdit={onEdit} onDelete={onDelete} />}
      </div>
      <span className="h-9 w-9 shrink-0 rounded-full bg-indigo-50 flex items-center justify-center">
        <ArrowRight className="h-4 w-4 text-indigo-600" />
      </span>
    </div>
  );
}

export function OrgCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-5 animate-pulse">
      <div className="h-20 w-20 rounded-full bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 w-32 bg-gray-100 rounded" />
        <div className="h-4 w-full bg-gray-100 rounded" />
        <div className="h-4 w-full bg-gray-100 rounded" />
        <div className="h-4 w-3/4 bg-gray-100 rounded" />
      </div>
    </div>
  );
}
