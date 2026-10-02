import { afterEach, describe, expect, it, vi } from 'vitest'
import { feedbackService } from './feedback'

describe('feedbackService', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('posts only the feedback contract to the backend', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await feedbackService.create({
      type: 'SUGGESTION',
      message: 'Adicionar lembretes.',
      source: 'GROUP',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/feedback$/),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          type: 'SUGGESTION',
          message: 'Adicionar lembretes.',
          source: 'GROUP',
        }),
      }),
    )
  })
})
