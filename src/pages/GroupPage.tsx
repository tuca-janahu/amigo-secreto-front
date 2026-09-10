import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useParams } from 'react-router-dom'
import { PixelBrand } from '../components/PixelBrand'
import { DrawSection } from '../features/groups/DrawSection'
import { InvitationsSection } from '../features/groups/InvitationsSection'
import { ParticipantsSection } from '../features/groups/ParticipantsSection'
import { RestrictionsSection } from '../features/groups/RestrictionsSection'
import { groupKey, groupQueryOptions, groupsKey } from '../features/groups/group.queries'
import { groupSchema, type GroupFormData } from '../features/groups/group.schemas'
import { getErrorMessage } from '../lib/errors'
import { inputClass, primaryButton, secondaryButton } from '../lib/styles'
import { groupsService } from '../services/groups'

export function GroupPage() {
  const { groupId } = useParams()
  if (!groupId) return <Navigate to="/dashboard" replace />
  return <GroupContent groupId={groupId} />
}

function GroupContent({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient()
  const group = useQuery(groupQueryOptions(groupId))
  const [renaming, setRenaming] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<GroupFormData>({ resolver: zodResolver(groupSchema), defaultValues: { name: '' } })
  useEffect(() => { if (group.data) reset({ name: group.data.name }) }, [group.data, reset])
  const rename = useMutation({
    mutationFn: ({ name }: GroupFormData) => groupsService.update(groupId, name),
    onSuccess: async () => { setRenaming(false); await Promise.all([queryClient.invalidateQueries({ queryKey: groupKey(groupId) }), queryClient.invalidateQueries({ queryKey: groupsKey })]) },
  })

  if (group.isPending) return <main className="grid min-h-screen place-items-center bg-amber-100/50 p-6 font-mono"><p className="border-2 border-black bg-amber-400 p-4 font-black shadow-[4px_4px_0_#151515]">Carregando grupo...</p></main>
  if (group.isError) return <main className="grid min-h-screen place-items-center bg-amber-100/50 p-6 font-mono"><div className="max-w-md border-2 border-black bg-white p-6 shadow-[6px_6px_0_#151515]"><h1 className="text-2xl font-black">Grupo indisponível</h1><p className="mt-3 text-sm text-black/70">Não foi possível localizar ou carregar este grupo.</p><Link className={`${secondaryButton} mt-5`} to="/dashboard">Voltar ao dashboard</Link></div></main>

  const editable = group.data.status === 'DRAFT'
  return <main className="min-h-screen bg-amber-100/50 px-5 py-6 font-mono text-black sm:px-8 lg:px-14">
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4"><PixelBrand /><Link className={secondaryButton} to="/dashboard">← Dashboard</Link></header>
    <div className="mx-auto max-w-6xl py-10 sm:py-14">
      <section className={`border-2 border-black p-6 shadow-[7px_7px_0_#151515] sm:p-8 ${editable ? 'bg-white' : 'bg-green-900 text-white'}`}>
        <span className={`inline-block border-2 border-black px-3 py-1 text-xs font-black uppercase ${editable ? 'bg-amber-400' : 'bg-white text-green-900'}`}>{editable ? 'Rascunho' : group.data.status === 'SORTEADO' ? 'Sorteado' : group.data.status}</span>
        {renaming ? <form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start" onSubmit={handleSubmit((data) => rename.mutate(data))}><div className="flex-1"><label className="sr-only" htmlFor="rename-group">Nome do grupo</label><input id="rename-group" className={inputClass} autoFocus {...register('name')} />{errors.name && <p className="mt-2 text-xs font-bold text-red-700">{errors.name.message}</p>}</div><button className={primaryButton} disabled={rename.isPending}>{rename.isPending ? 'Salvando...' : 'Salvar'}</button><button className={secondaryButton} type="button" onClick={() => setRenaming(false)}>Cancelar</button></form> : <div className="mt-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"><h1 className="break-words text-4xl leading-none font-black tracking-[-0.06em] sm:text-5xl">{group.data.name}</h1>{editable && <button className={secondaryButton} type="button" onClick={() => setRenaming(true)}>Editar nome</button>}</div>}
        {rename.isError && <p className="mt-4 text-sm font-bold text-red-700" role="alert">{getErrorMessage(rename.error, 'Não foi possível renomear o grupo.')}</p>}
        {!editable && <p className="mt-5 max-w-2xl text-sm leading-6 text-white/80">O sorteio foi realizado. Participantes e restrições estão bloqueados; acompanhe abaixo os convites e revelações.</p>}
      </section>
      <div className="mt-8 grid items-start gap-8 xl:grid-cols-2"><ParticipantsSection groupId={groupId} editable={editable} /><RestrictionsSection groupId={groupId} editable={editable} /></div>
      <div className="mt-8">{editable ? <DrawSection groupId={groupId} /> : group.data.status === 'SORTEADO' ? <InvitationsSection groupId={groupId} /> : null}</div>
    </div>
  </main>
}
