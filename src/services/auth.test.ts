import { afterEach, describe, expect, it, vi } from 'vitest'
import { authService } from './auth'

describe('authService password recovery', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('requests a password reset with only the email', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Solicitação recebida.' }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await authService.forgotPassword('usuario@exemplo.com')

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/forgot-password$/),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email: 'usuario@exemplo.com' }),
      }),
    )
  })

  it('submits only the token and new password', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)

    await authService.resetPassword({
      token: 'single-use-token',
      password: 'nova-senha',
    })

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/reset-password$/),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          token: 'single-use-token',
          password: 'nova-senha',
        }),
      }),
    )
  })
})
