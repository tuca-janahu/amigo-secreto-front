import { http } from '../lib/http'

export type Restriction = {
  id: string
  giver: { id: string; name: string }
  forbidden: { id: string; name: string }
  createdAt: string
}

export const restrictionsService = {
  list: async (groupId: string) =>
    (await http<{ restrictions: Restriction[] }>(`/groups/${groupId}/restrictions`)).restrictions,
  create: (groupId: string, giverParticipantId: string, forbiddenParticipantId: string) =>
    http(`/groups/${groupId}/restrictions`, { method: 'POST', body: { giverParticipantId, forbiddenParticipantId } }),
  createBilateral: (groupId: string, participantAId: string, participantBId: string) =>
    http(`/groups/${groupId}/restrictions/bilateral`, { method: 'POST', body: { participantAId, participantBId } }),
  remove: (groupId: string, restrictionId: string) =>
    http<void>(`/groups/${groupId}/restrictions/${restrictionId}`, { method: 'DELETE' }),
}
