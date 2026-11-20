import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Button, ButtonLink } from '../components/Button'
import { PixelBrand } from '../components/PixelIcons'
import { useAuth } from '../features/auth/auth.queries'
import { AdminFilters, type AdminTab } from '../features/admin/AdminFilters'
import { EventResults, GroupResults, OverviewResults, UserResults } from '../features/admin/AdminResults'
import { adminFiltersSchema, defaultFilters, type FilterValues } from '../features/admin/admin.schemas'
import { ApiError } from '../lib/http'
import { adminService } from '../services/admin'

const tabs = { events: 'Eventos', overview: 'Visão geral', users: 'Usuários', groups: 'Grupos' } as const
const descriptions = {
  events: 'Acompanhe quem fez o quê e quando. Os registros mais recentes aparecem primeiro.',
  overview: 'Consulte o uso da plataforma e a atividade no período selecionado.',
  users: 'Contas cadastradas e seus grupos organizados, em todos os períodos.',
  groups: 'Grupos da plataforma e o andamento das participações, em todos os períodos.',
}
export function AdminPage() {
  const { data: user } = useAuth()
  const [search, setSearch] = useSearchParams()
  const rawTab = search.get('tab') ?? 'events'
  const tab: AdminTab = Object.hasOwn(tabs, rawTab) ? rawTab as AdminTab : 'events'
  const parsed = adminFiltersSchema.safeParse({ ...defaultFilters(), ...Object.fromEntries(search) })
  const filters = parsed.success ? parsed.data : defaultFilters() as FilterValues
  const rawPage = Number(search.get('page') ?? 1)
  const page = Number.isInteger(rawPage) && rawPage >= 1 && rawPage <= 1_000_000 ? rawPage : 1
  const base = { retry: false, gcTime: 0, staleTime: 0 }
  const events = useQuery({ ...base, queryKey: ['admin', user?.id, 'events', filters, page], queryFn: ({ signal }) => adminService.events(filters, page, signal), enabled: tab === 'events' })
  const overview = useQuery({ ...base, queryKey: ['admin', user?.id, 'overview', filters.from, filters.to], queryFn: ({ signal }) => adminService.overview(filters, signal), enabled: tab === 'overview' })
  const users = useQuery({ ...base, queryKey: ['admin', user?.id, 'users', filters.q, page], queryFn: ({ signal }) => adminService.users(filters, page, signal), enabled: tab === 'users' })
  const groups = useQuery({ ...base, queryKey: ['admin', user?.id, 'groups', filters.q, filters.status, filters.ownerId, page], queryFn: ({ signal }) => adminService.groups(filters, page, signal), enabled: tab === 'groups' })
  const query = { events, overview, users, groups }[tab]
  const list = tab === 'events' ? events.data : tab === 'users' ? users.data : tab === 'groups' ? groups.data : undefined
  const forbidden = query.error instanceof ApiError && (query.error.status === 403 || query.error.status === 401)
  function apply(values: FilterValues) {
    const params = new URLSearchParams({ tab })
    Object.entries(values).forEach(([key, value]) => { if (value) params.set(key, value) })
    setSearch(params)
  }
  function changePage(next: number) { setSearch(current => { const params = new URLSearchParams(current); params.set('page', String(next)); return params }) }
  return <main className="min-h-dvh bg-amber-100/50 px-4 py-5 pb-28 font-mono text-black sm:px-8 sm:py-6 sm:pb-28 lg:px-14">
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4"><PixelBrand /><ButtonLink to="/dashboard" variant="tertiary">Meus grupos</ButtonLink></header>
    <section className="mx-auto max-w-6xl pt-10 sm:pt-16" aria-labelledby="admin-title">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><span className="inline-block border-2 border-black bg-amber-400 px-3 py-1 text-xs font-black shadow-[3px_3px_0_#151515]">Administração · Somente leitura</span><h1 id="admin-title" className="mt-5 text-4xl font-black tracking-[-0.07em] sm:text-6xl">Auditoria</h1><p className="mt-4 max-w-xl text-sm leading-relaxed text-black/75">Um registro claro da atividade no Amigo Secreto.</p></div><Button variant="secondary" disabled={query.isFetching} onClick={() => void query.refetch()}>{query.isFetching ? 'Atualizando…' : 'Atualizar dados'}</Button></div>
      <nav aria-label="Consultas administrativas" className="mt-9 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">{Object.entries(tabs).map(([key, label]) => <ButtonLink key={key} to={`?${new URLSearchParams({ tab: key, from: filters.from, to: filters.to })}`} variant={tab === key ? 'primary' : 'tertiary'} aria-current={tab === key ? 'page' : undefined}>{label}</ButtonLink>)}</nav>
      <section className="mt-6 min-w-0 border-2 border-black bg-white shadow-[6px_6px_0_#151515]" aria-labelledby="results-title">
        <div className="p-5 sm:p-6"><h2 id="results-title" className="text-xl font-black">{tab === 'events' ? 'Histórico de eventos' : tabs[tab]}</h2><p className="mt-2 text-sm leading-relaxed text-black/70">{descriptions[tab]}</p></div>
        {!forbidden && <AdminFilters key={tab} tab={tab} values={filters} onApply={apply} />}
        {!parsed.success && <p role="status" className="m-5 text-sm">Os filtros do link são inválidos. Exibindo os últimos 30 dias com os filtros padrão.</p>}
        {query.isPending ? <div className="min-h-60 p-6" role="status"><p className="font-bold">Carregando {tabs[tab].toLowerCase()}…</p><div aria-hidden="true" className="mt-6 space-y-4 motion-safe:animate-pulse">{[1, 2, 3].map(key => <div key={key} className="h-10 bg-black/5" />)}</div></div>
          : query.isError ? <div className="p-6" role="alert"><h3 className="font-black">{forbidden ? 'Acesso restrito a administradores' : 'Não foi possível carregar os dados'}</h3><p className="mt-2 text-sm">{forbidden ? 'Sua sessão não tem permissão para esta consulta. Volte aos seus grupos e verifique sua conta.' : 'Tente novamente para consultar os registros.'}</p>{!forbidden && <Button className="mt-5" variant="secondary" onClick={() => void query.refetch()}>Tentar novamente</Button>}</div>
          : <>
            {list && <p className="border-b border-black/20 px-5 py-3 text-xs font-bold" role="status">{list.total.toLocaleString('pt-BR')} {list.total === 1 ? 'registro encontrado' : 'registros encontrados'}</p>}
            {list?.items.length === 0 ? <div className="px-5 py-12"><h3 className="font-black">Nenhum registro encontrado</h3><p className="mt-2 text-sm text-black/70">Ajuste os filtros ou consulte outro período.</p><Button className="mt-5" variant="secondary" onClick={() => apply(defaultFilters() as FilterValues)}>Limpar filtros</Button></div> : <>
              {tab === 'events' && events.data && <EventResults items={events.data.items} />}
              {tab === 'users' && users.data && <UserResults items={users.data.items} />}
              {tab === 'groups' && groups.data && <GroupResults items={groups.data.items} />}
            </>}
            {tab === 'overview' && overview.data && <OverviewResults data={overview.data} />}
            {list && <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-black p-5"><p className="text-xs tabular-nums">Página {page.toLocaleString('pt-BR')} de {Math.max(1, Math.ceil(list.total / list.pageSize)).toLocaleString('pt-BR')}</p><div className="flex gap-3"><Button variant="tertiary" disabled={page <= 1 || query.isFetching} onClick={() => changePage(page - 1)}>Anterior</Button><Button variant="tertiary" disabled={page * list.pageSize >= list.total || query.isFetching || page >= 1_000_000} onClick={() => changePage(page + 1)}>Próxima</Button></div></div>}
          </>}
      </section>
      {tab === 'events' && <p className="mt-5 max-w-3xl text-xs leading-relaxed text-black/65">O histórico começa com a implantação da auditoria. Nomes refletem o momento da ação e são preservados após renomeações ou exclusões. Datas e horários de Brasília.</p>}
    </section>
  </main>
}
