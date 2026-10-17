import { describe, expect, it } from 'vitest'
import type { Participant } from '../../services/participants'
import { hasParticipantEmail } from './participants.utils'

const participants: Participant[] = [
  {
    id: 'participant-1',
    name: 'Artur',
    email: 'artur@example.com',
    createdAt: '2026-10-15T12:00:00.000Z',
  },
]

describe('hasParticipantEmail', () => {
  it('identifies an exact participant email', () => {
    expect(hasParticipantEmail(participants, 'artur@example.com')).toBe(true)
  })

  it('ignores surrounding spaces and letter casing', () => {
    expect(hasParticipantEmail(participants, '  ARTUR@EXAMPLE.COM  ')).toBe(true)
  })

  it('does not match a different email', () => {
    expect(hasParticipantEmail(participants, 'outra-pessoa@example.com')).toBe(false)
  })
})
