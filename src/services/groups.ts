import { http } from '../lib/http'

export type GroupStatus = 'DRAFT' | 'READY' | 'SORTEADO' | 'CANCELLED'
export type GroupRole = 'OWNER' | 'PARTICIPANT'

export type GroupParticipation = {
  id: string
  name: string
  revealed: boolean
}

export type Group = {
  id: string
  name: string
  status: GroupStatus
  createdAt: string
  updatedAt?: string
  sorteadoAt?: string | null
}

export type AccessibleGroup = Group & {
  roles: GroupRole[]
  participant: GroupParticipation | null
}

export const groupsService = {
  list: async () => (await http<{ groups: AccessibleGroup[] }>('/groups')).groups,
  syncOwnerParticipations: () =>
    http<{ linked: number }>('/groups/sync-owner-participations', {
      method: 'POST',
    }),
  get: async (groupId: string) =>
    (await http<{ group: AccessibleGroup }>(`/groups/${groupId}`)).group,
  create: async (name: string) =>
    (await http<{ group: Group }>('/groups', { method: 'POST', body: { name } })).group,
  update: async (groupId: string, name: string) =>
    (await http<{ group: Group }>(`/groups/${groupId}`, { method: 'PATCH', body: { name } })).group,
  remove: (groupId: string) =>
    http<void>(`/groups/${groupId}`, { method: 'DELETE' }),
}
