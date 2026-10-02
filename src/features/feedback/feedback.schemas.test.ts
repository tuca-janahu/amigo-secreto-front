import { describe, expect, it } from 'vitest'
import { feedbackFormSchema, getFeedbackSource } from './feedback.schemas'

describe('feedbackFormSchema', () => {
  it('trims and accepts a valid feedback message', () => {
    expect(
      feedbackFormSchema.parse({ type: 'BUG', message: '  O botão falhou.  ' }),
    ).toEqual({ type: 'BUG', message: 'O botão falhou.' })
  })

  it('rejects invalid types and messages outside the limits', () => {
    expect(feedbackFormSchema.safeParse({ type: 'OTHER', message: 'Mensagem' }).success).toBe(false)
    expect(feedbackFormSchema.safeParse({ type: 'BUG', message: '   ' }).success).toBe(false)
    expect(
      feedbackFormSchema.safeParse({ type: 'SUGGESTION', message: 'a'.repeat(2_001) }).success,
    ).toBe(false)
  })
})

describe('getFeedbackSource', () => {
  it.each([
    ['/', 'HOME'],
    ['/login', 'LOGIN'],
    ['/register', 'REGISTER'],
    ['/dashboard', 'DASHBOARD'],
    ['/dashboard/groups/group-id', 'GROUP'],
    ['/s/private-participant-token', 'PARTICIPANT'],
    ['/unknown/private-value', 'OTHER'],
  ] as const)('maps %s to a safe category', (pathname, expected) => {
    expect(getFeedbackSource(pathname)).toBe(expected)
  })
})
