import { describe, expect, it } from 'vitest'
import type { GroupRole } from '../../services/groups'
import { getGroupCardActions } from './group-access'

describe('group card actions', () => {
  it.each([
    {
      label: 'an owner who participates',
      group: {
        status: 'DRAFT' as const,
        roles: ['OWNER', 'PARTICIPANT'] as GroupRole[],
        participant: { id: 'participant-1', name: 'Owner', revealed: false },
      },
      expected: { canManage: true, canViewDraw: false, manageIconOnly: false },
    },
    {
      label: 'an owner after the draw',
      group: {
        status: 'SORTEADO' as const,
        roles: ['OWNER', 'PARTICIPANT'] as GroupRole[],
        participant: { id: 'participant-1', name: 'Owner', revealed: false },
      },
      expected: { canManage: true, canViewDraw: true, manageIconOnly: true },
    },
    {
      label: 'an owner who does not participate',
      group: { status: 'DRAFT' as const, roles: ['OWNER'] as GroupRole[], participant: null },
      expected: { canManage: true, canViewDraw: false, manageIconOnly: false },
    },
    {
      label: 'a participant who is not the owner',
      group: {
        status: 'DRAFT' as const,
        roles: ['PARTICIPANT'] as GroupRole[],
        participant: { id: 'participant-2', name: 'Guest', revealed: false },
      },
      expected: { canManage: false, canViewDraw: true, manageIconOnly: false },
    },
  ])('returns the correct actions for $label', ({ group, expected }) => {
    expect(getGroupCardActions(group)).toEqual(expected)
  })
})
