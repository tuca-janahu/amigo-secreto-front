import { z } from 'zod'

export function defaultFilters(now = new Date()) {
  const to = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  const from = new Date(Date.parse(`${to}T00:00:00Z`) - 29 * 86400000).toISOString().slice(0, 10)
  return { from, to, type: '', actorUserId: '', groupId: '', q: '', status: '', ownerId: '' }
}
const date = z.string().date('Informe uma data válida.').min(10).refine(value => value >= '1970-01-01' && value <= '9999-12-30', 'Data fora do intervalo permitido.')
export const adminFiltersSchema = z.object({
  from: date, to: date,
  type: z.enum(['', 'USER_REGISTERED', 'GROUP_CREATED', 'GROUP_RENAMED', 'SORTEIO_COMPLETED', 'GROUP_DELETED']),
  status: z.enum(['', 'DRAFT', 'READY', 'SORTEADO', 'CANCELLED']),
  q: z.string().trim().max(100, 'Use até 100 caracteres.'),
  actorUserId: z.string().trim().max(128), groupId: z.string().trim().max(128), ownerId: z.string().trim().max(128),
}).refine(({ from, to }) => {
  const days = (Date.parse(to) - Date.parse(from)) / 86400000 + 1
  return days >= 1 && days <= 90
}, { path: ['to'], message: 'Selecione um período de 1 a 90 dias.' })
export type FilterValues = z.infer<typeof adminFiltersSchema>
