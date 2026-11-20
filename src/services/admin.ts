import { http } from '../lib/http'

export const eventLabels = {
  USER_REGISTERED: 'Conta cadastrada',
  GROUP_CREATED: 'Grupo criado',
  GROUP_RENAMED: 'Grupo renomeado',
  SORTEIO_COMPLETED: 'Sorteio realizado',
  GROUP_DELETED: 'Grupo excluído',
} as const
export const statusLabels = { DRAFT: 'Rascunho', READY: 'Pronto', SORTEADO: 'Sorteado', CANCELLED: 'Cancelado' } as const
export type Period = { from: string; to: string }
export type PageResult<T> = { items: T[]; page: number; pageSize: number; total: number }
export type AuditEvent = {
  id: string; type: keyof typeof eventLabels; occurredAt: string
  actorUserId: string; actorName: string; groupId: string | null; groupName: string | null
}
export type AdminUser = { id: string; name: string; email: string; createdAt: string; groupsCount: number; sorteiosCount: number }
export type AdminGroup = {
  id: string; name: string; status: keyof typeof statusLabels; createdAt: string; sorteadoAt: string | null
  owner: { id: string; name: string; email: string }; participantsCount: number; revealedCount: number
}
export type Overview = {
  totals: { users: number; groups: number; sorteios: number; participations: number; groupsByStatus: Record<keyof typeof statusLabels, number> }
  activity: { newUsers: number; newGroups: number; completedSorteios: number }
  engagement: { participations: number; revealed: number; revealRate: number }
  invitations: { attempts: number; attemptsByStatus: Record<'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED', number> }
}
export type AdminFilters = Period & { type: string; actorUserId: string; groupId: string; q: string; status: string; ownerId: string }

function get<T>(path: string, params: Record<string, string | number>, signal?: AbortSignal) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value !== '') search.set(key, String(value)) })
  return http<T>(`/admin/${path}?${search}`, { signal, cache: 'no-store' })
}
export const adminService = {
  overview: (period: Period, signal?: AbortSignal) => get<Overview>('overview', period, signal),
  events: ({ from, to, type, actorUserId, groupId }: AdminFilters, page: number, signal?: AbortSignal) =>
    get<PageResult<AuditEvent>>('audit-events', { from, to, type, actorUserId, groupId, page, pageSize: 20 }, signal),
  users: ({ q }: AdminFilters, page: number, signal?: AbortSignal) => get<PageResult<AdminUser>>('users', { q, page, pageSize: 20 }, signal),
  groups: ({ q, status, ownerId }: AdminFilters, page: number, signal?: AbortSignal) => get<PageResult<AdminGroup>>('groups', { q, status, ownerId, page, pageSize: 20 }, signal),
}
