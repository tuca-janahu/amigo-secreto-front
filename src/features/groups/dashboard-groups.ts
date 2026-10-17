import type { AccessibleGroup } from '../../services/groups'

export type DashboardRoleFilter = 'ALL' | 'OWNER' | 'PARTICIPANT'
export type DashboardSortOrder = 'DESC' | 'ASC'
export type DashboardPeriodFilter =
  | 'ALL'
  | 'TODAY'
  | 'YESTERDAY'
  | 'LAST_7_DAYS'
  | 'LAST_30_DAYS'
  | 'OLDER'

type DashboardFilters = {
  query: string
  role: DashboardRoleFilter
  sortOrder: DashboardSortOrder
  period: DashboardPeriodFilter
  now?: Date
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

function dateValue(value?: string | null) {
  if (!value) return 0
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function relevantDate(group: AccessibleGroup) {
  if (group.status === 'SORTEADO') {
    return dateValue(group.sorteadoAt ?? group.updatedAt ?? group.createdAt)
  }

  return dateValue(group.updatedAt ?? group.createdAt)
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
}

function matchesPeriod(group: AccessibleGroup, period: DashboardPeriodFilter, now: Date) {
  if (period === 'ALL') return true

  const drawDate = dateValue(group.sorteadoAt ?? group.updatedAt ?? group.createdAt)
  if (!drawDate) return false

  const today = startOfDay(now)
  const day = 24 * 60 * 60 * 1000
  const sevenDaysAgo = today - 6 * day
  const thirtyDaysAgo = today - 29 * day

  switch (period) {
    case 'TODAY':
      return drawDate >= today
    case 'YESTERDAY':
      return drawDate >= today - day && drawDate < today
    case 'LAST_7_DAYS':
      return drawDate >= sevenDaysAgo
    case 'LAST_30_DAYS':
      return drawDate >= thirtyDaysAgo
    case 'OLDER':
      return drawDate < thirtyDaysAgo
  }
}

export function selectDashboardGroups(
  groups: AccessibleGroup[],
  { query, role, sortOrder, period, now = new Date() }: DashboardFilters,
) {
  const pending: AccessibleGroup[] = []
  const drawn: AccessibleGroup[] = []
  const cancelled: AccessibleGroup[] = []
  const normalizedQuery = normalizeText(query.trim())

  for (const group of groups) {
    if (normalizedQuery && !normalizeText(group.name).includes(normalizedQuery)) continue
    if (role !== 'ALL' && !group.roles.includes(role)) continue

    if (group.status === 'SORTEADO') {
      if (matchesPeriod(group, period, now)) drawn.push(group)
    } else if (group.status === 'CANCELLED') {
      cancelled.push(group)
    } else {
      pending.push(group)
    }
  }

  const direction = sortOrder === 'DESC' ? -1 : 1
  const sortByDate = (left: AccessibleGroup, right: AccessibleGroup) =>
    (relevantDate(left) - relevantDate(right)) * direction

  pending.sort(sortByDate)
  drawn.sort(sortByDate)
  cancelled.sort(sortByDate)

  return { pending, drawn, cancelled }
}
