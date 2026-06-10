'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useOrgRole } from '@/app/hooks/useOrgRole';

// Routes a viewer is allowed to visit (meeting detail only — shared via direct link)
const VIEWER_ALLOWED_PREFIXES = ['/meeting/'];

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
