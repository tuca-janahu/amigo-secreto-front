import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Navigate, useParams } from 'react-router-dom'
import { Button, ButtonLink } from '../components/Button'
import { BackIcon } from '../components/PixelIcons'
import { groupKey, groupQueryOptions, groupsKey } from '../features/groups/group.queries'
import { ParticipantExperience } from '../features/participant/ParticipantExperience'
import { messagesService } from '../services/messages'
import { participantAccessService } from '../services/participant-access'

const groupMessagesKey = (groupId: string) => ['groups', groupId, 'messages'] as const

export function AuthenticatedParticipantPage() {
  const { groupId } = useParams()
  if (!groupId) return <Navigate to="/dashboard" replace />
  return <AuthenticatedParticipantContent groupId={groupId} />
}

function AuthenticatedParticipantContent({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient()
  const group = useQuery(groupQueryOptions(groupId))

  if (group.isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-green-100 p-6 font-mono">
        <p className="border-2 border-black bg-amber-400 p-4 font-black shadow-[4px_4px_0_#151515]">
          Carregando grupo…
        </p>
      </main>
    )
  }

  if (group.isError) {
    return <main className="grid min-h-dvh place-items-center bg-green-100 px-4 py-8 font-mono text-black">
      <section className="w-full max-w-xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_#151515]">
        <h1 className="text-2xl font-black">Não foi possível carregar o grupo</h1>
        <p className="mt-4 text-sm leading-6" role="alert">Verifique sua conexão e tente novamente.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button disabled={group.isFetching} onClick={() => group.refetch()}>{group.isFetching ? 'Atualizando…' : 'Tentar novamente'}</Button>
          <ButtonLink to="/dashboard" variant="secondary">Voltar ao dashboard</ButtonLink>
        </div>
      </section>
    </main>
  }

  if (!group.data.participant) {
    return <Navigate to="/dashboard" replace />
  }

  if (group.data.status !== 'SORTEADO') {
    const cancelled = group.data.status === 'CANCELLED'
    return <main className="grid min-h-dvh place-items-center bg-green-100 px-4 py-8 font-mono text-black">
      <section className="w-full max-w-xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_#151515] sm:p-8">
        <h1 className="text-3xl font-black">{cancelled ? 'Grupo cancelado' : 'Participação confirmada'}</h1>
        <h2 className="mt-5 text-xl font-bold [overflow-wrap:anywhere]">{group.data.name}</h2>
        <p className="mt-4 text-sm leading-6">{cancelled ? 'Este grupo foi cancelado pelo organizador.' : 'Aguardando o organizador realizar o sorteio.'}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {!cancelled && <Button disabled={group.isFetching} onClick={() => group.refetch()}>{group.isFetching ? 'Atualizando…' : 'Atualizar grupo'}</Button>}
          <ButtonLink to="/dashboard" variant="secondary">Voltar ao dashboard</ButtonLink>
        </div>
      </section>
    </main>
  }

  return (
    <ParticipantExperience
      participantName={group.data.participant.name}
      groupName={group.data.name}
      initiallyRevealed={group.data.participant.revealed}
      messagesKey={groupMessagesKey(groupId)}
      listMessages={() => messagesService.listForGroup(groupId)}
      createMessage={(content) => messagesService.createForGroup(groupId, content)}
      reveal={() => participantAccessService.revealLinked(groupId)}
      headerAction={(
        <ButtonLink size="small" variant="secondary" to="/dashboard" icon={<BackIcon />}>
          Dashboard
        </ButtonLink>
      )}
      onRevealed={() => {
        queryClient.setQueryData(groupKey(groupId), {
          ...group.data,
          participant: { ...group.data.participant, revealed: true },
        })
        void queryClient.invalidateQueries({ queryKey: groupsKey })
      }}
    />
  )
}
