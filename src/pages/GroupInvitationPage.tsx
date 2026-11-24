import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, ButtonLink } from '../components/Button'
import { PixelBrand } from '../components/PixelIcons'
import { authQueryKey, useAuth } from '../features/auth/auth.queries'
import { invitationErrorMessage, isInvitationUnavailable } from '../features/groups/group-invitations.errors'
import { publicInvitationQueryOptions } from '../features/groups/group-invitations.queries'
import { groupsKey } from '../features/groups/group.queries'
import { ApiError } from '../lib/http'
import { panelClass } from '../lib/styles'
import { groupInvitationsService } from '../services/group-invitations'

export function GroupInvitationPage() {
  const { token = '' } = useParams()
  return <GroupInvitationContent key={token} token={token} />
}

function GroupInvitationContent({ token }: { token: string }) {
  const auth = useAuth()
  const invitation = useQuery(publicInvitationQueryOptions(token))
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const submitting = useRef(false)
  const returnTo = `/invite/${encodeURIComponent(token)}`
  const join = useMutation({
    retry: false,
    mutationFn: () => groupInvitationsService.join(token),
    onSuccess: async ({ groupId }) => {
      await queryClient.invalidateQueries({ queryKey: groupsKey })
      navigate(`/dashboard/groups/${groupId}/participation`, { replace: true })
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        queryClient.removeQueries({ queryKey: authQueryKey })
        navigate('/login', { replace: true, state: { returnTo } })
      }
    },
    onSettled: () => { submitting.current = false },
  })
  const error = join.error ?? invitation.error
  const unavailable = isInvitationUnavailable(error)
  const sessionError = auth.isError && !(auth.error instanceof ApiError && auth.error.status === 401)

  function confirmParticipation() {
    if (submitting.current || join.isSuccess) return
    submitting.current = true
    join.mutate()
  }

  return <main className="min-h-dvh bg-amber-100/50 px-4 py-6 font-mono text-black sm:px-8 sm:py-10">
    <header className="mx-auto max-w-2xl"><PixelBrand /></header>
    <section className={`${panelClass} mx-auto mt-10 max-w-2xl sm:mt-16`} aria-labelledby="invitation-title">
      <h1 id="invitation-title" className="text-3xl font-black tracking-tight sm:text-4xl">{unavailable ? 'Convite indisponível' : 'Você recebeu um convite'}</h1>
      {invitation.isPending && <p className="mt-6 font-bold" role="status">Carregando convite…</p>}
      {error && <p className="mt-6 border-2 border-red-700 bg-red-50 p-4 text-sm leading-6 text-red-800" role="alert">{invitationErrorMessage(error)}</p>}
      {invitation.isError && !unavailable && <Button className="mt-5" disabled={invitation.isFetching} onClick={() => invitation.refetch()}>Tentar novamente</Button>}
      {invitation.isSuccess && !unavailable && <>
        <p className="mt-6 text-sm text-black/70">Prepare-se para o amigo secreto do grupo</p>
        <h2 className="mt-2 text-3xl font-black leading-tight [overflow-wrap:anywhere]">{invitation.data.group.name}</h2>
        <p className="mt-5 text-sm leading-6 text-black/70">A participação só será confirmada quando você escolher participar abaixo.</p>
        {auth.isPending ? <p className="mt-6 font-bold" role="status">Verificando sessão…</p> : sessionError ? <div className="mt-6">
          <p role="alert" className="text-sm text-red-700">Não foi possível verificar sua sessão. Tente novamente.</p>
          <Button className="mt-4" disabled={auth.isFetching} onClick={() => auth.refetch()}>Verificar sessão</Button>
        </div> : auth.data ? <div className="mt-6 border-t-2 border-black pt-6">
          <p className="text-sm leading-6 [overflow-wrap:anywhere]">Você vai participar como <strong>{auth.data.name}</strong><br />{auth.data.email}</p>
          <Button className="mt-5 w-full sm:w-auto" disabled={join.isPending || join.isSuccess} onClick={confirmParticipation}>{join.isPending || join.isSuccess ? 'Confirmando participação…' : 'Participar do grupo'}</Button>
        </div> : <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/login" state={{ returnTo }}>Entrar para participar</ButtonLink>
          <ButtonLink to="/register" state={{ returnTo }} variant="secondary">Criar conta</ButtonLink>
        </div>}
      </>}
      {unavailable && <ButtonLink className="mt-6" to={auth.data ? '/dashboard' : '/'} variant="secondary">{auth.data ? 'Voltar ao dashboard' : 'Voltar ao início'}</ButtonLink>}
    </section>
  </main>
}
