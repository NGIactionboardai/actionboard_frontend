import { useSelector } from 'react-redux';
import { selectCurrentOrganizationId } from '@/redux/auth/orgSelectionSlice';
import { useGetOrganizationDetailsQuery } from '@/redux/api/organizationApi';

export function useOrgRole() {
  const orgId = useSelector(selectCurrentOrganizationId);
  const user = useSelector((state) => state.auth?.user);
  const { data: orgDetails } = useGetOrganizationDetailsQuery(orgId, { skip: !orgId });

  const userId = user?.id ?? user?.user_id ?? user?.pk;
  const me = orgDetails?.members?.find((m) => m.user_id === userId);
  const role = me?.role ?? null;

  return {
    role,
    isLoaded: role !== null,
    isOwner:  role === 'owner',
    isAdmin:  role === 'admin',
    isMember: role === 'member',
    isViewer: role === 'viewer',
    canManageOrg:             role === 'owner' || role === 'admin',
    canManageMembers:         role === 'owner' || role === 'admin',
    canInvite:                role === 'owner' || role === 'admin',
    canViewBilling:           role === 'owner' || role === 'admin',
    canUpgradePlan:           role === 'owner',
    canManagePayment:         role === 'owner',
    canSendBot:               role === 'owner' || role === 'admin',
    canShareMeeting:          role === 'owner' || role === 'admin',
    canManageOrgIntegrations: role === 'owner' || role === 'admin',
    canTransferOwnership:     role === 'owner',
  };
}
