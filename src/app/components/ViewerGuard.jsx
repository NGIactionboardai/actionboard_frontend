'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useOrgRole } from '@/app/hooks/useOrgRole';

// Routes a viewer is allowed to visit: meeting detail (shared via direct link),
// plus the org switcher so a viewer in the current org is never stranded —
// they must always be able to switch to an org where they hold a fuller role.
const VIEWER_ALLOWED_PREFIXES = ['/meeting/', '/organizations'];

export default function ViewerGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isViewer } = useOrgRole();

  useEffect(() => {
    if (!isLoaded || !isViewer) return;

    const allowed = VIEWER_ALLOWED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (!allowed) {
      // Viewers have no landing page — send them to the meetings route
      // where their lack of access will be surfaced gracefully.
      router.replace('/meeting/no-access');
    }
  }, [isLoaded, isViewer, pathname, router]);

  // Don't block render — non-viewers and unloaded state pass straight through.
  // Viewers on an allowed path also render normally.
  return children;
}
