import { queryOptions } from '@tanstack/react-query'
import { groupsService } from '../../services/groups'
import { invitationsService } from '../../services/invitations'
import { participantsService } from '../../services/participants'
import { restrictionsService } from '../../services/restrictions'
import { sorteioService } from '../../services/sorteio'

export const groupsKey = ['groups'] as const
export const groupKey = (groupId: string) => ['groups', groupId] as const
export const participantsKey = (groupId: string) => ['groups', groupId, 'participants'] as const
export const restrictionsKey = (groupId: string) => ['groups', groupId, 'restrictions'] as const
export const viabilityKey = (groupId: string) => ['groups', groupId, 'viability'] as const
export const invitationsKey = (groupId: string) => ['groups', groupId, 'invitations'] as const

export const groupsQueryOptions = queryOptions({ queryKey: groupsKey, queryFn: () => groupsService.list() })
export const groupQueryOptions = (groupId: string) => queryOptions({ queryKey: groupKey(groupId), queryFn: () => groupsService.get(groupId) })
export const participantsQueryOptions = (groupId: string) => queryOptions({ queryKey: participantsKey(groupId), queryFn: () => participantsService.list(groupId) })
export const restrictionsQueryOptions = (groupId: string) => queryOptions({ queryKey: restrictionsKey(groupId), queryFn: () => restrictionsService.list(groupId) })
export const viabilityQueryOptions = (groupId: string) => queryOptions({ queryKey: viabilityKey(groupId), queryFn: () => sorteioService.viability(groupId) })
export const invitationsQueryOptions = (groupId: string) => queryOptions({ queryKey: invitationsKey(groupId), queryFn: () => invitationsService.list(groupId) })
