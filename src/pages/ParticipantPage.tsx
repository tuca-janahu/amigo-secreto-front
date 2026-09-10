import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useParams } from 'react-router-dom'
import { PixelBrand } from '../components/PixelBrand'
import { Button } from '../components/Button'
import { Form } from '../components/Form'
import { messageSchema, type MessageFormData } from '../features/participant/participant.schemas'
import { getErrorMessage } from '../lib/errors'
import { formErrorMessage, inputClass, panelClass } from '../lib/styles'
import { messagesService } from '../services/messages'
import { participantAccessService } from '../services/participant-access'

const accessKey = (token: string) => ['participant-access', token] as const
const messagesKey = (token: string) => ['participant-access', token, 'messages'] as const
const delay = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export function ParticipantPage() {
  const { token } = useParams()
  if (!token) return <Navigate to="/" replace />
  return <ParticipantContent token={token} />
}

function ParticipantContent({ token }: { token: string }) {
  const queryClient = useQueryClient()
  const access = useQuery({ queryKey: accessKey(token), queryFn: () => participantAccessService.get(token), retry: false })
  const messages = useQuery({ queryKey: messagesKey(token), queryFn: () => messagesService.list(token), enabled: access.isSuccess, retry: false })
  const [result, setResult] = useState<string>()
  const [hidden, setHidden] = useState(false)
  const messageForm = useForm<MessageFormData>({ resolver: zodResolver(messageSchema), defaultValues: { content: '' } })
  const reveal = useMutation({
    mutationFn: async () => {
      const [response] = await Promise.all([participantAccessService.reveal(token), delay(1200)])
      return response
    },
    onSuccess: ({ result: revealedResult }) => { setResult(revealedResult.name); setHidden(false); queryClient.setQueryData(accessKey(token), (current: typeof access.data) => current ? { ...current, revealed: true } : current) },
  })
  const createMessage = useMutation({
    mutationFn: ({ content }: MessageFormData) => messagesService.create(token, content),
    onSuccess: async () => { messageForm.reset(); await queryClient.invalidateQueries({ queryKey: messagesKey(token) }) },
  })

  if (access.isPending) return <main className="grid min-h-screen place-items-center bg-green-100 p-6 font-mono"><p className="border-2 border-black bg-amber-400 p-4 font-black shadow-[4px_4px_0_#151515]">Abrindo convite...</p></main>
  if (access.isError) return <main className="grid min-h-screen place-items-center bg-red-50 p-6 font-mono text-black"><div className="max-w-md border-2 border-black bg-white p-7 text-center shadow-[7px_7px_0_#151515]"><div className="mx-auto grid size-16 place-items-center border-2 border-black bg-red-600 text-3xl font-black text-white">!</div><h1 className="mt-6 text-2xl font-black uppercase">Convite indisponível</h1><p className="mt-3 text-sm leading-6 text-black/70">Este link é inválido, expirou ou foi substituído. Peça um novo convite ao organizador.</p></div></main>

  const showResult = Boolean(result) && !hidden
  return <main className="min-h-screen bg-green-100 px-4 py-5 font-mono text-black sm:px-8 sm:py-8">
    <header className="mx-auto max-w-3xl"><PixelBrand /></header>
    <div className="mx-auto max-w-3xl py-8 sm:py-12">
      <section className="border-2 border-black bg-green-900 p-5 text-white shadow-[8px_8px_0_#151515] sm:p-9" aria-labelledby="participant-title"><p className="text-xs font-black uppercase tracking-wider text-amber-300">{access.data.group.name}</p><h1 id="participant-title" className="mt-4 text-3xl leading-none font-black tracking-[-0.06em] sm:text-5xl">Oi, {access.data.participant.name}!</h1><p className="mt-4 text-sm leading-6 text-white/80">Seu amigo secreto está protegido e só aparece quando você pedir.</p></section>

      <section className={`${panelClass} mt-8 text-center`} aria-live="polite">
        {reveal.isPending ? <div className="reveal-shake py-8"><div className="mx-auto grid size-24 place-items-center border-2 border-black bg-red-600 text-5xl font-black text-white shadow-[5px_5px_0_#151515]">?</div><p className="mt-6 font-black uppercase tracking-wider">Misturando os nomes...</p></div> : showResult ? <div className="py-5"><p className="text-sm font-black uppercase tracking-widest">Você tirou</p><p className="mt-4 break-words text-4xl font-black uppercase text-red-600 sm:text-6xl">{result}</p><Button className="mt-7" variant="secondary" onClick={() => setHidden(true)}>Esconder novamente</Button></div> : <div className="py-5"><div className="mx-auto grid size-20 place-items-center border-2 border-black bg-amber-400 text-4xl font-black shadow-[5px_5px_0_#151515]">?</div><h2 className="mt-6 text-xl font-black">Seu amigo secreto ainda está escondido.</h2><Button className="mt-6 px-6 py-3" disabled={reveal.isPending} onClick={() => reveal.mutate()}>{result || access.data.revealed ? 'Rever' : 'Revelar'}</Button></div>}
        {reveal.isError && <p className={`${formErrorMessage} mt-4 text-sm`} role="alert">{getErrorMessage(reveal.error, 'Não foi possível revelar. Tente novamente.')}</p>}
      </section>

      <section className={`${panelClass} mt-8`} aria-labelledby="wall-title"><p className="text-xs font-black uppercase tracking-wider text-red-600">Sem nomes, sem pistas</p><h2 id="wall-title" className="mt-2 text-2xl font-black uppercase">Mural anônimo</h2><Form className="mt-6" onSubmit={messageForm.handleSubmit((data) => createMessage.mutate(data))}><Form.Label htmlFor="anonymous-message">Nova mensagem</Form.Label><textarea id="anonymous-message" className={`${inputClass} mt-2 min-h-28 resize-y`} maxLength={500} {...messageForm.register('content')} aria-invalid={Boolean(messageForm.formState.errors.content)} aria-describedby={messageForm.formState.errors.content ? 'message-error' : undefined} />{messageForm.formState.errors.content && <p id="message-error" className={`${formErrorMessage} mt-2`} role="alert">{messageForm.formState.errors.content.message}</p>}{createMessage.isError && <p className={`${formErrorMessage} mt-3 text-sm`} role="alert">{getErrorMessage(createMessage.error, 'Não foi possível publicar a mensagem.')}</p>}<Form.Button className="mt-4" type="submit" disabled={createMessage.isPending}>{createMessage.isPending ? 'Enviando...' : 'Enviar anonimamente'}</Form.Button></Form>
        <div className="mt-8 grid gap-3 border-t-2 border-black pt-6">{messages.isPending && <p className="text-sm font-bold">Carregando mensagens...</p>}{messages.isError && <p className="text-sm font-bold text-red-700" role="alert">Não foi possível carregar o mural.</p>}{messages.data?.length === 0 && <p className="text-sm text-black/60">O mural ainda está vazio.</p>}{messages.data?.map((message) => <article key={message.id} className="border-2 border-black bg-amber-50 p-4 shadow-[3px_3px_0_#151515]"><p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p><time className="mt-3 block text-xs text-black/50" dateTime={message.createdAt}>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(message.createdAt))}</time></article>)}</div>
      </section>
    </div>
  </main>
}
