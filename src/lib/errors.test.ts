import { describe, expect, it } from 'vitest'
import { ApiError } from './http'
import { getErrorMessage } from './errors'

describe('getErrorMessage', () => {
  it('maps known statuses to a safe user-facing message', () => {
    const error = new ApiError('internal backend detail', 401)

    expect(
      getErrorMessage(error, 'Não foi possível entrar.', {
        401: 'E-mail ou senha inválidos.',
      }),
    ).toBe('E-mail ou senha inválidos.')
  })

  it('does not expose unmapped backend messages', () => {
    const error = new ApiError('database connection failed', 500)

    expect(getErrorMessage(error, 'Tente novamente.')).toBe('Tente novamente.')
  })
})
