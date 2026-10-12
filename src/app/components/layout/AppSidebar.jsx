'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Calendar, Link2, Settings } from 'lucide-react';

// Pages that render inside the sidebar layout. /integrations covers its
// sub-pages (slack, jira, ...); the others are exact matches.
const SIDEBAR_EXACT_ROUTES = ['/organizations', '/calendar', '/auth/profile'];
const SIDEBAR_PREFIX_ROUTES = ['/integrations'];

export function hasSidebar(pathname) {
  if (!pathname) return false;
  const path = pathname.replace(/\/$/, '') || '/';
  return (
    SIDEBAR_EXACT_ROUTES.includes(path) ||
    SIDEBAR_PREFIX_ROUTES.some((route) => path === route || path.startsWith(`${route}/`))
  );
}

const NAV_ITEMS = [
  { href: '/organizations', label: 'Organizations', icon: Building2 },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/integrations', label: 'Integrations', icon: Link2 },
  { href: '/auth/profile', label: 'Settings', icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname() || '';

  return (
    <aside className="hidden lg:flex fixed top-20 bottom-0 left-0 w-60 flex-col bg-white border-r border-gray-200 z-30">
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-indigo-600' : 'text-gray-500'}`} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
