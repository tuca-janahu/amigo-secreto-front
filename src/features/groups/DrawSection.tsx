import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Dialog } from '../../components/Dialog'
import { appToast } from '../../lib/toast'
import { panelClass } from '../../lib/styles'
import { sorteioService } from '../../services/sorteio'
import { groupKey, groupsKey, invitationsKey, participantsKey, restrictionsKey, viabilityKey, viabilityQueryOptions } from './group.queries'

export function DrawSection({ groupId, canViewDraw }: { groupId: string; canViewDraw: boolean }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const viability = useQuery(viabilityQueryOptions(groupId))
  const [confirming, setConfirming] = useState(false)
  const draw = useMutation({
    mutationFn: () => sorteioService.draw(groupId),
    onSuccess: async () => {
      setConfirming(false)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: groupKey(groupId) }),
        queryClient.invalidateQueries({ queryKey: groupsKey }),
        queryClient.invalidateQueries({ queryKey: participantsKey(groupId) }),
        queryClient.invalidateQueries({ queryKey: restrictionsKey(groupId) }),
        queryClient.invalidateQueries({ queryKey: viabilityKey(groupId) }),
        queryClient.invalidateQueries({ queryKey: invitationsKey(groupId) }),
      ])
      appToast.success('Sorteio realizado!', {
        action: canViewDraw
          ? {
              label: 'Ver meu amigo secreto',
              onClick: () => navigate(`/dashboard/groups/${groupId}/participation`),
            }
          : undefined,
        description: 'Os convites já estão sendo preparados.',
        id: `draw-success-${groupId}`,
      })
    },
    onError: () => {
      appToast.error('Não foi possível realizar o sorteio.', {
        id: `draw-error-${groupId}`,
      })
    },
  })
  const state = viability.data?.viable ? { label: 'Pronto para sortear', style: 'bg-green-100 text-green-900' }
    : viability.data?.reason === 'NOT_ENOUGH_PARTICIPANTS' ? { label: 'Participantes insuficientes', style: 'bg-amber-100 text-black' }
    : { label: 'Sorteio não viável', style: 'bg-red-50 text-red-700' }

  return <section className={`${panelClass} bg-amber-400`} aria-labelledby="draw-title">
    <p className="text-xs font-black uppercase tracking-wider">Etapa final</p>
    <h2 id="draw-title" className="mt-2 text-2xl font-black uppercase">Sorteio</h2>
    {viability.isPending ? (
      <p className="mt-5 text-sm font-bold">Verificando viabilidade…</p>
    ) : viability.isError ? (
      <div className="mt-5">
        <p className="text-sm font-bold text-red-800" role="alert">Não foi possível verificar a viabilidade.</p>
        <Button className="mt-3 w-full sm:w-auto" variant="secondary" onClick={() => viability.refetch()}>Tentar novamente</Button>
      </div>
    ) : (
      <p className={`mt-5 inline-block border-2 border-black px-3 py-2 text-sm font-black ${state.style}`}>{state.label}</p>
    )}
    <p className="mt-4 max-w-2xl text-sm leading-6">Ao sortear, a composição do grupo será bloqueada e os convites serão enviados por e-mail. Você nunca verá quem tirou quem.</p>
    <Button className="mt-5 w-full px-5 py-3 sm:w-auto" disabled={!viability.data?.viable || draw.isPending} onClick={() => setConfirming(true)}>Realizar sorteio</Button>

    <Dialog open={confirming} onDismiss={() => { if (!draw.isPending) setConfirming(false) }}>
      <Dialog.Title>Confirmar sorteio?</Dialog.Title>
      <Dialog.Description>O sorteio será gerado. Depois disso, participantes e restrições serão bloqueados, e os convites serão enviados por e-mail.</Dialog.Description>
      <Dialog.Body><p className="mt-3 text-sm font-black">O organizador não verá quem tirou quem.</p></Dialog.Body>
      <Dialog.Actions>
        <Button className="w-full sm:w-auto" variant="secondary" disabled={draw.isPending} onClick={() => setConfirming(false)}>Cancelar</Button>
        <Button className="w-full sm:w-auto" disabled={draw.isPending} onClick={() => draw.mutate()} data-dialog-initial-focus>{draw.isPending ? 'Sorteando…' : 'Confirmar sorteio'}</Button>
      </Dialog.Actions>
    </Dialog>
  </section>
}
