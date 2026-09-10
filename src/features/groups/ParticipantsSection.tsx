import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/Button'
import { Form } from '../../components/Form'
import { participantsKey, participantsQueryOptions, restrictionsKey, viabilityKey } from './group.queries'
import { importSchema, participantSchema, type ImportFormData, type ParticipantFormData } from './group.schemas'
import { getErrorMessage } from '../../lib/errors'
import { formErrorMessage, inputClass, panelClass } from '../../lib/styles'
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
  return <Form className="grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit(onSave)}>
    <div><Form.Label htmlFor={participant ? `name-${participant.id}` : 'participant-name'}>Nome</Form.Label><Form.Input id={participant ? `name-${participant.id}` : 'participant-name'} className="mt-2" {...register('name')} aria-invalid={Boolean(errors.name)} />{errors.name && <p className={`${formErrorMessage} mt-2`} role="alert">{errors.name.message}</p>}</div>
    <div><Form.Label htmlFor={participant ? `email-${participant.id}` : 'participant-email'}>E-mail</Form.Label><Form.Input id={participant ? `email-${participant.id}` : 'participant-email'} className="mt-2" type="email" {...register('email')} aria-invalid={Boolean(errors.email)} />{errors.email && <p className={`${formErrorMessage} mt-2`} role="alert">{errors.email.message}</p>}</div>
    <div className="flex flex-wrap gap-3 sm:col-span-2"><Form.Button type="submit" disabled={pending}>{pending ? 'Salvando...' : participant ? 'Salvar edição' : 'Adicionar participante'}</Form.Button>{onCancel && <Form.Button variant="secondary" onClick={onCancel}>Cancelar</Form.Button>}</div>
  </Form>
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
    {mutationError && <p className={`${formErrorMessage} mt-4 text-sm`} role="alert">{getErrorMessage(mutationError, 'Não foi possível alterar o participante.')}</p>}
    {feedback && <p className="mt-4 border-2 border-green-900 bg-green-100 p-3 text-sm font-bold" role="status">{feedback}</p>}
    <div className="mt-6 grid gap-3">
      {participants.isPending && <p className="text-sm font-bold">Carregando participantes...</p>}
      {participants.isError && <p className="text-sm font-bold text-red-700" role="alert">Não foi possível carregar os participantes.</p>}
      {participants.data?.length === 0 && <p className="text-sm text-black/60">Nenhum participante adicionado.</p>}
      {participants.data?.map((participant) => editing?.id === participant.id ? <div key={participant.id} className="border-2 border-black bg-amber-50 p-4"><ParticipantForm participant={participant} pending={update.isPending} onSave={(data) => update.mutate(data)} onCancel={() => setEditing(undefined)} /></div> : (
        <article key={participant.id} className="flex flex-col justify-between gap-3 border-2 border-black bg-gray-50 p-4 sm:flex-row sm:items-center"><div className="min-w-0"><h3 className="break-words font-black">{participant.name}</h3><p className="break-all text-sm text-black/60">{participant.email}</p></div>{editable && <div className="flex shrink-0 gap-2"><Button variant="secondary" onClick={() => setEditing(participant)}>Editar</Button><Button variant="danger" disabled={remove.isPending} onClick={() => { if (window.confirm(`Excluir ${participant.name}?`)) remove.mutate(participant.id) }}>Excluir</Button></div>}</article>
      ))}
    </div>
    {editable && <Form className="mt-8 border-t-2 border-black pt-6" onSubmit={importForm.handleSubmit((data) => { setFeedback(undefined); importParticipants.mutate(data) })}><h3 className="font-black uppercase">Importar por colagem</h3><p className="mt-2 text-xs leading-5 text-black/60">Uma pessoa por linha: nome + TAB + e-mail. Também aceitamos ponto e vírgula.</p><Form.Label className="mt-4 block" htmlFor="participants-paste">Participantes</Form.Label><textarea id="participants-paste" className={`${inputClass} mt-2 min-h-32 resize-y`} placeholder={'Lucas\tlucas@email.com\nMaria\tmaria@email.com'} {...importForm.register('data')} aria-invalid={Boolean(importForm.formState.errors.data)} />{importForm.formState.errors.data && <p className={`${formErrorMessage} mt-2`} role="alert">{importForm.formState.errors.data.message}</p>}{importParticipants.isError && <p className={`${formErrorMessage} mt-3 text-sm`} role="alert">{getErrorMessage(importParticipants.error, 'Não foi possível importar.')}</p>}<Form.Button className="mt-4" type="submit" disabled={importParticipants.isPending}>{importParticipants.isPending ? 'Importando...' : 'Importar participantes'}</Form.Button></Form>}
  </section>
}
