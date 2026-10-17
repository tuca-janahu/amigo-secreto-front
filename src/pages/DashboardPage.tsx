import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PixelBrand, PlusIcon, MinusIcon, ExitIcon } from '../components/PixelIcons'
import { Button } from '../components/Button'
import { appToast } from '../lib/toast'
import { Form } from '../components/Form'
import { authQueryKey, useAuth } from '../features/auth/auth.queries'
import { DashboardFilters, DrawPeriodFilters } from '../features/groups/DashboardFilters'
import { DashboardGroupCard } from '../features/groups/DashboardGroupCard'
import { DeleteGroupModal } from '../features/groups/DeleteGroupModal'
import {
  selectDashboardGroups,
  type DashboardPeriodFilter,
  type DashboardRoleFilter,
  type DashboardSortOrder,
} from '../features/groups/dashboard-groups'
import { groupsKey, groupsQueryOptions } from '../features/groups/group.queries'
import { groupSchema, type GroupFormData } from '../features/groups/group.schemas'
import { formErrorMessage, panelClass } from '../lib/styles'
import { authService } from '../services/auth'
import { groupsService, type AccessibleGroup } from '../services/groups'

const roleFilters: DashboardRoleFilter[] = ['ALL', 'OWNER', 'PARTICIPANT']
const sortOrders: DashboardSortOrder[] = ['DESC', 'ASC']
const periodFilters: DashboardPeriodFilter[] = [
  'ALL', 'TODAY', 'YESTERDAY', 'LAST_7_DAYS', 'LAST_30_DAYS', 'OLDER',
]

function validParam<T extends string>(value: string | null, options: T[], fallback: T) {
  return options.includes(value as T) ? (value as T) : fallback
}

function SectionEmptyState({ children, canClear, onClear }: {
  children: string
  canClear: boolean
  onClear: () => void
}) {
  return (
    <div className="border-2 border-dashed border-black bg-white/60 p-5 sm:p-6">
      <p className="text-sm font-bold text-black/70">{children}</p>
      {canClear && <Button className="mt-4 min-h-11" size="small" variant="secondary" onClick={onClear}>Limpar filtros</Button>}
    </div>
  )
}

