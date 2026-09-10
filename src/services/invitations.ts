import { http } from '../lib/http'

export type InvitationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED'

export type ParticipantInvitation = {
  participantId: string
  name: string
  status: InvitationStatus
  sentAt: string | null
  revealedAt: string | null
}

export const invitationsService = {
  list: async (groupId: string) =>
    (await http<{ participants: ParticipantInvitation[] }>(`/groups/${groupId}/invitations`)).participants,
  resend: (groupId: string, participantId: string) =>
    http<{ status: 'SENT' | 'FAILED' }>(`/groups/${groupId}/participants/${participantId}/invite/resend`, { method: 'POST' }),
  resendPending: (groupId: string) =>
    http<{ attempted: number; sent: number; failed: number }>(`/groups/${groupId}/invitations/resend-pending`, { method: 'POST' }),
}
