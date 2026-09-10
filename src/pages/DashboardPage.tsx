import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { PixelBrand } from '../components/PixelBrand'
import { authQueryKey, useAuth } from '../features/auth/auth.queries'
import { groupsKey, groupsQueryOptions } from '../features/groups/group.queries'
import { groupSchema, type GroupFormData } from '../features/groups/group.schemas'
import { getErrorMessage } from '../lib/errors'
import { inputClass, panelClass, primaryButton, secondaryButton } from '../lib/styles'
import { authService } from '../services/auth'
import { groupsService, type GroupStatus } from '../services/groups'

const statusLabel: Record<GroupStatus, string> = {
  DRAFT: 'Rascunho', READY: 'Pronto', SORTEADO: 'Sorteado', CANCELLED: 'Cancelado',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value))
}

export function DashboardPage() {
  const { data: user } = useAuth()
  const groupsQuery = useQuery(groupsQueryOptions)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isLeaving, setIsLeaving] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema), defaultValues: { name: '' },
  })
  const createGroup = useMutation({
    mutationFn: ({ name }: GroupFormData) => groupsService.create(name),
    onSuccess: async (group) => {
      await queryClient.invalidateQueries({ queryKey: groupsKey })
      reset()
      navigate(`/dashboard/groups/${group.id}`)
    },
  })

  async function handleLogout() {
    setIsLeaving(true)
    try { await authService.logout() } finally {
      queryClient.removeQueries({ queryKey: authQueryKey })
      navigate('/', { replace: true })
    }
  }

  return (
    <main className="min-h-screen bg-amber-100/50 px-5 py-6 font-mono text-black sm:px-8 lg:px-14">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <PixelBrand />
        <button className={secondaryButton} type="button" onClick={handleLogout} disabled={isLeaving}>{isLeaving ? 'Saindo...' : 'Sair'}</button>
      </header>
      <section className="mx-auto max-w-6xl py-12 sm:py-16" aria-labelledby="dashboard-title">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="inline-block border-2 border-black bg-amber-400 px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0_#151515]">Área do organizador</p>
            <h1 id="dashboard-title" className="mt-6 text-4xl leading-none font-black tracking-[-0.07em] sm:text-6xl">Olá, {user?.name?.trim() || 'Jogador'}</h1>
          </div>
          <button className={primaryButton} type="button" onClick={() => setShowCreate((value) => !value)}>+ Novo grupo</button>
        </div>

        {showCreate && (
          <form className={`${panelClass} mt-8 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end`} onSubmit={handleSubmit((data) => createGroup.mutate(data))} noValidate>
            <div>
              <label className="text-xs font-black uppercase" htmlFor="group-name">Nome do grupo</label>
              <input id="group-name" className={`${inputClass} mt-2`} autoFocus {...register('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'group-name-error' : undefined} />
              {errors.name && <p id="group-name-error" className="mt-2 text-xs font-bold text-red-700" role="alert">{errors.name.message}</p>}
            </div>
            <button className={primaryButton} type="submit" disabled={createGroup.isPending}>{createGroup.isPending ? 'Criando...' : 'Criar grupo'}</button>
            {createGroup.isError && <p className="text-sm font-bold text-red-700 sm:col-span-2" role="alert">{getErrorMessage(createGroup.error, 'Não foi possível criar o grupo.')}</p>}
          </form>
        )}

        <div className="mt-10">
          {groupsQuery.isPending && <p className={`${panelClass} font-black`}>Carregando grupos...</p>}
          {groupsQuery.isError && <div className={`${panelClass} bg-red-50`} role="alert"><p className="font-black text-red-700">Não foi possível carregar seus grupos.</p><button className={`${secondaryButton} mt-4`} onClick={() => groupsQuery.refetch()}>Tentar novamente</button></div>}
          {groupsQuery.data?.length === 0 && <div className={panelClass}><h2 className="text-2xl font-black uppercase">Nenhum grupo ainda.</h2><p className="mt-3 text-sm text-black/70">Crie o primeiro grupo para adicionar a turma e preparar o sorteio.</p></div>}
          {groupsQuery.data && groupsQuery.data.length > 0 && (
            <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-label="Seus grupos">
              {groupsQuery.data.map((group) => (
                <article key={group.id} className={panelClass}>
                  <span className={`inline-block border-2 border-black px-2 py-1 text-xs font-black uppercase ${group.status === 'SORTEADO' ? 'bg-green-900 text-white' : 'bg-amber-400'}`}>{statusLabel[group.status]}</span>
                  <h2 className="mt-5 break-words text-2xl font-black">{group.name}</h2>
                  <p className="mt-3 text-xs text-black/60">Criado em {formatDate(group.createdAt)}</p>
                  <Link className={`${primaryButton} mt-6`} to={`/dashboard/groups/${group.id}`}>Abrir grupo</Link>
                </article>
              ))}
            </section>
          )}
        </div>
      </section>
    </main>
  )
}
