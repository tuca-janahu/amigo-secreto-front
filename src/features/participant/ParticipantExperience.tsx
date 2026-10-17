import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../components/Button'
import { appToast } from '../../lib/toast'
import { PixelBrand } from '../../components/PixelIcons'
import { Form } from '../../components/Form'
import { formErrorMessage, inputClass, panelClass } from '../../lib/styles'
import type { AnonymousMessage } from '../../services/messages'
import type { RevealResult } from '../../services/participant-access'
import { messageSchema, type MessageFormData } from './participant.schemas'

const delay = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds))

type ParticipantExperienceProps = {
  createMessage: (content: string) => Promise<AnonymousMessage>
  groupName: string
  headerAction?: ReactNode
  initiallyRevealed: boolean
  listMessages: () => Promise<AnonymousMessage[]>
  messagesKey: QueryKey
  notice?: ReactNode
  onRevealed?: () => void
  participantName: string
  reveal: () => Promise<RevealResult>
}

export function ParticipantExperience({
  createMessage,
  groupName,
  headerAction,
  initiallyRevealed,
  listMessages,
  messagesKey,
  notice,
  onRevealed,
  participantName,
  reveal,
}: ParticipantExperienceProps) {
  const queryClient = useQueryClient()
  const messages = useQuery({ queryKey: messagesKey, queryFn: listMessages, retry: false })
  const [result, setResult] = useState<string>()
  const [hidden, setHidden] = useState(false)
  const messageForm = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: '' },
  })
  const revealMutation = useMutation({
    mutationFn: async () => {
      const [response] = await Promise.all([reveal(), delay(1200)])
      return response
    },
    onSuccess: ({ result: revealedResult }) => {
      setResult(revealedResult.name)
      setHidden(false)
      onRevealed?.()
    },
    onError: () => appToast.error('Não foi possível revelar. Tente novamente.', { id: 'reveal-error' }),
  })
  const createMessageMutation = useMutation({
    mutationFn: ({ content }: MessageFormData) => createMessage(content),
    onSuccess: async () => {
      messageForm.reset()
      appToast.success('Mensagem publicada.', { id: 'message-create' })
      await queryClient.invalidateQueries({ queryKey: messagesKey })
    },
    onError: () => appToast.error('Não foi possível publicar a mensagem.', { id: 'message-create' }),
  })

  const showResult = Boolean(result) && !hidden

  return (
    <main className="min-h-screen bg-green-100 px-4 py-5 font-mono text-black sm:px-8 sm:py-8">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <PixelBrand />
        {headerAction}
      </header>
      <div className="mx-auto max-w-3xl py-8 sm:py-12">
        {notice}
        <section
          className="border-2 border-black bg-green-900 p-5 text-white shadow-[8px_8px_0_#151515] sm:p-9"
          aria-labelledby="participant-title"
        >
          <p className="text-xs font-black uppercase tracking-wider text-amber-300">{groupName}</p>
          <h1
            id="participant-title"
            className="mt-4 text-3xl leading-none font-black tracking-[-0.06em] sm:text-5xl"
          >
            Oi, {participantName}!
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/80">
            Seu amigo secreto está protegido e só aparece quando você pedir.
          </p>
        </section>

        <section className={`${panelClass} mt-8 text-center`} aria-live="polite">
          {revealMutation.isPending ? (
            <div className="reveal-shake py-8">
              <div className="mx-auto grid size-24 place-items-center border-2 border-black bg-red-600 text-5xl font-black text-white shadow-[5px_5px_0_#151515]">?</div>
              <p className="mt-6 font-black uppercase tracking-wider">Misturando os nomes...</p>
            </div>
          ) : showResult ? (
            <div className="py-5">
              <p className="text-sm font-black uppercase tracking-widest">Você tirou</p>
              <p className="mt-4 break-words text-4xl font-black uppercase text-red-600 sm:text-6xl">{result}</p>
              <Button className="mt-7" variant="secondary" onClick={() => setHidden(true)}>
                Esconder novamente
              </Button>
            </div>
          ) : (
            <div className="py-5">
              <div className="mx-auto grid size-20 place-items-center border-2 border-black bg-amber-400 text-4xl font-black shadow-[5px_5px_0_#151515]">?</div>
              <h2 className="mt-6 text-xl font-black">Seu amigo secreto ainda está escondido.</h2>
              <Button
                className="mt-6 px-6 py-3"
                disabled={revealMutation.isPending}
                onClick={() => revealMutation.mutate()}
              >
                {result || initiallyRevealed ? 'Rever' : 'Revelar'}
              </Button>
            </div>
          )}
        </section>

        <section className={`${panelClass} mt-8`} aria-labelledby="wall-title">
          <p className="text-xs font-black uppercase tracking-wider text-red-600">Sem nomes, sem pistas</p>
          <h2 id="wall-title" className="mt-2 text-2xl font-black uppercase">Mural anônimo</h2>
          <Form
            className="mt-6"
            onSubmit={messageForm.handleSubmit((data) => createMessageMutation.mutate(data))}
          >
            <Form.Label htmlFor="anonymous-message">Nova mensagem</Form.Label>
            <textarea
              id="anonymous-message"
              className={`${inputClass} mt-2 min-h-28 resize-y`}
              maxLength={500}
              {...messageForm.register('content')}
              aria-invalid={Boolean(messageForm.formState.errors.content)}
              aria-describedby={messageForm.formState.errors.content ? 'message-error' : undefined}
            />
            {messageForm.formState.errors.content && (
              <p id="message-error" className={`${formErrorMessage} mt-2`} role="alert">
                {messageForm.formState.errors.content.message}
              </p>
            )}
            <Form.Button className="mt-4" type="submit" disabled={createMessageMutation.isPending}>
              {createMessageMutation.isPending ? 'Enviando...' : 'Enviar anonimamente'}
            </Form.Button>
          </Form>
          <div className="mt-8 grid gap-3 border-t-2 border-black pt-6">
            {messages.isPending && <p className="text-sm font-bold">Carregando mensagens...</p>}
            {messages.isError && <p className="text-sm font-bold text-red-700" role="alert">Não foi possível carregar o mural.</p>}
            {messages.data?.length === 0 && <p className="text-sm text-black/60">O mural ainda está vazio.</p>}
            {messages.data?.map((message) => (
              <article key={message.id} className="border-2 border-black bg-amber-50 p-4 shadow-[3px_3px_0_#151515]">
                <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
                <time className="mt-3 block text-xs text-black/50" dateTime={message.createdAt}>
                  {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(message.createdAt))}
                </time>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
