import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Button, ButtonLink } from '../components/Button'
import { useAuth } from '../features/auth/auth.queries'
import { groupsKey } from '../features/groups/group.queries'
import { ParticipantExperience } from '../features/participant/ParticipantExperience'
import { getErrorMessage } from '../lib/errors'
import { panelClass } from '../lib/styles'
import { messagesService } from '../services/messages'
import { participantAccessService } from '../services/participant-access'

const accessKey = (token: string) => ['participant-access', token] as const
const messagesKey = (token: string) => ['participant-access', token, 'messages'] as const

export function ParticipantPage() {
  const { token } = useParams()
  if (!token) return <Navigate to="/" replace />
  return <ParticipantContent token={token} />
}

function ParticipantContent({ token }: { token: string }) {
  const queryClient = useQueryClient()
  const { data: user, isPending: authIsPending } = useAuth()
  const access = useQuery({
    queryKey: accessKey(token),
    queryFn: () => participantAccessService.get(token),
    retry: false,
  })
  const claimStartedFor = useRef<string | undefined>(undefined)
  const claim = useMutation({
    mutationFn: () => participantAccessService.claim(token),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: groupsKey })
    },
  })
  const claimAccess = claim.mutate

  useEffect(() => {
    if (
      access.isSuccess &&
      user &&
      claimStartedFor.current !== token &&
      claim.isIdle
    ) {
      claimStartedFor.current = token
      claimAccess()
    }
  }, [access.isSuccess, claim.isIdle, claimAccess, token, user])

  if (access.isPending || authIsPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-green-100 p-6 font-mono">
        <p className="border-2 border-black bg-amber-400 p-4 font-black shadow-[4px_4px_0_#151515]">
          Abrindo convite...
        </p>
      </main>
    )
  }

  if (access.isError) {
    return (
      <main className="grid min-h-dvh place-items-center bg-red-50 p-6 font-mono text-black">
        <div className="max-w-md border-2 border-black bg-white p-7 text-center shadow-[7px_7px_0_#151515]">
          <div className="mx-auto grid size-16 place-items-center border-2 border-black bg-red-600 text-3xl font-black text-white">!</div>
          <h1 className="mt-6 text-2xl font-black uppercase">Convite indisponível</h1>
          <p className="mt-3 text-sm leading-6 text-black/70">
            Este link é inválido, expirou ou foi substituído. Peça um novo convite ao organizador.
          </p>
        </div>
      </main>
    )
  }

  const returnTo = `/s/${encodeURIComponent(token)}`
  const notice = !user ? (
    <aside className={`${panelClass} mb-8 bg-amber-50`} aria-label="Salvar convite na conta">
      <p className="font-black uppercase">Acesse este sorteio pelo dashboard</p>
      <p className="mt-2 text-sm leading-6 text-black/70">
        Entre ou crie uma conta com o mesmo e-mail do convite para não depender mais deste link.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <ButtonLink className="w-full sm:w-auto" to="/login" state={{ returnTo }}>Entrar</ButtonLink>
        <ButtonLink className="w-full sm:w-auto" to="/register" state={{ returnTo }} variant="secondary">Criar conta</ButtonLink>
      </div>
    </aside>
  ) : claim.isPending ? (
    <p className={`${panelClass} mb-8 bg-amber-50 text-sm font-bold`} role="status">
      Salvando este sorteio na sua conta...
    </p>
  ) : claim.isSuccess ? (
    <aside className={`${panelClass} mb-8 bg-white`} role="status">
      <p className="font-black uppercase">Sorteio salvo na sua conta</p>
      <ButtonLink className="mt-4" to="/dashboard" variant="secondary">Ver dashboard</ButtonLink>
    </aside>
  ) : claim.isError ? (
    <aside className={`${panelClass} mb-8 bg-red-50`} role="alert">
      <p className="font-black text-red-700">Não foi possível salvar este sorteio na sua conta.</p>
      <p className="mt-2 text-sm leading-6 text-black/70">
        {getErrorMessage(claim.error, 'Confira se sua conta usa o mesmo e-mail que recebeu o convite.')}
      </p>
      <Button
        className="mt-4"
        variant="secondary"
        onClick={() => {
          claimStartedFor.current = token
          claim.mutate()
        }}
      >
        Tentar novamente
      </Button>
    </aside>
  ) : null

  return (
    <ParticipantExperience
      participantName={access.data.participant.name}
      groupName={access.data.group.name}
      initiallyRevealed={access.data.revealed}
      messagesKey={messagesKey(token)}
      listMessages={() => messagesService.list(token)}
      createMessage={(content) => messagesService.create(token, content)}
      reveal={() => participantAccessService.reveal(token)}
      notice={notice}
      onRevealed={() => {
        queryClient.setQueryData(accessKey(token), {
          ...access.data,
          revealed: true,
        })
      }}
    />
  )
}
