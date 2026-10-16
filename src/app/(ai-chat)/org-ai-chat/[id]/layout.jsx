'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Menu } from 'lucide-react';
import OrgLogo from '@/app/components/organizations/OrgLogo';
import ConversationSidebar from '@/app/components/ai-chat/ConversationSidebar';
import { useGetOrganizationDetailsQuery } from '@/redux/api/organizationApi';
import { fetchConversations, selectConversations } from '@/redux/aiChat/aiChatSlice';
import { fetchSubscription } from '@/redux/billing/billingSlice';
import { selectIsAuthenticated } from '@/redux/auth/authSlices';

export default function OrgAiChatLayout({ children }) {
  const { id: orgId, conversationId } = useParams();
  const dispatch = useDispatch();

  const { data: orgDetails } = useGetOrganizationDetailsQuery(orgId, { skip: !orgId });
  const conversations = useSelector((state) => selectConversations(state, orgId));

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (orgId) {
      dispatch(fetchConversations(orgId));
    }
  }, [orgId, dispatch]);

  // Feature gating (useFeature) always reads the viewing user's own
  // subscription — Subscription is a per-user model, there's no org-level
  // plan. Unlike (dashboard), this route group never mounts AuthHydrator, so
  // nothing else ever performs the *first* billing fetch — on a cold load
  // (direct link, fresh tab) billing.status is still 'idle' and billing.orgId
  // is still its initial null, which looks identical to "already has the
  // correct user-level data". Fetch it ourselves whenever that's the case, or
  // whenever it holds stale org-scoped data from a dashboard page elsewhere.
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const billingOrgId = useSelector((state) => state.billing.orgId);
  const billingStatus = useSelector((state) => state.billing.status);
  useEffect(() => {
    if (!isAuthenticated || billingStatus === 'loading') return;
    if (billingStatus === 'idle' || billingOrgId !== null) dispatch(fetchSubscription());
  }, [isAuthenticated, billingOrgId, billingStatus, dispatch]);

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] bg-gray-50 overflow-hidden">
      {/* Mobile-only branding bar — desktop shows org branding inside the sidebar itself */}
      <div className="md:hidden flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 bg-white shrink-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-500 hover:text-gray-800 transition"
          title="Open conversations"
        >
          <Menu size={20} />
        </button>
        <OrgLogo org={orgDetails} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{orgDetails?.name || 'Organization'}</p>
          <p className="text-xs text-gray-400 truncate">{orgDetails?.org_id || orgId}</p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <ConversationSidebar
          orgId={orgId}
          orgDetails={orgDetails}
          conversations={conversations}
          activeConversationId={conversationId}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <div className="flex-1 flex flex-col min-h-0">{children}</div>
      </div>
    </div>
  );
}
