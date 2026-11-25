import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { authQueryKey } from '../features/auth/auth.queries'
import { groupKey } from '../features/groups/group.queries'
import { groupInvitationKey, publicInvitationQueryOptions } from '../features/groups/group-invitations.queries'
import { GroupPage } from './GroupPage'
import { AuthenticatedParticipantPage } from './AuthenticatedParticipantPage'
import { GroupInvitationPage } from './GroupInvitationPage'
import { DashboardGroupCard } from '../features/groups/DashboardGroupCard'
import type { AccessibleGroup, GroupStatus } from '../services/groups'

const user = { id: 'user', name: 'Ana', email: 'ana@example.test' }
const group = { id: 'group', name: 'Amigos', roles: ['PARTICIPANT'], participant: { id: 'participant', name: 'Ana', revealed: false } }

describe('invitation and participation boundaries', () => {
  afterEach(() => vi.unstubAllGlobals())

  it.each(['DRAFT', 'READY', 'CANCELLED'])('does not mount reveal or messages for %s', (status) => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    client.setQueryData(groupKey('group'), { ...group, status })
    const html = renderToString(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/group']}><Routes><Route path="/:groupId" element={<AuthenticatedParticipantPage />} /></Routes></MemoryRouter></QueryClientProvider>)
    expect(html).toContain(status === 'CANCELLED' ? 'Grupo cancelado' : 'Participação confirmada')
    expect(html).not.toContain('Revelar')
    expect(client.getQueryCache().findAll({ queryKey: ['groups', 'group', 'messages'] })).toHaveLength(0)
    expect(fetch).not.toHaveBeenCalled()
    client.clear()
  })

  it('opening an authenticated invitation only offers explicit confirmation', () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const client = new QueryClient()
    client.setQueryData(authQueryKey, user)
    client.setQueryData(publicInvitationQueryOptions('token', user.id).queryKey, { group: { name: 'Amigos' } })
    const html = renderToString(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/invite/token']}><Routes><Route path="/invite/:token" element={<GroupInvitationPage />} /></Routes></MemoryRouter></QueryClientProvider>)
    expect(html).toContain('Participar do grupo')
    expect(html).toContain(user.email)
    expect(fetch).not.toHaveBeenCalled()
    client.clear()
  })

  it.each(['DRAFT', 'READY', 'SORTEADO', 'CANCELLED'] as GroupStatus[])('preserves participant and management access for an owner in %s', (status) => {
    const accessibleGroup: AccessibleGroup = { ...group, status, roles: ['OWNER', 'PARTICIPANT'], createdAt: '2026-11-23T12:00:00Z' }
    const html = renderToString(<MemoryRouter><DashboardGroupCard group={accessibleGroup} onDelete={() => {}} /></MemoryRouter>)
    if (status === 'SORTEADO') expect(html).toContain('Ver meu sorteio')
    else expect(html).not.toContain('Acompanhar grupo')
    expect(html).toContain('Gerenciar grupo')
    if (status === 'SORTEADO') expect(html).toContain('/dashboard/groups/group/participation')
    else expect(html).not.toContain('/dashboard/groups/group/participation')
  })

  it('keeps an owner participant result accessible inside management after the draw', () => {
    const client = new QueryClient()
    client.setQueryData(groupKey('group'), { ...group, status: 'SORTEADO', roles: ['OWNER', 'PARTICIPANT'] })
    const html = renderToString(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/group']}><Routes><Route path="/:groupId" element={<GroupPage />} /></Routes></MemoryRouter></QueryClientProvider>)
    expect(html).toContain('Ver meu amigo secreto')
    expect(html).toContain('/dashboard/groups/group/participation')
    client.clear()
  })

  it('presents automatic confirmation only for the authenticated owner', () => {
    const client = new QueryClient()
    client.setQueryData(authQueryKey, user)
    client.setQueryData(publicInvitationQueryOptions('token', user.id).queryKey, { group: { name: 'Amigos' }, ownerGroupId: 'group' })
    const html = renderToString(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/invite/token']}><Routes><Route path="/invite/:token" element={<GroupInvitationPage />} /></Routes></MemoryRouter></QueryClientProvider>)
    expect(html).toContain('Participando do seu grupo')
    expect(html).toContain('confirmada automaticamente')
    expect(html).not.toContain('Participar do grupo')
    client.clear()
  })

  it.each([
    { status: 'DRAFT', roles: ['OWNER'], visible: true },
    { status: 'READY', roles: ['OWNER'], visible: false },
    { status: 'SORTEADO', roles: ['OWNER'], visible: false },
    { status: 'CANCELLED', roles: ['OWNER'], visible: false },
    { status: 'DRAFT', roles: ['PARTICIPANT'], visible: false },
  ])('limits management to an owner in DRAFT: $status $roles', ({ status, roles, visible }) => {
    const client = new QueryClient()
    client.setQueryData(authQueryKey, user)
    client.setQueryData(groupKey('group'), { ...group, status, roles })
    client.setQueryData(groupInvitationKey('group'), null)
    const html = renderToString(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/group']}><Routes><Route path="/:groupId" element={<GroupPage />} /></Routes></MemoryRouter></QueryClientProvider>)
    expect(html.includes('Convide participantes')).toBe(visible)
    client.clear()
  })
})
