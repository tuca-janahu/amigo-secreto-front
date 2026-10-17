import { beforeEach, describe, expect, it, vi } from 'vitest'

const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  info: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
}))

vi.mock('sonner', () => ({ toast: toastMocks }))

import { appToast } from './toast'

describe('appToast', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('applies the ticket variant, default duration and stable id', () => {
    appToast.error('Não foi possível entrar.', { id: 'login-error' })

    expect(toastMocks.error).toHaveBeenCalledWith(
      'Algo deu errado — Não foi possível entrar.',
      expect.objectContaining({
        className: 'app-toast app-toast--error',
        duration: 8_000,
        id: 'login-error',
      }),
    )
  })

  it('keeps action toasts visible longer and forwards the CTA', () => {
    const onClick = vi.fn()

    appToast.success('Sorteio realizado!', {
      action: { label: 'Ver meu amigo secreto', onClick },
      id: 'draw-success-group-1',
    })

    const options = toastMocks.success.mock.calls[0][1]
    expect(options).toEqual(
      expect.objectContaining({
        action: { label: 'Ver meu amigo secreto', onClick },
        duration: 10_000,
        id: 'draw-success-group-1',
      }),
    )

    options.action.onClick()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('allows a custom duration', () => {
    appToast.info('Aviso.', { duration: 2_000 })

    expect(toastMocks.info).toHaveBeenCalledWith(
      'Informação — Aviso.',
      expect.objectContaining({ duration: 2_000 }),
    )
  })
})
