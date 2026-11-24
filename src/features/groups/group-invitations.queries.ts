import { queryOptions } from '@tanstack/react-query'
import { groupInvitationsService } from '../../services/group-invitations'

// Separate from post-draw email invitations and broad group invalidations.
export const groupInvitationKey = (groupId: string) => ['group-invitation', groupId] as const
export const groupInvitationQueryOptions = (groupId: string) => queryOptions({
  queryKey: groupInvitationKey(groupId),
  queryFn: () => groupInvitationsService.get(groupId),
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  gcTime: 0,
})
export const publicInvitationQueryOptions = (token: string) => queryOptions({
  queryKey: ['public-group-invitation', token],
  queryFn: () => groupInvitationsService.preview(token),
  retry: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  gcTime: 0,
})
