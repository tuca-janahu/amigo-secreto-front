import { describe, expect, it } from 'vitest'
import { authFormSchema, credentialsSchema } from './auth.schemas'

describe('credentialsSchema', () => {
  it('accepts valid email and password', () => {
    expect(
      credentialsSchema.safeParse({ email: 'usuario@exemplo.com', password: 'senha-segura' }).success,
    ).toBe(true)
  })

  it('rejects invalid email and passwords shorter than eight characters', () => {
    const result = credentialsSchema.safeParse({ email: 'invalido', password: '1234567' })

    expect(result.success).toBe(false)
  })

  it('rejects a password confirmation that does not match', () => {
    expect(
      authFormSchema.safeParse({
        email: 'usuario@exemplo.com',
        password: 'senha-segura',
        confirmPassword: 'outra-senha',
      }).success,
    ).toBe(false)
  })
})
