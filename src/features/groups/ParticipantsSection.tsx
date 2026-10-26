import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/Button'
import { Dialog } from '../../components/Dialog'
import { Form } from '../../components/Form'
import { CancelIcon, DeleteIcon, EditIcon, SaveIcon } from '../../components/PixelIcons'
import { formErrorMessage, inputClass, panelClass } from '../../lib/styles'
import { appToast } from '../../lib/toast'
import { participantsService, type Participant } from '../../services/participants'
import { useAuth } from '../auth/auth.queries'
import {
  groupKey,
  groupsKey,
  participantsKey,
  participantsQueryOptions,
  restrictionsKey,
  viabilityKey,
} from './group.queries'
import { importSchema, participantSchema, type ImportFormData, type ParticipantFormData } from './group.schemas'
import { hasParticipantEmail } from './participants.utils'

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
  const fieldPrefix = participant ? participant.id : 'new-participant'
  const nameId = `${fieldPrefix}-name`
  const emailId = `${fieldPrefix}-email`

  useEffect(() => reset({ name: participant?.name ?? '', email: participant?.email ?? '' }), [participant, reset])

  return <Form className="grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit(onSave)}>
    <div>
      <Form.Label htmlFor={nameId}>Nome</Form.Label>
      <Form.Input id={nameId} className="mt-2" autoComplete="off" {...register('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${nameId}-error` : undefined} />
      {errors.name && <p id={`${nameId}-error`} className={`${formErrorMessage} mt-2`} role="alert">{errors.name.message}</p>}
    </div>
    <div>
      <Form.Label htmlFor={emailId}>E-mail</Form.Label>
      <Form.Input id={emailId} className="mt-2" type="email" inputMode="email" autoComplete="off" spellCheck={false} {...register('email')} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${emailId}-error` : undefined} />
      {errors.email && <p id={`${emailId}-error`} className={`${formErrorMessage} mt-2`} role="alert">{errors.email.message}</p>}
    </div>
    <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
      <Form.Button className={`w-full sm:w-auto ${participant ? 'gap-2' : ''}`} type="submit" variant="tertiary" disabled={pending}>
        {participant && <SaveIcon />}
        {pending ? 'Salvando…' : participant ? 'Salvar edição' : 'Adicionar participante'}
      </Form.Button>
      {onCancel && <Form.Button className="w-full gap-2 sm:w-auto" variant="secondary" onClick={onCancel}><CancelIcon />Cancelar</Form.Button>}
    </div>
  </Form>
}

export function ParticipantsSection({ groupId, editable }: Props) {
  const queryClient = useQueryClient()
  const auth = useAuth()
  const participants = useQuery(participantsQueryOptions(groupId))
  const [editing, setEditing] = useState<Participant>()
  const [participantToRemove, setParticipantToRemove] = useState<Participant>()
  const importForm = useForm<ImportFormData>({ resolver: zodResolver(importSchema), defaultValues: { data: '' } })
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: groupKey(groupId) }),
      queryClient.invalidateQueries({ queryKey: groupsKey }),
      queryClient.invalidateQueries({ queryKey: participantsKey(groupId) }),
      queryClient.invalidateQueries({ queryKey: restrictionsKey(groupId) }),
      queryClient.invalidateQueries({ queryKey: viabilityKey(groupId) }),
    ])
  }
  const create = useMutation({
    mutationFn: (data: ParticipantFormData) => participantsService.create(groupId, data),
    onSuccess: async () => {
      appToast.success('Participante adicionado.', { id: 'participant-create' })
      await refresh()
    },
    onError: () => appToast.error('Não foi possível adicionar o participante.', { id: 'participant-create' }),
  })
  const update = useMutation({
    mutationFn: (data: ParticipantFormData) => participantsService.update(groupId, editing!.id, data),
    onSuccess: async () => {
      setEditing(undefined)
      appToast.success('Participante atualizado.', { id: 'participant-update' })
      await refresh()
    },
    onError: () => appToast.error('Não foi possível atualizar o participante.', { id: 'participant-update' }),
  })
  const remove = useMutation({
    mutationFn: (id: string) => participantsService.remove(groupId, id),
    onSuccess: async () => {
      setParticipantToRemove(undefined)
      appToast.success('Participante removido.', { id: 'participant-remove' })
      await refresh()
    },
    onError: () => appToast.error('Não foi possível remover o participante.', { id: 'participant-remove' }),
  })
  const importParticipants = useMutation({
    mutationFn: ({ data }: ImportFormData) => participantsService.import(groupId, data),
    onSuccess: async ({ imported }) => {
      importForm.reset()
      appToast.success(`${imported} participante${imported === 1 ? '' : 's'} importado${imported === 1 ? '' : 's'}.`, { id: 'participant-import' })
      await refresh()
    },
    onError: () => appToast.error('Não foi possível importar os participantes.', { id: 'participant-import' }),
  })
  const currentUserIsParticipant = hasParticipantEmail(participants.data, auth.data?.email)
  const isAddingCurrentUser = create.isPending && create.variables.email === auth.data?.email

  const addCurrentUser = () => {
    if (!auth.data) return
    create.mutate({ name: auth.data.name, email: auth.data.email })
  }

  return <section className={panelClass} aria-labelledby="participants-title">
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0"><p className="text-xs font-black uppercase tracking-wider text-red-600">Turma</p><h2 id="participants-title" className="mt-2 text-2xl font-black uppercase">Participantes</h2></div>
      <span className="shrink-0 border-2 border-black bg-amber-400 px-2 py-1 text-xs font-black">{participants.data?.length ?? 0}</span>
    </div>
    {editable && <div className="mt-6 border-t-2 border-dashed border-black pt-5">
      <div className="flex flex-col items-stretch justify-between gap-4 border-2 border-black bg-amber-50 p-4 sm:flex-row sm:items-center">
        <div><h3 className="font-black uppercase">Você vai participar?</h3><p className="mt-1 text-xs leading-5 text-black/60">Adicione seu nome e e-mail com um clique.</p></div>
        <Button className="w-full sm:w-auto" variant="secondary" disabled={auth.isPending || participants.isPending || create.isPending || currentUserIsParticipant || !auth.data} onClick={addCurrentUser}>
          {currentUserIsParticipant ? 'Você já participa' : isAddingCurrentUser ? 'Adicionando…' : 'Adicionar-me ao sorteio'}
        </Button>
      </div>
      <div className="mt-5 border-t-2 border-dashed border-black pt-5"><ParticipantForm key={`new-${participants.data?.length ?? 0}`} pending={create.isPending} onSave={(data) => create.mutate(data)} /></div>
    </div>}
    <div className="mt-6 grid gap-3">
      {participants.isPending && <p className="text-sm font-bold" role="status">Carregando participantes…</p>}
      {participants.isError && <p className="text-sm font-bold text-red-700" role="alert">Não foi possível carregar os participantes.</p>}
      {participants.data?.length === 0 && <p className="text-sm text-black/60">Nenhum participante adicionado.</p>}
      {participants.data?.map((participant) => editing?.id === participant.id ? <div key={participant.id} className="border-2 border-black bg-amber-50 p-4"><ParticipantForm participant={participant} pending={update.isPending} onSave={(data) => update.mutate(data)} onCancel={() => setEditing(undefined)} /></div> : (
        <article key={participant.id} className="flex min-w-0 flex-col justify-between gap-3 border-2 border-black bg-gray-50 p-4 sm:flex-row sm:items-center">
          <div className="min-w-0"><h3 className="break-words font-black">{participant.name}</h3><p className="[overflow-wrap:anywhere] text-sm text-black/60">{participant.email}</p></div>
          {editable && <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
            <Button className="size-11 px-0 py-0" variant="secondary" aria-label={`Editar ${participant.name}`} title="Editar participante" onClick={() => setEditing(participant)}><EditIcon /></Button>
            <Button className="size-11 px-0 py-0" variant="danger" aria-label={`Excluir ${participant.name}`} title="Excluir participante" disabled={remove.isPending} onClick={() => setParticipantToRemove(participant)}><DeleteIcon /></Button>
          </div>}
        </article>
      ))}
    </div>
    {editable && <Form className="mt-8 border-t-2 border-black pt-6" onSubmit={importForm.handleSubmit((data) => importParticipants.mutate(data))}>
      <h3 className="font-black uppercase">Importar por colagem</h3>
      <p className="mt-2 text-xs leading-5 text-black/60">Uma pessoa por linha: nome + TAB + e-mail. Também aceitamos ponto e vírgula.</p>
      <Form.Label className="mt-4 block" htmlFor="participants-paste">Participantes</Form.Label>
      <textarea id="participants-paste" className={`${inputClass} mt-2 min-h-32 resize-y`} placeholder={'Lucas\tlucas@email.com\nMaria\tmaria@email.com'} autoComplete="off" spellCheck={false} {...importForm.register('data')} aria-invalid={Boolean(importForm.formState.errors.data)} aria-describedby={importForm.formState.errors.data ? 'participants-paste-error' : undefined} />
      {importForm.formState.errors.data && <p id="participants-paste-error" className={`${formErrorMessage} mt-2`} role="alert">{importForm.formState.errors.data.message}</p>}
      <Form.Button className="mt-4 w-full sm:w-auto" type="submit" variant="tertiary" disabled={importParticipants.isPending}>{importParticipants.isPending ? 'Importando…' : 'Importar participantes'}</Form.Button>
    </Form>}

    <Dialog open={Boolean(participantToRemove)} onDismiss={() => { if (!remove.isPending) setParticipantToRemove(undefined) }}>
      <Dialog.Title>Excluir participante?</Dialog.Title>
      <Dialog.Description><strong>{participantToRemove?.name}</strong> será removido do grupo e das restrições relacionadas.</Dialog.Description>
      <Dialog.Actions>
        <Button className="w-full sm:w-auto" variant="secondary" disabled={remove.isPending} onClick={() => setParticipantToRemove(undefined)}>Cancelar</Button>
        <Button className="w-full sm:w-auto" variant="danger" disabled={remove.isPending} data-dialog-initial-focus onClick={() => { if (participantToRemove) remove.mutate(participantToRemove.id) }}>{remove.isPending ? 'Excluindo…' : 'Excluir participante'}</Button>
      </Dialog.Actions>
    </Dialog>
  </section>
}
