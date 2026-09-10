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

const accessPath = (token: string) => `/public/participant-access/${encodeURIComponent(token)}`

export const participantAccessService = {
  get: (token: string) => http<ParticipantAccess>(accessPath(token)),
  reveal: (token: string) => http<RevealResult>(`${accessPath(token)}/reveal`, { method: 'POST' }),
}
