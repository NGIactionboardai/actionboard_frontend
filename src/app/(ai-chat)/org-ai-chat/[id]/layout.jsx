'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Menu } from 'lucide-react';
import OrgLogo from '@/app/components/organizations/OrgLogo';
import ConversationSidebar from '@/app/components/ai-chat/ConversationSidebar';
import { getOrganizationDetails, selectOrganizationDetails } from '@/redux/auth/organizationSlice';
import { fetchConversations, selectConversations } from '@/redux/aiChat/aiChatSlice';

export default function OrgAiChatLayout({ children }) {
  const { id: orgId, conversationId } = useParams();
  const dispatch = useDispatch();

  const orgDetails = useSelector(selectOrganizationDetails);
  const conversations = useSelector((state) => selectConversations(state, orgId));

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (orgId) {
      dispatch(getOrganizationDetails(orgId));
      dispatch(fetchConversations(orgId));
    }
  }, [orgId, dispatch]);

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
