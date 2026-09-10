import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { participantsKey, participantsQueryOptions, restrictionsKey, viabilityKey } from './group.queries'
import { importSchema, participantSchema, type ImportFormData, type ParticipantFormData } from './group.schemas'
import { getErrorMessage } from '../../lib/errors'
import { dangerButton, inputClass, panelClass, primaryButton, secondaryButton } from '../../lib/styles'
import { participantsService, type Participant } from '../../services/participants'

type Props = { groupId: string; editable: boolean }

function ParticipantForm({ participant, pending, onCancel, onSave }: {
  participant?: Participant
  pending: boolean
  onCancel?: () => void
  onSave: (data: ParticipantFormData) => void
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ParticipantFormData>({
    resolver: zodResolver(participantSchema),
    defaultValues: { name: participant?.name ?? '', email: participant?.email ?? '' },
  })
  useEffect(() => reset({ name: participant?.name ?? '', email: participant?.email ?? '' }), [participant, reset])
  return <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit(onSave)} noValidate>
    <div><label className="text-xs font-black uppercase" htmlFor={participant ? `name-${participant.id}` : 'participant-name'}>Nome</label><input id={participant ? `name-${participant.id}` : 'participant-name'} className={`${inputClass} mt-2`} {...register('name')} aria-invalid={Boolean(errors.name)} />{errors.name && <p className="mt-2 text-xs font-bold text-red-700" role="alert">{errors.name.message}</p>}</div>
    <div><label className="text-xs font-black uppercase" htmlFor={participant ? `email-${participant.id}` : 'participant-email'}>E-mail</label><input id={participant ? `email-${participant.id}` : 'participant-email'} className={`${inputClass} mt-2`} type="email" {...register('email')} aria-invalid={Boolean(errors.email)} />{errors.email && <p className="mt-2 text-xs font-bold text-red-700" role="alert">{errors.email.message}</p>}</div>
    <div className="flex flex-wrap gap-3 sm:col-span-2"><button className={primaryButton} type="submit" disabled={pending}>{pending ? 'Salvando...' : participant ? 'Salvar edição' : 'Adicionar participante'}</button>{onCancel && <button className={secondaryButton} type="button" onClick={onCancel}>Cancelar</button>}</div>
  </form>
}

export function ParticipantsSection({ groupId, editable }: Props) {
  const queryClient = useQueryClient()
  const participants = useQuery(participantsQueryOptions(groupId))
  const [editing, setEditing] = useState<Participant>()
  const [feedback, setFeedback] = useState<string>()
  const importForm = useForm<ImportFormData>({ resolver: zodResolver(importSchema), defaultValues: { data: '' } })
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: participantsKey(groupId) }),
      queryClient.invalidateQueries({ queryKey: restrictionsKey(groupId) }),
      queryClient.invalidateQueries({ queryKey: viabilityKey(groupId) }),
    ])
  }
  const create = useMutation({ mutationFn: (data: ParticipantFormData) => participantsService.create(groupId, data), onSuccess: async () => { setFeedback('Participante adicionado.'); await refresh() } })
  const update = useMutation({ mutationFn: (data: ParticipantFormData) => participantsService.update(groupId, editing!.id, data), onSuccess: async () => { setEditing(undefined); setFeedback('Participante atualizado.'); await refresh() } })
  const remove = useMutation({ mutationFn: (id: string) => participantsService.remove(groupId, id), onSuccess: async () => { setFeedback('Participante removido.'); await refresh() } })
  const importParticipants = useMutation({
    mutationFn: ({ data }: ImportFormData) => participantsService.import(groupId, data),
    onSuccess: async ({ imported }) => { importForm.reset(); setFeedback(`${imported} participante${imported === 1 ? '' : 's'} importado${imported === 1 ? '' : 's'}.`); await refresh() },
  })
  const mutationError = create.error ?? update.error ?? remove.error

  return <section className={panelClass} aria-labelledby="participants-title">
    <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-red-600">Turma</p><h2 id="participants-title" className="mt-2 text-2xl font-black uppercase">Participantes</h2></div><span className="border-2 border-black bg-amber-400 px-2 py-1 text-xs font-black">{participants.data?.length ?? 0}</span></div>
    {editable && <div className="mt-6 border-t-2 border-dashed border-black pt-5"><ParticipantForm key={`new-${participants.data?.length ?? 0}`} pending={create.isPending} onSave={(data) => { setFeedback(undefined); create.mutate(data) }} /></div>}
    {mutationError && <p className="mt-4 border-2 border-red-700 bg-red-50 p-3 text-sm font-bold text-red-700" role="alert">{getErrorMessage(mutationError, 'Não foi possível alterar o participante.')}</p>}
    {feedback && <p className="mt-4 border-2 border-green-900 bg-green-100 p-3 text-sm font-bold" role="status">{feedback}</p>}
    <div className="mt-6 grid gap-3">
      {participants.isPending && <p className="text-sm font-bold">Carregando participantes...</p>}
      {participants.isError && <p className="text-sm font-bold text-red-700" role="alert">Não foi possível carregar os participantes.</p>}
      {participants.data?.length === 0 && <p className="text-sm text-black/60">Nenhum participante adicionado.</p>}
      {participants.data?.map((participant) => editing?.id === participant.id ? <div key={participant.id} className="border-2 border-black bg-amber-50 p-4"><ParticipantForm participant={participant} pending={update.isPending} onSave={(data) => update.mutate(data)} onCancel={() => setEditing(undefined)} /></div> : (
        <article key={participant.id} className="flex flex-col justify-between gap-3 border-2 border-black bg-gray-50 p-4 sm:flex-row sm:items-center"><div className="min-w-0"><h3 className="break-words font-black">{participant.name}</h3><p className="break-all text-sm text-black/60">{participant.email}</p></div>{editable && <div className="flex shrink-0 gap-2"><button className={secondaryButton} type="button" onClick={() => setEditing(participant)}>Editar</button><button className={dangerButton} type="button" disabled={remove.isPending} onClick={() => { if (window.confirm(`Excluir ${participant.name}?`)) remove.mutate(participant.id) }}>Excluir</button></div>}</article>
      ))}
    </div>
    {editable && <form className="mt-8 border-t-2 border-black pt-6" onSubmit={importForm.handleSubmit((data) => { setFeedback(undefined); importParticipants.mutate(data) })} noValidate><h3 className="font-black uppercase">Importar por colagem</h3><p className="mt-2 text-xs leading-5 text-black/60">Uma pessoa por linha: nome + TAB + e-mail. Também aceitamos ponto e vírgula.</p><label className="mt-4 block text-xs font-black uppercase" htmlFor="participants-paste">Participantes</label><textarea id="participants-paste" className={`${inputClass} mt-2 min-h-32 resize-y`} placeholder={'Lucas\tlucas@email.com\nMaria\tmaria@email.com'} {...importForm.register('data')} aria-invalid={Boolean(importForm.formState.errors.data)} />{importForm.formState.errors.data && <p className="mt-2 text-xs font-bold text-red-700" role="alert">{importForm.formState.errors.data.message}</p>}{importParticipants.isError && <p className="mt-3 border-2 border-red-700 bg-red-50 p-3 text-sm font-bold text-red-700" role="alert">{getErrorMessage(importParticipants.error, 'Não foi possível importar.')}</p>}<button className={`${primaryButton} mt-4`} type="submit" disabled={importParticipants.isPending}>{importParticipants.isPending ? 'Importando...' : 'Importar participantes'}</button></form>}
  </section>
}
