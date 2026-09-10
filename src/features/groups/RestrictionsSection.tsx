import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { getErrorMessage } from '../../lib/errors'
import { dangerButton, inputClass, panelClass, primaryButton } from '../../lib/styles'
import { restrictionsService, type Restriction } from '../../services/restrictions'
import { participantsQueryOptions, restrictionsKey, restrictionsQueryOptions, viabilityKey } from './group.queries'
import { restrictionSchema, type RestrictionFormData } from './group.schemas'

type Props = { groupId: string; editable: boolean }
type DisplayRestriction = { ids: string[]; first: Restriction['giver']; second: Restriction['forbidden']; bilateral: boolean }

function groupRestrictions(restrictions: Restriction[]): DisplayRestriction[] {
  const used = new Set<string>()
  const rows: DisplayRestriction[] = []
  for (const restriction of restrictions) {
    if (used.has(restriction.id)) continue
    const reverse = restrictions.find((item) => !used.has(item.id) && item.giver.id === restriction.forbidden.id && item.forbidden.id === restriction.giver.id)
    used.add(restriction.id)
    if (reverse) used.add(reverse.id)
    rows.push({ ids: reverse ? [restriction.id, reverse.id] : [restriction.id], first: restriction.giver, second: restriction.forbidden, bilateral: Boolean(reverse) })
  }
  return rows
}

export function RestrictionsSection({ groupId, editable }: Props) {
  const queryClient = useQueryClient()
  const participants = useQuery(participantsQueryOptions(groupId))
  const restrictions = useQuery(restrictionsQueryOptions(groupId))
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RestrictionFormData>({
    resolver: zodResolver(restrictionSchema), defaultValues: { firstId: '', secondId: '', bilateral: false },
  })
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: restrictionsKey(groupId) }),
      queryClient.invalidateQueries({ queryKey: viabilityKey(groupId) }),
    ])
  }
  const create = useMutation({
    mutationFn: (data: RestrictionFormData) => data.bilateral
      ? restrictionsService.createBilateral(groupId, data.firstId, data.secondId)
      : restrictionsService.create(groupId, data.firstId, data.secondId),
    onSuccess: async () => { reset(); await refresh() },
  })
  const remove = useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => restrictionsService.remove(groupId, id))),
    onSuccess: refresh,
  })
  const rows = groupRestrictions(restrictions.data ?? [])

  return <section className={panelClass} aria-labelledby="restrictions-title">
    <p className="text-xs font-black uppercase tracking-wider text-green-900">Regras</p><h2 id="restrictions-title" className="mt-2 text-2xl font-black uppercase">Restrições</h2>
    {editable && <form className="mt-6 grid gap-4 border-t-2 border-dashed border-black pt-5" onSubmit={handleSubmit((data) => create.mutate(data))} noValidate>
      <div className="grid gap-4 sm:grid-cols-2"><div><label className="text-xs font-black uppercase" htmlFor="restriction-first">Participante A</label><select id="restriction-first" className={`${inputClass} mt-2`} {...register('firstId')}><option value="">Escolha...</option>{participants.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{errors.firstId && <p className="mt-2 text-xs font-bold text-red-700" role="alert">{errors.firstId.message}</p>}</div><div><label className="text-xs font-black uppercase" htmlFor="restriction-second">Participante B</label><select id="restriction-second" className={`${inputClass} mt-2`} {...register('secondId')}><option value="">Escolha...</option>{participants.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{errors.secondId && <p className="mt-2 text-xs font-bold text-red-700" role="alert">{errors.secondId.message}</p>}</div></div>
      <label className="flex cursor-pointer items-start gap-3 text-sm font-bold"><input className="mt-0.5 size-5 accent-green-900" type="checkbox" {...register('bilateral')} /><span>A e B não podem se tirar <span className="block text-xs font-normal text-black/60">Desmarcado: apenas A não pode tirar B.</span></span></label>
      {create.isError && <p className="border-2 border-red-700 bg-red-50 p-3 text-sm font-bold text-red-700" role="alert">{getErrorMessage(create.error, 'Não foi possível criar a restrição.')}</p>}
      <button className={`${primaryButton} justify-self-start`} disabled={create.isPending || (participants.data?.length ?? 0) < 2}>{create.isPending ? 'Adicionando...' : 'Adicionar restrição'}</button>
    </form>}
    <div className="mt-6 grid gap-3">{restrictions.isPending && <p className="text-sm font-bold">Carregando restrições...</p>}{restrictions.isError && <p className="text-sm font-bold text-red-700" role="alert">Não foi possível carregar as restrições.</p>}{rows.length === 0 && <p className="text-sm text-black/60">Nenhuma restrição cadastrada.</p>}{rows.map((row) => <article key={row.ids.join('-')} className="flex flex-col justify-between gap-3 border-2 border-black bg-gray-50 p-4 sm:flex-row sm:items-center"><p className="font-bold">{row.first.name} <span className="text-red-600">{row.bilateral ? '↔' : '→ não pode tirar →'}</span> {row.second.name}</p>{editable && <button className={dangerButton} type="button" disabled={remove.isPending} onClick={() => { if (window.confirm('Remover esta restrição?')) remove.mutate(row.ids) }}>Remover</button>}</article>)}</div>
    {remove.isError && <p className="mt-4 text-sm font-bold text-red-700" role="alert">{getErrorMessage(remove.error, 'Não foi possível remover a restrição.')}</p>}
  </section>
}
