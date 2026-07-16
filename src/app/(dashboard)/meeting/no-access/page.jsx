'use client';

import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { selectCurrentOrganization, selectOrganizationDetails } from '@/redux/auth/organizationSlice';
import { useOrgRole } from '@/app/hooks/useOrgRole';

export default function MeetingNoAccessPage() {
  const router = useRouter();
  const currentOrg = useSelector(selectCurrentOrganization);
  const orgDetails = useSelector(selectOrganizationDetails);
  const { isViewer } = useOrgRole();

  const orgName = orgDetails?.name || currentOrg?.name || 'this organisation';
  const owner = orgDetails?.created_by;
  const admins = (orgDetails?.members || []).filter((m) => m.role === 'admin');

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="text-center max-w-md">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Limited Access</h2>
        <p className="text-gray-600 text-sm mb-4">
          {isViewer
            ? `You have Viewer access in "${orgName}". Viewers can only open meetings that have been shared with them directly, not the full meeting list.`
            : `Your current role in "${orgName}" doesn't have access to this page.`}
        </p>

        {(owner || admins.length > 0) && (
          <p className="text-gray-500 text-sm mb-6">
            To request broader access, contact{' '}
            {owner && (
              <span className="font-medium text-gray-700">{owner.name} ({owner.email})</span>
            )}
            {owner && admins.length > 0 && ' or '}
            {admins.length > 0 && (
              <span className="font-medium text-gray-700">
                {admins.map((a) => `${a.name} (${a.email})`).join(', ')}
              </span>
            )}
            .
          </p>
        )}

        <button
          onClick={() => router.push('/organizations')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium mx-auto"
        >
          <ArrowLeft size={16} />
          Back to your organisations
        </button>
      </div>
    </div>
  );
}
