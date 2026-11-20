import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form } from '../../components/Form'
import { Button } from '../../components/Button'
import { inputClass, formErrorMessage } from '../../lib/styles'
import { eventLabels, statusLabels } from '../../services/admin'
import { adminFiltersSchema, defaultFilters, type FilterValues } from './admin.schemas'

export type AdminTab = 'events' | 'overview' | 'users' | 'groups'
export function AdminFilters({ tab, values, onApply }: { tab: AdminTab; values: FilterValues; onApply: (values: FilterValues) => void }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FilterValues>({ resolver: zodResolver(adminFiltersSchema), values })
  const period = tab === 'events' || tab === 'overview'
  function field(name: keyof FilterValues, label: string, type = 'text') {
    return <div className="min-w-0 space-y-2"><Form.Label htmlFor={`admin-${name}`}>{label}</Form.Label><Form.Input id={`admin-${name}`} type={type} autoComplete="off" {...register(name)} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} />{errors[name] && <p id={`${name}-error`} className={formErrorMessage}>{errors[name].message}</p>}</div>
  }
  return <Form onSubmit={handleSubmit(onApply)} className="space-y-5 border-b-2 border-black bg-amber-50 p-5 sm:p-6">
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {period && <>{field('from', 'De', 'date')}{field('to', 'Até', 'date')}</>}
      {tab === 'events' && <div className="space-y-2 sm:col-span-2"><Form.Label htmlFor="admin-type">Evento</Form.Label><select id="admin-type" className={inputClass} {...register('type')}><option value="">Todos os eventos</option>{Object.entries(eventLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>}
      {(tab === 'users' || tab === 'groups') && <div className="sm:col-span-2">{field('q', tab === 'users' ? 'Nome ou e-mail' : 'Nome do grupo', 'search')}</div>}
      {tab === 'groups' && <div className="space-y-2"><Form.Label htmlFor="admin-status">Status</Form.Label><select id="admin-status" className={inputClass} {...register('status')}><option value="">Todos os status</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>}
    </div>
    {(tab === 'events' || tab === 'groups') && <details><summary className="w-fit cursor-pointer py-2 text-sm font-bold underline underline-offset-4 focus-visible:outline-2">Filtrar por identificador</summary><div className="mt-3 grid gap-5 sm:grid-cols-2">{tab === 'events' ? <>{field('actorUserId', 'ID do autor')}{field('groupId', 'ID do grupo')}</> : field('ownerId', 'ID do organizador')}</div></details>}
    <div className="flex flex-wrap items-center gap-3"><Button type="submit">Aplicar filtros</Button><Button variant="tertiary" onClick={() => { const defaults = defaultFilters() as FilterValues; reset(defaults); onApply(defaults) }}>Limpar filtros</Button>{period && <p className="text-xs leading-relaxed text-black/70">Até 90 dias · Horário de Brasília</p>}</div>
  </Form>
}