export function DashboardPage() {
  const { data: user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isLeaving, setIsLeaving] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<AccessibleGroup | null>(null)
  const syncStarted = useRef(false)
  const { register, handleSubmit, reset, setFocus, formState: { errors } } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema), defaultValues: { name: '' },
  })

  const query = searchParams.get('q') ?? ''
  const role = validParam(searchParams.get('role'), roleFilters, 'ALL')
  const sortOrder = validParam(searchParams.get('order'), sortOrders, 'DESC')
  const period = validParam(searchParams.get('period'), periodFilters, 'ALL')
  const deferredQuery = useDeferredValue(query)
  const hasGlobalFilters = Boolean(query) || role !== 'ALL' || sortOrder !== 'DESC'
  const hasAnyFilters = hasGlobalFilters || period !== 'ALL'

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
    onError: () => appToast.error('Não foi possível criar o grupo.', { id: 'create-group-error' }),
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
      appToast.success('Grupo excluído.', { id: 'delete-group' })
    },
    onError: () => appToast.error('Não foi possível excluir o grupo.', { id: 'delete-group' }),
  })

  const visibleGroups = useMemo(
    () => selectDashboardGroups(groupsQuery.data ?? [], {
      query: deferredQuery,
      role,
      sortOrder,
      period,
    }),
    [deferredQuery, groupsQuery.data, period, role, sortOrder],
  )

  function updateFilter(name: string, value: string, defaultValue: string) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (!value || value === defaultValue) next.delete(name)
      else next.set(name, value)
      return next
    }, { replace: true })
  }

  function clearGlobalFilters() {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('q')
      next.delete('role')
      next.delete('order')
      return next
    }, { replace: true })
  }

  function clearAllFilters() {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete('q')
      next.delete('role')
      next.delete('order')
      next.delete('period')
      return next
    }, { replace: true })
  }

  function prepareDelete(group: AccessibleGroup) {
    deleteGroup.reset()
    setGroupToDelete(group)
  }

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
        <Button variant="exit" icon={<ExitIcon />} onClick={handleLogout} disabled={isLeaving}>
          {isLeaving ? 'Saindo…' : 'Sair'}
        </Button>
      </header>

      <section className="mx-auto max-w-6xl py-12 sm:py-16" aria-labelledby="dashboard-title">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="inline-block border-2 border-black bg-amber-400 px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0_#151515]">Seus grupos e sorteios</p>
            <h1 id="dashboard-title" className="mt-6 text-4xl leading-none font-black tracking-[-0.07em] text-balance sm:text-6xl">
              Olá, {user?.name?.trim() || 'Jogador'}
            </h1>
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
                <Form.Input id="group-name" className="mt-2" autoComplete="off" {...register('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'group-name-error' : undefined} />
                {errors.name && <p id="group-name-error" className={`${formErrorMessage} mt-2`} role="alert">{errors.name.message}</p>}
              </div>
              <Form.Button type="submit" disabled={createGroup.isPending}>{createGroup.isPending ? 'Criando…' : 'Criar grupo'}</Form.Button>
            </Form>
          </div>
        </div>

        <div className="mt-10">
          {syncParticipations.isError && (
            <div className={`${panelClass} mb-5 bg-amber-50`} role="alert">
              <p className="font-black">Não foi possível atualizar suas participações.</p>
              <p className="mt-2 text-sm text-black/70">Seus grupos continuam disponíveis, mas algum acesso ao sorteio pode não aparecer.</p>
              <Button className="mt-4" variant="secondary" disabled={syncParticipations.isPending} onClick={() => syncParticipations.mutate()}>Tentar novamente</Button>
            </div>
          )}
          {groupsQuery.isPending && <div className={`${panelClass} font-black`} role="status">Carregando grupos…</div>}
          {groupsQuery.isError && (
            <div className={`${panelClass} bg-red-50`} role="alert">
              <p className="font-black text-red-700">Não foi possível carregar seus grupos.</p>
              <Button className="mt-4" onClick={() => groupsQuery.refetch()}>Tentar novamente</Button>
            </div>
          )}
          {groupsQuery.data?.length === 0 && (
            <div className={panelClass}>
              <h2 className="text-2xl font-black uppercase">Nenhum grupo ainda.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-black/70">Crie um grupo ou abra o convite recebido por e-mail para vinculá-lo à sua conta.</p>
            </div>
          )}

          {groupsQuery.data && groupsQuery.data.length > 0 && (
            <>
              <DashboardFilters
                query={query}
                role={role}
                sortOrder={sortOrder}
                showFilters={showFilters}
                hasActiveFilters={hasAnyFilters}
                onQueryChange={(value) => updateFilter('q', value, '')}
                onRoleChange={(value) => updateFilter('role', value, 'ALL')}
                onSortOrderChange={(value) => updateFilter('order', value, 'DESC')}
                onToggleFilters={() => setShowFilters((value) => !value)}
                onClear={clearAllFilters}
              />
              <p className="sr-only" aria-live="polite">
                {visibleGroups.pending.length + visibleGroups.drawn.length + visibleGroups.cancelled.length}{' '}
                {visibleGroups.pending.length + visibleGroups.drawn.length + visibleGroups.cancelled.length === 1 ? 'grupo encontrado.' : 'grupos encontrados.'}
              </p>

              <section className="mt-12" aria-labelledby="pending-groups-title">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b-2 border-black pb-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-green-900">Próximos passos</p>
                    <h2 id="pending-groups-title" className="mt-1 text-2xl font-black uppercase sm:text-3xl">Aguardando sorteio</h2>
                  </div>
                  <span className="border-2 border-black bg-amber-400 px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0_#151515]">
                    {visibleGroups.pending.length} {visibleGroups.pending.length === 1 ? 'grupo' : 'grupos'}
                  </span>
                </div>
                {visibleGroups.pending.length > 0 ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {visibleGroups.pending.map((group) => <DashboardGroupCard key={group.id} group={group} onDelete={prepareDelete} />)}
                  </div>
                ) : (
                  <SectionEmptyState canClear={hasGlobalFilters} onClear={clearGlobalFilters}>
                    {hasGlobalFilters ? 'Nenhum grupo aguardando sorteio corresponde aos filtros atuais.' : 'Nenhum grupo aguardando sorteio. Tudo em dia por aqui.'}
                  </SectionEmptyState>
                )}
              </section>

              <section className="mt-14" aria-labelledby="drawn-groups-title">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b-2 border-black pb-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-green-900">Histórico</p>
                    <h2 id="drawn-groups-title" className="mt-1 text-2xl font-black uppercase sm:text-3xl">Sorteados</h2>
                  </div>
                  <span className="border-2 border-black bg-green-900 px-3 py-1 text-xs font-black uppercase text-white shadow-[2px_2px_0_#151515]">
                    {visibleGroups.drawn.length} {visibleGroups.drawn.length === 1 ? 'grupo' : 'grupos'}
                  </span>
                </div>
                <div className="mb-6"><DrawPeriodFilters value={period} onChange={(value) => updateFilter('period', value, 'ALL')} /></div>
                {visibleGroups.drawn.length > 0 ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {visibleGroups.drawn.map((group) => <DashboardGroupCard key={group.id} group={group} onDelete={prepareDelete} />)}
                  </div>
                ) : (
                  <SectionEmptyState canClear={hasAnyFilters} onClear={clearAllFilters}>
                    {hasAnyFilters ? 'Nenhum grupo sorteado corresponde aos filtros atuais.' : 'Seus grupos sorteados aparecerão aqui para consulta.'}
                  </SectionEmptyState>
                )}
              </section>

              {visibleGroups.cancelled.length > 0 && (
                <details className="mt-12 border-2 border-black bg-white shadow-[5px_5px_0_#151515]">
                  <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 px-5 py-3 font-black uppercase focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-black">
                    <span>Cancelados</span>
                    <span className="border-2 border-black bg-gray-200 px-2 py-1 text-xs">{visibleGroups.cancelled.length}</span>
                  </summary>
                  <div className="grid gap-5 border-t-2 border-black bg-amber-50 p-5 md:grid-cols-2 xl:grid-cols-3">
                    {visibleGroups.cancelled.map((group) => <DashboardGroupCard key={group.id} group={group} onDelete={prepareDelete} />)}
                  </div>
                </details>
              )}
            </>
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
