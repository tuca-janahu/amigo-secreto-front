import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { AccessibleGroup, GroupRole, GroupStatus } from '../../services/groups'
import { DashboardGroupCard } from './DashboardGroupCard'

function renderCard(roles: GroupRole[], status: GroupStatus = 'DRAFT') {
  const group: AccessibleGroup = {
    id: 'group-1', name: 'Amigos', status, roles,
    createdAt: '2026-11-25T12:00:00.000Z',
    participant: roles.includes('PARTICIPANT') ? { id: 'participant-1', name: 'Ana', revealed: false } : null,
  }
  return renderToStaticMarkup(<MemoryRouter><DashboardGroupCard group={group} onDelete={vi.fn()} /></MemoryRouter>)
}

describe('dashboard actions by role', () => {
  it.each([{ roles: ['OWNER'] as GroupRole[] }])(
    'shows only management and deletion for draft owners with roles $roles', ({ roles }) => {
      const markup = renderCard(roles)
      expect(markup).toContain('Gerenciar grupo')
      expect(markup).toContain('aria-label="Excluir grupo Amigos"')
      expect(markup).not.toContain('Acompanhar grupo')
      expect(markup).not.toContain('/participation')
      expect(markup.match(/<a\b/g)).toHaveLength(1)
      expect(markup.match(/<button\b/g)).toHaveLength(1)
    },
  )

  it.each(['DRAFT', 'READY', 'SORTEADO', 'CANCELLED'] as const)(
    'shows only following for a guest in %s', (status) => {
      const markup = renderCard(['PARTICIPANT'], status)
      expect(markup).toContain(status === 'SORTEADO' ? 'Ver meu sorteio' : 'Acompanhar grupo')
      expect(markup).toContain('/dashboard/groups/group-1/participation')
      expect(markup).not.toContain('Gerenciar grupo')
      expect(markup).not.toContain('Excluir grupo')
      expect(markup.match(/<a\b/g)).toHaveLength(1)
      expect(markup).not.toContain('<button')
    },
  )

  it('preserves the deletion restriction after the draw for an owner who participates', () => {
    const markup = renderCard(['OWNER', 'PARTICIPANT'], 'SORTEADO')
    expect(markup).toContain('Gerenciar grupo')
    expect(markup).toContain('Ver meu sorteio')
    expect(markup).toContain('/dashboard/groups/group-1/participation')
    expect(markup).not.toContain('Acompanhar grupo')
    expect(markup).not.toContain('Excluir grupo')
    expect(markup.match(/<a\b/g)).toHaveLength(2)
  })

  it('shows only management and deletion for an owner participant before the draw', () => {
    const markup = renderCard(['OWNER', 'PARTICIPANT'])
    expect(markup).toContain('Gerenciar grupo')
    expect(markup).toContain('aria-label="Excluir grupo Amigos"')
    expect(markup).not.toContain('Acompanhar grupo')
    expect(markup).not.toContain('/participation')
    expect(markup.match(/<a\b/g)).toHaveLength(1)
  })
})
