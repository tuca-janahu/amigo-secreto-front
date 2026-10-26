import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Navigate, useParams } from 'react-router-dom'
import { ButtonLink } from '../components/Button'
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
          Carregando sorteio...
        </p>
      </main>
    )
  }

  if (group.isError || !group.data.participant) {
    return <Navigate to="/dashboard" replace />
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
