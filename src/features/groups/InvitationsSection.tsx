import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../components/Button'
import { panelClass } from '../../lib/styles'
import { appToast } from '../../lib/toast'
import { invitationsService, type InvitationStatus } from '../../services/invitations'
import { invitationsKey, invitationsQueryOptions } from './group.queries'

const labels: Record<InvitationStatus, string> = {
  PENDING: 'Pendente',
  SENT: 'E-mail enviado',
  FAILED: 'Falha no envio',
  DELIVERED: 'Entregue',
}

export function InvitationsSection({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient()
  const invitations = useQuery(invitationsQueryOptions(groupId))
  const resend = useMutation({
    mutationFn: (participantId: string) => invitationsService.resend(groupId, participantId),
    onSuccess: async ({ status }) => {
      if (status === 'SENT') appToast.success('Convite reenviado.', { id: 'invitation-resend' })
      else appToast.warning('O envio do convite falhou.', { description: 'Tente novamente.', id: 'invitation-resend' })
      await queryClient.invalidateQueries({ queryKey: invitationsKey(groupId) })
    },
    onError: () => appToast.error('Não foi possível reenviar o convite.', { id: 'invitation-resend' }),
  })
  const resendPending = useMutation({
    mutationFn: () => invitationsService.resendPending(groupId),
    onSuccess: async ({ attempted, sent, failed }) => {
      const notify = failed > 0 ? appToast.warning : appToast.success
      notify('Reenvio de convites concluído.', {
        description: `${attempted} tentativa(s): ${sent} enviada(s), ${failed} falha(s).`,
        id: 'invitations-resend-pending',
      })
      await queryClient.invalidateQueries({ queryKey: invitationsKey(groupId) })
    },
    onError: () => appToast.error('Não foi possível reenviar os convites pendentes.', { id: 'invitations-resend-pending' }),
  })

  return <section className={panelClass} aria-labelledby="invitations-title">
    <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-wider text-green-900">Acompanhamento</p>
        <h2 id="invitations-title" className="mt-2 text-2xl font-black uppercase">Status dos convites</h2>
      </div>
      <Button className="w-full sm:w-auto" disabled={resendPending.isPending || resend.isPending} onClick={() => resendPending.mutate()}>{resendPending.isPending ? 'Reenviando…' : 'Reenviar pendentes'}</Button>
    </div>
    <div className="mt-6 grid gap-3">
      {invitations.isPending && <p className="font-bold" role="status">Carregando convites…</p>}
      {invitations.isError && <p className="font-bold text-red-700" role="alert">Não foi possível carregar os convites.</p>}
      {invitations.data?.length === 0 && <p className="text-sm text-black/60">Nenhum convite disponível.</p>}
      {invitations.data?.map((item) => <article key={item.participantId} className="grid min-w-0 gap-3 border-2 border-black bg-gray-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="min-w-0"><h3 className="break-words font-black">{item.name}</h3><p className={`mt-1 text-sm font-bold ${item.status === 'FAILED' ? 'text-red-700' : 'text-black/70'}`}>{labels[item.status]}</p><p className="mt-1 text-xs text-black/60">{item.revealedAt ? 'Já revelou' : 'Ainda não revelou'}</p></div>
        {(item.status === 'PENDING' || item.status === 'FAILED') && <Button className="w-full sm:w-auto" variant="secondary" disabled={resend.isPending || resendPending.isPending} onClick={() => resend.mutate(item.participantId)}>Reenviar</Button>}
      </article>)}
    </div>
  </section>
}
