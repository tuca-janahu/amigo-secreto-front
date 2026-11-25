import { http } from '../lib/http'

export type GroupInvitation = { url: string; createdAt: string; updatedAt: string }
export type GroupInvitationPreview = { group: { name: string }; ownerGroupId?: string }

export const groupInvitationsService = {
  get: async (groupId: string) =>
    (await http<{ invitation: GroupInvitation | null }>(`/groups/${groupId}/invitation`)).invitation,
  generate: async (groupId: string) =>
    (await http<{ invitation: GroupInvitation }>(`/groups/${groupId}/invitation`, { method: 'POST' })).invitation,
  deactivate: (groupId: string) => http<void>(`/groups/${groupId}/invitation`, { method: 'DELETE' }),
  preview: (token: string) => http<GroupInvitationPreview>(`/public/group-invitations/${encodeURIComponent(token)}`),
  join: async (token: string) =>
    (await http<{ participation: { groupId: string; participantId: string } }>(
      `/public/group-invitations/${encodeURIComponent(token)}/join`, { method: 'POST' },
    )).participation,
}
