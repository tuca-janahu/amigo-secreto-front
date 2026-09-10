import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '../../components/Button'
import { getErrorMessage } from '../../lib/errors'
import { formErrorMessage, panelClass } from '../../lib/styles'
import { sorteioService } from '../../services/sorteio'
import { groupKey, groupsKey, invitationsKey, participantsKey, restrictionsKey, viabilityKey, viabilityQueryOptions } from './group.queries'

export function DrawSection({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient()
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
    },
  })
  const state = viability.data?.viable ? { label: 'Pronto para sortear', style: 'bg-green-100 text-green-900' }
    : viability.data?.reason === 'NOT_ENOUGH_PARTICIPANTS' ? { label: 'Participantes insuficientes', style: 'bg-amber-100 text-black' }
    : { label: 'Sorteio não viável', style: 'bg-red-50 text-red-700' }

  return <section className={`${panelClass} bg-amber-400`} aria-labelledby="draw-title">
    <p className="text-xs font-black uppercase tracking-wider">Etapa final</p><h2 id="draw-title" className="mt-2 text-2xl font-black uppercase">Sorteio</h2>
    {viability.isPending ? <p className="mt-5 text-sm font-bold">Verificando viabilidade...</p> : viability.isError ? <div className="mt-5"><p className="text-sm font-bold text-red-800" role="alert">Não foi possível verificar a viabilidade.</p><Button className="mt-3" variant="secondary" onClick={() => viability.refetch()}>Tentar novamente</Button></div> : <p className={`mt-5 inline-block border-2 border-black px-3 py-2 text-sm font-black ${state.style}`}>{state.label}</p>}
    <p className="mt-4 max-w-2xl text-sm leading-6">Ao sortear, a composição do grupo será bloqueada e os convites serão enviados por e-mail. Você nunca verá quem tirou quem.</p>
    <Button className="mt-5 px-5 py-3" variant="danger" disabled={!viability.data?.viable || draw.isPending} onClick={() => setConfirming(true)}>Realizar sorteio</Button>
    {draw.isError && <p className={`${formErrorMessage} mt-4 text-sm`} role="alert">{getErrorMessage(draw.error, 'Não foi possível realizar o sorteio.')}</p>}
    {confirming && <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-5" role="presentation"><div className="w-full max-w-lg border-2 border-black bg-white p-6 shadow-[8px_8px_0_#151515]" role="dialog" aria-modal="true" aria-labelledby="confirm-draw-title"><h3 id="confirm-draw-title" className="text-2xl font-black uppercase">Tem certeza?</h3><p className="mt-4 text-sm leading-6">O sorteio será gerado. Depois disso, participantes e restrições serão bloqueados, e os convites serão enviados por e-mail.</p><p className="mt-3 text-sm font-black">O organizador não verá quem tirou quem.</p><div className="mt-6 flex flex-wrap gap-3"><Button variant="secondary" disabled={draw.isPending} onClick={() => setConfirming(false)}>Cancelar</Button><Button disabled={draw.isPending} onClick={() => draw.mutate()}>{draw.isPending ? 'Sorteando...' : 'Confirmar sorteio'}</Button></div></div></div>}
  </section>
}
