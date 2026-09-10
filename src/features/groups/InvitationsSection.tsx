import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '../../components/Button'
import { getErrorMessage } from '../../lib/errors'
import { formErrorMessage, panelClass } from '../../lib/styles'
import { invitationsService, type InvitationStatus } from '../../services/invitations'
import { invitationsKey, invitationsQueryOptions } from './group.queries'

const labels: Record<InvitationStatus, string> = { PENDING: 'Pendente', SENT: 'E-mail enviado', FAILED: 'Falha no envio', DELIVERED: 'Entregue' }

export function InvitationsSection({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient()
  const invitations = useQuery(invitationsQueryOptions(groupId))
  const [feedback, setFeedback] = useState<string>()
  const resend = useMutation({
    mutationFn: (participantId: string) => invitationsService.resend(groupId, participantId),
    onSuccess: async ({ status }) => { setFeedback(status === 'SENT' ? 'Convite reenviado.' : 'O envio falhou. Tente novamente.'); await queryClient.invalidateQueries({ queryKey: invitationsKey(groupId) }) },
  })
  const resendPending = useMutation({
    mutationFn: () => invitationsService.resendPending(groupId),
    onSuccess: async ({ attempted, sent, failed }) => { setFeedback(`${attempted} tentativa(s): ${sent} enviada(s), ${failed} falha(s).`); await queryClient.invalidateQueries({ queryKey: invitationsKey(groupId) }) },
  })
  const error = resend.error ?? resendPending.error

  return <section className={panelClass} aria-labelledby="invitations-title"><div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-xs font-black uppercase tracking-wider text-green-900">Acompanhamento</p><h2 id="invitations-title" className="mt-2 text-2xl font-black uppercase">Status dos convites</h2></div><Button disabled={resendPending.isPending || resend.isPending} onClick={() => resendPending.mutate()}>{resendPending.isPending ? 'Reenviando...' : 'Reenviar pendentes'}</Button></div>
    {feedback && <p className="mt-5 border-2 border-green-900 bg-green-100 p-3 text-sm font-bold" role="status">{feedback}</p>}{error && <p className={`${formErrorMessage} mt-5 text-sm`} role="alert">{getErrorMessage(error, 'Não foi possível reenviar o convite.')}</p>}
    <div className="mt-6 grid gap-3">{invitations.isPending && <p className="font-bold">Carregando convites...</p>}{invitations.isError && <p className="font-bold text-red-700" role="alert">Não foi possível carregar os convites.</p>}{invitations.data?.map((item) => <article key={item.participantId} className="grid gap-3 border-2 border-black bg-gray-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><h3 className="font-black">{item.name}</h3><p className={`mt-1 text-sm font-bold ${item.status === 'FAILED' ? 'text-red-700' : 'text-black/70'}`}>{labels[item.status]}</p><p className="mt-1 text-xs text-black/60">{item.revealedAt ? 'Já revelou' : 'Ainda não revelou'}</p></div>{(item.status === 'PENDING' || item.status === 'FAILED') && <Button variant="secondary" disabled={resend.isPending || resendPending.isPending} onClick={() => resend.mutate(item.participantId)}>Reenviar</Button>}</article>)}</div>
  </section>
}
