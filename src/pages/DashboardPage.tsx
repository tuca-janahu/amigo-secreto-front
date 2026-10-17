import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  PixelBrand,
  DeleteIcon,
  PlusIcon,
  MinusIcon,
  ExitIcon,
  SettingsIcon,
} from '../components/PixelIcons'
import { Button, ButtonLink } from '../components/Button'
import { appToast } from '../lib/toast'
import { Form } from '../components/Form'
import { authQueryKey, useAuth } from '../features/auth/auth.queries'
import { DeleteGroupModal } from '../features/groups/DeleteGroupModal'
import { getGroupCardActions } from '../features/groups/group-access'
import { groupsKey, groupsQueryOptions } from '../features/groups/group.queries'
import { groupSchema, type GroupFormData } from '../features/groups/group.schemas'
import { formErrorMessage, panelClass } from '../lib/styles'
import { authService } from '../services/auth'
import { groupsService, type Group, type GroupStatus } from '../services/groups'

const statusLabel: Record<GroupStatus, string> = {
  DRAFT: 'Rascunho', READY: 'Pronto', SORTEADO: 'Sorteado', CANCELLED: 'Cancelado',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value))
}

export function DashboardPage() {
  const { data: user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isLeaving, setIsLeaving] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null)
  const syncStarted = useRef(false)
  const { register, handleSubmit, reset, setFocus, formState: { errors } } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema), defaultValues: { name: '' },
  })

  useEffect(() => {
    if (showCreate) setFocus('name')
  }, [setFocus, showCreate])

  const createGroup = useMutation({
    mutationFn: ({ name }: GroupFormData) => groupsService.create(name),
    onSuccess: async (group) => {
      await queryClient.invalidateQueries({ queryKey: groupsKey })
      reset()
      navigate(`/dashboard/groups/${group.id}`)
    },
    onError: () => {
      appToast.error('Não foi possível criar o grupo.', {
        id: 'create-group-error',
      })
    },
  })
  const syncParticipations = useMutation({
    mutationFn: groupsService.syncOwnerParticipations,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: groupsKey })
    },
  })
  const groupsQuery = useQuery({
    ...groupsQueryOptions,
    enabled: syncParticipations.isSuccess || syncParticipations.isError,
  })

  useEffect(() => {
    if (user && !syncStarted.current) {
      syncStarted.current = true
      syncParticipations.mutate()
    }
  }, [syncParticipations, user])

  const deleteGroup = useMutation({
    mutationFn: (groupId: string) => groupsService.remove(groupId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: groupsKey })
      setGroupToDelete(null)
    },
    onError: () => {
      appToast.error('Não foi possível excluir o grupo.', {
        id: 'delete-group-error',
      })
    },
  })

  async function handleLogout() {
    setIsLeaving(true)
    try {
      await authService.logout()
    } catch {
      appToast.error('Não foi possível encerrar a sessão no servidor.', {
        description: 'Você saiu deste dispositivo mesmo assim.',
        id: 'logout-error',
      })
    } finally {
      queryClient.removeQueries({ queryKey: authQueryKey })
      navigate('/', { replace: true })
    }
  }

  return (
    <main className="min-h-screen bg-amber-100/50 px-5 py-6 font-mono text-black sm:px-8 lg:px-14">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <PixelBrand />
        <Button variant="exit" icon={<ExitIcon />} onClick={handleLogout} disabled={isLeaving}>{isLeaving ? 'Saindo...' : 'Sair'}</Button>
      </header>
      <section className="mx-auto max-w-6xl py-12 sm:py-16" aria-labelledby="dashboard-title">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="inline-block border-2 border-black bg-amber-400 px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0_#151515]">Seus grupos e sorteios</p>
            <h1 id="dashboard-title" className="mt-6 text-4xl leading-none font-black tracking-[-0.07em] sm:text-6xl">Olá, {user?.name?.trim() || 'Jogador'}</h1>
          </div>
          <Button
            aria-controls="create-group-form"
            aria-expanded={showCreate}
            icon={showCreate ? <MinusIcon /> : <PlusIcon />}
            onClick={() => setShowCreate((value) => !value)}
          >
            {showCreate ? 'Fechar formulário' : 'Novo grupo'}
          </Button>
        </div>

        <div
          id="create-group-form"
          className={`grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-out motion-reduce:transition-none ${showCreate ? 'mt-8 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`}
          aria-hidden={!showCreate}
          inert={!showCreate}
        >
          <div className="min-h-0 overflow-hidden pr-1.5 pb-1.5">
            <Form className={`${panelClass} grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end`} onSubmit={handleSubmit((data) => createGroup.mutate(data))}>
              <div>
                <Form.Label htmlFor="group-name">Nome do grupo</Form.Label>
                <Form.Input id="group-name" className="mt-2" {...register('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'group-name-error' : undefined} />
                {errors.name && <p id="group-name-error" className={`${formErrorMessage} mt-2`} role="alert">{errors.name.message}</p>}
              </div>
              <Form.Button type="submit" disabled={createGroup.isPending}>{createGroup.isPending ? 'Criando...' : 'Criar grupo'}</Form.Button>
            </Form>
          </div>
        </div>

        <div className="mt-10">
          {syncParticipations.isError && (
            <div className={`${panelClass} mb-5 bg-amber-50`} role="alert">
              <p className="font-black">Não foi possível atualizar suas participações.</p>
              <p className="mt-2 text-sm text-black/70">
                Seus grupos continuam disponíveis, mas algum acesso ao sorteio pode não aparecer.
              </p>
              <Button
                className="mt-4"
                variant="secondary"
                disabled={syncParticipations.isPending}
                onClick={() => syncParticipations.mutate()}
              >
                Tentar novamente
              </Button>
            </div>
          )}
          {groupsQuery.isPending && <p className={`${panelClass} font-black`}>Carregando grupos...</p>}
          {groupsQuery.isError && <div className={`${panelClass} bg-red-50`} role="alert"><p className="font-black text-red-700">Não foi possível carregar seus grupos.</p><Button className="mt-4" onClick={() => groupsQuery.refetch()}>Tentar novamente</Button></div>}
          {groupsQuery.data?.length === 0 && <div className={panelClass}><h2 className="text-2xl font-black uppercase">Nenhum grupo ainda.</h2><p className="mt-3 text-sm text-black/70">Crie um grupo ou abra o convite recebido por e-mail para vinculá-lo à sua conta.</p></div>}
          {groupsQuery.data && groupsQuery.data.length > 0 && (
            <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-label="Seus grupos">
              {groupsQuery.data.map((group) => {
                const actions = getGroupCardActions(group)

                return <article key={group.id} className={panelClass}>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-block border-2 border-black px-2 py-1 text-xs font-black uppercase ${group.status === 'SORTEADO' ? 'bg-green-900 text-white' : 'bg-amber-400'}`}>{statusLabel[group.status]}</span>
                    {actions.canManage && <span className="inline-block border-2 border-black bg-white px-2 py-1 text-xs font-black uppercase">Organizador</span>}
                    {actions.canViewDraw && <span className="inline-block border-2 border-black bg-green-100 px-2 py-1 text-xs font-black uppercase">Participante</span>}
                  </div>
                  <h2 className="mt-5 break-words text-2xl font-black">{group.name}</h2>
                  <p className="mt-3 text-xs text-black/60">Criado em {formatDate(group.createdAt)}</p>
                  <div className="mt-6 flex items-stretch gap-2">
                    {actions.canViewDraw && (
                      <ButtonLink
                        className="h-14 min-w-0 flex-1"
                        to={`/dashboard/groups/${group.id}/participation`}
                      >
                        Ver meu sorteio
                      </ButtonLink>
                    )}

                    {actions.manageIconOnly && (
                      <ButtonLink
                        className="h-14 w-14 shrink-0 px-0 py-0"
                        variant="secondary"
                        to={`/dashboard/groups/${group.id}`}
                        aria-label={`Gerenciar sorteio ${group.name}`}
                        title="Gerenciar sorteio"
                      >
                        <SettingsIcon />
                      </ButtonLink>
                    )}

                    {actions.canManage && !actions.manageIconOnly && (
                      <ButtonLink
                        className="h-14 min-w-0 flex-1"
                        variant="secondary"
                        to={`/dashboard/groups/${group.id}`}
                        icon={<SettingsIcon />}
                      >
                        Gerenciar grupo
                      </ButtonLink>
                    )}

                    {actions.canManage && group.status === 'DRAFT' && (
                      <Button
                        className="h-14 w-14 shrink-0 px-0 py-0"
                        variant="danger"
                        aria-label={`Excluir grupo ${group.name}`}
                        title="Excluir grupo"
                        onClick={() => {
                          deleteGroup.reset()
                          setGroupToDelete(group)
                        }}
                      >
                        <DeleteIcon />
                      </Button>
                    )}
                  </div>
                </article>
              })}
            </section>
          )}
        </div>
      </section>
      <DeleteGroupModal
        groupName={groupToDelete?.name ?? ''}
        isOpen={groupToDelete !== null}
        isDeleting={deleteGroup.isPending}
        onCancel={() => setGroupToDelete(null)}
        onConfirm={() => {
          if (groupToDelete) deleteGroup.mutate(groupToDelete.id)
        }}
      />
    </main>
  )
}
