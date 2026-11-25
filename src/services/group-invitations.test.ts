import { afterEach, describe, expect, it, vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { ApiError, http } from '../lib/http'
import { groupInvitationsService } from './group-invitations'
import { invitationErrorMessage, isInvitationUnavailable } from '../features/groups/group-invitations.errors'
import { publicInvitationQueryOptions } from '../features/groups/group-invitations.queries'

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })

describe('group entry invitations', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('uses the owner endpoints and never sends participant identity', async () => {
    const invitation = { url: 'https://example.test/invite/token', createdAt: 'now', updatedAt: 'now' }
    const fetch = vi.fn().mockResolvedValueOnce(json({ invitation: null }))
      .mockResolvedValueOnce(json({ invitation })).mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetch)
    expect(await groupInvitationsService.get('group-1')).toBeNull()
    expect(await groupInvitationsService.generate('group-1')).toEqual(invitation)
    await groupInvitationsService.deactivate('group-1')
    for (const [index, method] of [undefined, 'POST', 'DELETE'].entries()) {
      expect(fetch).toHaveBeenNthCalledWith(index + 1, expect.stringMatching(/\/groups\/group-1\/invitation$/), expect.objectContaining({ credentials: 'include', body: undefined, ...(method ? { method } : {}) }))
    }
  })

  it('previews separately and accepts both new and existing participation as success', async () => {
    const participation = { groupId: 'group-1', participantId: 'participant-1' }
    const fetch = vi.fn().mockResolvedValueOnce(json({ group: { name: 'Amigos' } }))
      .mockResolvedValue(json({ participation }))
    vi.stubGlobal('fetch', fetch)
    expect(await groupInvitationsService.preview('token')).toEqual({ group: { name: 'Amigos' } })
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(await groupInvitationsService.join('token')).toEqual(participation)
    // A second response has the same success contract (idempotent join / manual claim).
    fetch.mockResolvedValueOnce(json({ participation }))
    expect(await groupInvitationsService.join('token')).toEqual(participation)
    expect(fetch).toHaveBeenLastCalledWith(expect.stringMatching(/\/public\/group-invitations\/token\/join$/), expect.objectContaining({ method: 'POST', credentials: 'include', body: undefined }))
  })

  it('keeps ownership context scoped to the authenticated account in the preview cache', async () => {
    const preview = { group: { name: 'Amigos' }, ownerGroupId: 'group-1' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(preview)))
    expect(await groupInvitationsService.preview('token')).toEqual(preview)
    const owner = publicInvitationQueryOptions('token', 'owner')
    const guest = publicInvitationQueryOptions('token', 'guest')
    const anonymous = publicInvitationQueryOptions('token')
    expect(owner.queryKey).not.toEqual(guest.queryKey)
    expect(owner.queryKey).not.toEqual(anonymous.queryKey)
  })

  it.each([
    ['INVITATION_NOT_FOUND', 404, 'Peça outro link'],
    ['INVITATION_CLOSED', 409, 'encerradas'],
    ['PARTICIPATION_ALREADY_CLAIMED', 409, 'outra conta'],
  ])('reads and explains %s without a message field', async (code, status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ error: code }, status)))
    const error = await groupInvitationsService.join('token').catch((error: unknown) => error)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ code, status })
    expect(invitationErrorMessage(error)).toContain(message)
    expect(isInvitationUnavailable(error)).toBe(true)
  })

  it('preserves existing message and status behavior', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ message: ['Nome obrigatório', 'E-mail inválido'] }, 400)))
    await expect(http('/test')).rejects.toMatchObject({ message: 'Nome obrigatório, E-mail inválido', status: 400, code: undefined })
  })

  it.each([401, 429, 500])('does not automatically retry status %s', async (status) => {
    const fetch = vi.fn().mockImplementation(() => Promise.resolve(json({}, status)))
    vi.stubGlobal('fetch', fetch)
    const client = new QueryClient()
    await expect(client.fetchQuery(publicInvitationQueryOptions('token'))).rejects.toBeInstanceOf(ApiError)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(isInvitationUnavailable(new ApiError('', status))).toBe(false)
    client.clear()
  })
})
