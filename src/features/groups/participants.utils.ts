import type { Participant } from '../../services/participants'

function normalizeEmail(email: string) {
  return email.trim().toLocaleLowerCase()
}

export function hasParticipantEmail(
  participants: Participant[] | undefined,
  email: string | undefined,
) {
  if (!email) return false

  const normalizedEmail = normalizeEmail(email)

  return participants?.some(
    (participant) => normalizeEmail(participant.email) === normalizedEmail,
  ) ?? false
}
