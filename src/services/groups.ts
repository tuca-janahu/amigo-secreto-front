import { http } from '../lib/http'

export type GroupStatus = 'DRAFT' | 'READY' | 'SORTEADO' | 'CANCELLED'

export type Group = {
  id: string
  name: string
  status: GroupStatus
  createdAt: string
  updatedAt?: string
  sorteadoAt?: string | null
}

export const groupsService = {
  list: async () => (await http<{ groups: Group[] }>('/groups')).groups,
  get: async (groupId: string) =>
    (await http<{ group: Group }>(`/groups/${groupId}`)).group,
  create: async (name: string) =>
    (await http<{ group: Group }>('/groups', { method: 'POST', body: { name } })).group,
  update: async (groupId: string, name: string) =>
    (await http<{ group: Group }>(`/groups/${groupId}`, { method: 'PATCH', body: { name } })).group,
}
