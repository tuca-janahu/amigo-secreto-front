import { http } from '../lib/http'

export type Participant = {
  id: string
  name: string
  email: string
  createdAt: string
}

export type ParticipantInput = Pick<Participant, 'name' | 'email'>

export const participantsService = {
  list: async (groupId: string) =>
    (await http<{ participants: Participant[] }>(`/groups/${groupId}/participants`)).participants,
  create: async (groupId: string, input: ParticipantInput) =>
    (await http<{ participant: Participant }>(`/groups/${groupId}/participants`, { method: 'POST', body: input })).participant,
  update: async (groupId: string, participantId: string, input: ParticipantInput) =>
    (await http<{ participant: Participant }>(`/groups/${groupId}/participants/${participantId}`, { method: 'PATCH', body: input })).participant,
  remove: (groupId: string, participantId: string) =>
    http<void>(`/groups/${groupId}/participants/${participantId}`, { method: 'DELETE' }),
  import: (groupId: string, data: string) =>
    http<{ imported: number; participants: Participant[] }>(`/groups/${groupId}/participants/import`, { method: 'POST', body: { data } }),
}
