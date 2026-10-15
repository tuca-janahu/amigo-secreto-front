import { describe, expect, it } from 'vitest'
import {
  authFormSchema,
  credentialsSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schemas'

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

describe('password recovery schemas', () => {
  it('validates the recovery email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'usuario@exemplo.com' }).success).toBe(true)
    expect(forgotPasswordSchema.safeParse({ email: 'invalido' }).success).toBe(false)
  })

  it('requires a password with confirmation', () => {
    expect(
      resetPasswordSchema.safeParse({
        password: 'nova-senha',
        confirmPassword: 'nova-senha',
      }).success,
    ).toBe(true)
    expect(
      resetPasswordSchema.safeParse({
        password: 'nova-senha',
        confirmPassword: 'outra-senha',
      }).success,
    ).toBe(false)
    expect(
      resetPasswordSchema.safeParse({
        password: 'curta',
        confirmPassword: 'curta',
      }).success,
    ).toBe(false)
  })
})
