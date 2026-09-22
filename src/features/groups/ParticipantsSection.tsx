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
    <div className="flex flex-wrap gap-3 sm:col-span-2"><Form.Button className={participant ? 'gap-2' : ''} type="submit" disabled={pending}>{participant && <SaveIcon />}{pending ? 'Salvando...' : participant ? 'Salvar edição' : 'Adicionar participante'}</Form.Button>{onCancel && <Form.Button className="gap-2" variant="secondary" onClick={onCancel}><CancelIcon />Cancelar</Form.Button>}</div>
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
        <article key={participant.id} className="flex flex-col justify-between gap-3 border-2 border-black bg-gray-50 p-4 sm:flex-row sm:items-center"><div className="min-w-0"><h3 className="break-words font-black">{participant.name}</h3><p className="break-all text-sm text-black/60">{participant.email}</p></div>{editable && <div className="flex shrink-0 gap-2"><Button className="gap-2" variant="secondary" onClick={() => setEditing(participant)}><EditIcon />Editar</Button><Button className="gap-2" variant="danger" disabled={remove.isPending} onClick={() => { if (window.confirm(`Excluir ${participant.name}?`)) remove.mutate(participant.id) }}><DeleteIcon />Excluir</Button></div>}</article>
      ))}
    </div>
    {editable && <Form className="mt-8 border-t-2 border-black pt-6" onSubmit={importForm.handleSubmit((data) => { setFeedback(undefined); importParticipants.mutate(data) })}><h3 className="font-black uppercase">Importar por colagem</h3><p className="mt-2 text-xs leading-5 text-black/60">Uma pessoa por linha: nome + TAB + e-mail. Também aceitamos ponto e vírgula.</p><Form.Label className="mt-4 block" htmlFor="participants-paste">Participantes</Form.Label><textarea id="participants-paste" className={`${inputClass} mt-2 min-h-32 resize-y`} placeholder={'Lucas\tlucas@email.com\nMaria\tmaria@email.com'} {...importForm.register('data')} aria-invalid={Boolean(importForm.formState.errors.data)} />{importForm.formState.errors.data && <p className={`${formErrorMessage} mt-2`} role="alert">{importForm.formState.errors.data.message}</p>}{importParticipants.isError && <p className={`${formErrorMessage} mt-3 text-sm`} role="alert">{getErrorMessage(importParticipants.error, 'Não foi possível importar.')}</p>}<Form.Button className="mt-4" type="submit" disabled={importParticipants.isPending}>{importParticipants.isPending ? 'Importando...' : 'Importar participantes'}</Form.Button></Form>}
  </section>
}

function DeleteIcon() {
  return <svg aria-hidden="true" className="size-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M18 20V8H6V20H18ZM9 6H15V4H9V6ZM20 22H4V8H2V6H7V2H17V6H22V8H20V22Z" /></svg>
}

function EditIcon() {
  return <svg aria-hidden="true" className="size-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M11 5H5v14h14v-6h2v8H3V3h8v2Zm-1 7h2v2h2v2H8v-6h2v2Zm6 2h-2v-2h2v2Zm2-2h-2v-2h2v2Zm-6-2h-2V8h2v2Zm8 0h-2V8h2v2Zm-6-2h-2V6h2v2Zm8 0h-2V6h2v2Zm-6-2h-2V4h2v2Zm4 0h-2V4h2v2Zm-2-2h-2V2h2v2Z" /></svg>
}

function SaveIcon() {
  return <svg aria-hidden="true" className="size-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M10 18H8v-2h2v2Zm-2-2H6v-2h2v2Zm4-2v2h-2v-2h2Zm-6 0H4v-2h2v2Zm8 0h-2v-2h2v2Zm2-2h-2v-2h2v2Zm2-2h-2V8h2v2Zm2-2h-2V6h2v2Z" /></svg>
}

function CancelIcon() {
  return <svg aria-hidden="true" className="size-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M7 19H5v-2h2v2Zm12 0h-2v-2h2v2ZM9 15v2H7v-2h2Zm8 2h-2v-2h2v2Zm-6-2H9v-2h2v2Zm4 0h-2v-2h2v2Zm-2-2h-2v-2h2v2Zm-2-2H9V9h2v2Zm4 0h-2V9h2v2ZM9 9H7V7h2v2Zm8 0h-2V7h2v2ZM7 7H5V5h2v2Zm12 0h-2V5h2v2Z" /></svg>
}
