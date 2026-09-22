import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Form } from '../components/Form'
import { DrawSection } from '../features/groups/DrawSection'
import { InvitationsSection } from '../features/groups/InvitationsSection'
import { ParticipantsSection } from '../features/groups/ParticipantsSection'
import { RestrictionsSection } from '../features/groups/RestrictionsSection'
import { groupKey, groupQueryOptions, groupsKey } from '../features/groups/group.queries'
import { groupSchema, type GroupFormData } from '../features/groups/group.schemas'
import { getErrorMessage } from '../lib/errors'
import { formErrorMessage, secondaryLink } from '../lib/styles'
import { groupsService } from '../services/groups'
import { EditIcon, CancelIcon, DeleteIcon, SaveIcon, PixelBrand } from '../components/PixelIcons'

export function GroupPage() {
  const { groupId } = useParams()
  if (!groupId) return <Navigate to="/dashboard" replace />
  return <GroupContent groupId={groupId} />
}

function GroupContent({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const group = useQuery(groupQueryOptions(groupId))
  const [renaming, setRenaming] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<GroupFormData>({ resolver: zodResolver(groupSchema), defaultValues: { name: '' } })
  useEffect(() => { if (group.data) reset({ name: group.data.name }) }, [group.data, reset])
  const rename = useMutation({
    mutationFn: ({ name }: GroupFormData) => groupsService.update(groupId, name),
    onSuccess: async () => { setRenaming(false); await Promise.all([queryClient.invalidateQueries({ queryKey: groupKey(groupId) }), queryClient.invalidateQueries({ queryKey: groupsKey })]) },
  })
  const remove = useMutation({
    mutationFn: () => groupsService.remove(groupId),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: groupKey(groupId) })
      await queryClient.invalidateQueries({ queryKey: groupsKey })
      navigate('/dashboard', { replace: true })
    },
  })

  if (group.isPending) return <main className="grid min-h-screen place-items-center bg-amber-100/50 p-6 font-mono"><p className="border-2 border-black bg-amber-400 p-4 font-black shadow-[4px_4px_0_#151515]">Carregando grupo...</p></main>
  if (group.isError) return <main className="grid min-h-screen place-items-center bg-amber-100/50 p-6 font-mono"><div className="max-w-md border-2 border-black bg-white p-6 shadow-[6px_6px_0_#151515]"><h1 className="text-2xl font-black">Grupo indisponível</h1><p className="mt-3 text-sm text-black/70">Não foi possível localizar ou carregar este grupo.</p><Link className={`${secondaryLink} mt-5`} to="/dashboard">Voltar ao dashboard</Link></div></main>

  const editable = group.data.status === 'DRAFT'
  return <main className="min-h-screen bg-amber-100/50 px-5 py-6 font-mono text-black sm:px-8 lg:px-14">
    <header className="mx-auto flex max-w-6xl items-center justify-between gap-4"><PixelBrand /><Link className={secondaryLink} to="/dashboard">← Dashboard</Link></header>
    <div className="mx-auto max-w-6xl py-10 sm:py-14">
      <section className={`border-2 border-black p-6 shadow-[7px_7px_0_#151515] sm:p-8 ${editable ? 'bg-white' : 'bg-green-900 text-white'}`}>
        <span className={`inline-block border-2 border-black px-3 py-1 text-xs font-black uppercase ${editable ? 'bg-amber-400' : 'bg-white text-green-900'}`}>{editable ? 'Rascunho' : group.data.status === 'SORTEADO' ? 'Sorteado' : group.data.status}</span>
        {renaming ? <Form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start" onSubmit={handleSubmit((data) => rename.mutate(data))}><div className="flex-1"><Form.Label className="sr-only" htmlFor="rename-group">Nome do grupo</Form.Label><Form.Input id="rename-group" autoFocus {...register('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'rename-group-error' : undefined} />{errors.name && <p id="rename-group-error" className={`${formErrorMessage} mt-2`} role="alert">{errors.name.message}</p>}</div><Form.Button className="gap-2" type="submit" disabled={rename.isPending}><SaveIcon />{rename.isPending ? 'Salvando...' : 'Salvar'}</Form.Button><Form.Button className="gap-2" variant="secondary" onClick={() => setRenaming(false)}><CancelIcon />Cancelar</Form.Button></Form> : <div className="mt-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"><h1 className="break-words text-4xl leading-none font-black tracking-[-0.06em] sm:text-5xl">{group.data.name}</h1>{editable && <Button className="gap-2" variant="secondary" onClick={() => setRenaming(true)}><EditIcon />Editar nome</Button>}</div>}
        {rename.isError && <p className={`${formErrorMessage} mt-4 text-sm`} role="alert">{getErrorMessage(rename.error, 'Não foi possível renomear o grupo.')}</p>}
        {!editable && <p className="mt-5 max-w-2xl text-sm leading-6 text-white/80">O sorteio foi realizado. Participantes e restrições estão bloqueados; acompanhe abaixo os convites e revelações.</p>}
      </section>
      <div className="mt-8 grid items-start gap-8 xl:grid-cols-2"><ParticipantsSection groupId={groupId} editable={editable} /><RestrictionsSection groupId={groupId} editable={editable} /></div>
      <div className="mt-8">{editable ? <DrawSection groupId={groupId} /> : group.data.status === 'SORTEADO' ? <InvitationsSection groupId={groupId} /> : null}</div>
      {editable && <section className="mt-8 border-2 border-red-700 bg-red-50 p-5 shadow-[6px_6px_0_#991b1b] sm:p-6" aria-labelledby="delete-group-title"><h2 id="delete-group-title" className="text-xl font-black uppercase text-red-700">Excluir grupo</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-red-950">Exclua permanentemente este grupo em rascunho, incluindo participantes e restrições. Esta ação não pode ser desfeita.</p><Button className="mt-5 gap-2" variant="danger" onClick={() => { remove.reset(); setConfirmingDelete(true) }}><DeleteIcon />Excluir grupo</Button></section>}
    </div>
    {confirmingDelete && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-5" role="presentation"><div className="w-full max-w-lg border-2 border-black bg-white p-6 shadow-[8px_8px_0_#151515]" role="dialog" aria-modal="true" aria-labelledby="delete-group-dialog-title" aria-describedby="delete-group-dialog-description"><h2 id="delete-group-dialog-title" className="text-2xl font-black uppercase">Excluir grupo?</h2><p id="delete-group-dialog-description" className="mt-4 text-sm leading-6">O grupo <strong>{group.data.name}</strong>, seus participantes e suas restrições serão excluídos permanentemente.</p>{remove.isError && <p className={`${formErrorMessage} mt-4 text-sm`} role="alert">{getErrorMessage(remove.error, 'Não foi possível excluir o grupo.')}</p>}<div className="mt-6 flex flex-wrap gap-3"><Button className="gap-2" variant="secondary" disabled={remove.isPending} onClick={() => setConfirmingDelete(false)}><CancelIcon />Cancelar</Button><Button className="gap-2" variant="danger" disabled={remove.isPending} onClick={() => remove.mutate()}><DeleteIcon />{remove.isPending ? 'Excluindo...' : 'Excluir grupo'}</Button></div></div></div>}
  </main>
}
