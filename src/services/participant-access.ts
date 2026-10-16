import { http } from '../lib/http'

export type ParticipantAccess = {
  participant: { name: string }
  group: { id: string; name: string }
  revealed: boolean
}

export type RevealResult = {
  result: { name: string }
  revealedAt: string
}

export type ClaimedParticipation = {
  groupId: string
  participantId: string
}

const accessPath = (token: string) => `/public/participant-access/${encodeURIComponent(token)}`

export const participantAccessService = {
  get: (token: string) => http<ParticipantAccess>(accessPath(token)),
  claim: async (token: string) =>
    (await http<{ participation: ClaimedParticipation }>(`${accessPath(token)}/claim`, { method: 'POST' })).participation,
  reveal: (token: string) => http<RevealResult>(`${accessPath(token)}/reveal`, { method: 'POST' }),
  revealLinked: (groupId: string) =>
    http<RevealResult>(`/groups/${encodeURIComponent(groupId)}/reveal`, { method: 'POST' }),
}
