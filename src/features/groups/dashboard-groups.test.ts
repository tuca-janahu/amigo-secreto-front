import { describe, expect, it } from 'vitest'
import type { AccessibleGroup } from '../../services/groups'
import { selectDashboardGroups } from './dashboard-groups'

function group(overrides: Partial<AccessibleGroup>): AccessibleGroup {
  return {
    id: 'group-id',
    name: 'Grupo',
    status: 'DRAFT',
    createdAt: '2026-10-01T12:00:00.000Z',
    roles: ['OWNER'],
    participant: null,
    ...overrides,
  }
}

const defaultFilters = {
  query: '',
  role: 'ALL' as const,
  sortOrder: 'DESC' as const,
  period: 'ALL' as const,
  now: new Date('2026-10-17T12:00:00-03:00'),
}

describe('selectDashboardGroups', () => {
  it('separa grupos pendentes, sorteados e cancelados', () => {
    const result = selectDashboardGroups([
      group({ id: 'draft', status: 'DRAFT' }),
      group({ id: 'ready', status: 'READY' }),
      group({ id: 'drawn', status: 'SORTEADO', sorteadoAt: '2026-10-17T14:00:00.000Z' }),
      group({ id: 'cancelled', status: 'CANCELLED' }),
    ], defaultFilters)

    expect(result.pending.map(({ id }) => id)).toEqual(['draft', 'ready'])
    expect(result.drawn.map(({ id }) => id)).toEqual(['drawn'])
    expect(result.cancelled.map(({ id }) => id)).toEqual(['cancelled'])
  })

  it('busca sem diferenciar acentos ou maiusculas e filtra por papel', () => {
    const result = selectDashboardGroups([
      group({ id: 'owner', name: 'Família', roles: ['OWNER'] }),
      group({ id: 'participant', name: 'Trabalho', roles: ['PARTICIPANT'] }),
    ], { ...defaultFilters, query: 'familia', role: 'OWNER' })

    expect(result.pending.map(({ id }) => id)).toEqual(['owner'])
  })

  it('filtra sorteios por dias de calendario', () => {
    const result = selectDashboardGroups([
      group({ id: 'today', status: 'SORTEADO', sorteadoAt: '2026-10-17T10:00:00-03:00' }),
      group({ id: 'yesterday', status: 'SORTEADO', sorteadoAt: '2026-10-16T10:00:00-03:00' }),
    ], { ...defaultFilters, period: 'TODAY' })

    expect(result.drawn.map(({ id }) => id)).toEqual(['today'])
  })

  it('usa a data disponivel quando sorteadoAt nao foi retornado', () => {
    const result = selectDashboardGroups([
      group({
        id: 'without-draw-date',
        status: 'SORTEADO',
        sorteadoAt: null,
        updatedAt: '2026-10-17T10:00:00-03:00',
      }),
    ], { ...defaultFilters, period: 'TODAY' })

    expect(result.drawn.map(({ id }) => id)).toEqual(['without-draw-date'])
  })

  it('ordena cada secao pela data relevante', () => {
    const result = selectDashboardGroups([
      group({ id: 'older', updatedAt: '2026-10-10T12:00:00.000Z' }),
      group({ id: 'newer', updatedAt: '2026-10-16T12:00:00.000Z' }),
    ], defaultFilters)

    expect(result.pending.map(({ id }) => id)).toEqual(['newer', 'older'])
  })
})
