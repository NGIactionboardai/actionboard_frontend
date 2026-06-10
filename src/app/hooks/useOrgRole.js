import { useSelector } from 'react-redux';
import { selectCurrentUserRole } from '@/redux/auth/organizationSlice';

export function useOrgRole() {
  const role = useSelector(selectCurrentUserRole);

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
  };
}
