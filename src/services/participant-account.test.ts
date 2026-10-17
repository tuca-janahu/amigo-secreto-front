import { afterEach, describe, expect, it, vi } from 'vitest'
import { messagesService } from './messages'
import { participantAccessService } from './participant-access'
import { groupsService } from './groups'

describe('authenticated participant services', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('claims an invitation using the authenticated cookie session', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          participation: { groupId: 'group-1', participantId: 'participant-1' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(participantAccessService.claim('token with spaces')).resolves.toEqual({
      groupId: 'group-1',
      participantId: 'participant-1',
    })
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/public\/participant-access\/token%20with%20spaces\/claim$/),
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    )
  })

  it('synchronizes owner participations using the authenticated session', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ linked: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(groupsService.syncOwnerParticipations()).resolves.toEqual({
      linked: 1,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/groups\/sync-owner-participations$/),
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    )
  })

  it('reveals and posts messages through the linked group routes', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ result: { name: 'Maria' }, revealedAt: '2026-10-15T12:00:00.000Z' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            message: { id: 'message-1', content: 'Olá!', createdAt: '2026-10-15T12:00:00.000Z' },
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        ),
      )
    vi.stubGlobal('fetch', fetchMock)

    await participantAccessService.revealLinked('group-1')
    await messagesService.createForGroup('group-1', 'Olá!')

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(/\/groups\/group-1\/reveal$/),
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/\/groups\/group-1\/messages$/),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ content: 'Olá!' }),
      }),
    )
  })
})
