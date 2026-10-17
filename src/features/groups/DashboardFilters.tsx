import { Button } from '../../components/Button'
import { CancelIcon, ChevronDownIcon, FilterIcon, SearchIcon, SortIcon } from '../../components/PixelIcons'
import type {
  DashboardPeriodFilter,
  DashboardRoleFilter,
  DashboardSortOrder,
} from './dashboard-groups'

type DashboardFiltersProps = {
  query: string
  role: DashboardRoleFilter
  sortOrder: DashboardSortOrder
  showFilters: boolean
  hasActiveFilters: boolean
  onQueryChange: (value: string) => void
  onRoleChange: (value: DashboardRoleFilter) => void
  onSortOrderChange: (value: DashboardSortOrder) => void
  onToggleFilters: () => void
  onClear: () => void
}

const selectClass =
  'h-12 w-full appearance-none border-2 border-black bg-white py-2 pr-11 pl-3 text-sm font-bold text-black shadow-[3px_3px_0_#151515] outline-none focus-visible:ring-3 focus-visible:ring-green-900'

export function DashboardFilters({
  query,
  role,
  sortOrder,
  showFilters,
  hasActiveFilters,
  onQueryChange,
  onRoleChange,
  onSortOrderChange,
  onToggleFilters,
  onClear,
}: DashboardFiltersProps) {
  return (
    <section className="border-2 border-black bg-amber-50 p-4 shadow-[5px_5px_0_#151515] sm:p-5" aria-labelledby="dashboard-filters-title">
      <div className="flex items-center justify-between gap-3">
        <h2 id="dashboard-filters-title" className="text-sm font-black uppercase tracking-wider">
          Encontre seus grupos
        </h2>
        <Button
          className="min-h-11 sm:hidden"
          size="small"
          variant="secondary"
          icon={<FilterIcon />}
          aria-controls="dashboard-filter-options"
          aria-expanded={showFilters}
          onClick={onToggleFilters}
        >
          Filtros{hasActiveFilters ? ' ativos' : ''}
        </Button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem_15rem_auto] lg:items-end">
        <label className="block min-w-0">
          <span className="text-xs font-black uppercase">Buscar por nome</span>
          <span className="relative mt-2 block">
            <span className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2" aria-hidden="true">
              <SearchIcon />
            </span>
            <input
              className="h-12 w-full border-2 border-black bg-white pr-14 pl-11 text-base shadow-[3px_3px_0_#151515] outline-none placeholder:text-black/50 focus-visible:ring-3 focus-visible:ring-green-900"
              type="search"
              name="q"
              autoComplete="off"
              spellCheck={false}
              placeholder="Ex.: Família…"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
            {query && (
              <button
                className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 cursor-pointer place-items-center border-0 bg-transparent hover:bg-amber-100 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-black"
                type="button"
                aria-label="Limpar busca"
                onClick={() => onQueryChange('')}
              >
                <span className="size-5" aria-hidden="true"><CancelIcon /></span>
              </button>
            )}
          </span>
        </label>

        <div
          id="dashboard-filter-options"
          className={`${showFilters ? 'grid' : 'hidden'} gap-4 sm:col-span-full sm:grid sm:grid-cols-2 lg:col-span-3 lg:grid-cols-[15rem_15rem_auto] lg:items-end`}
        >
          <label className="block">
            <span className="text-xs font-black uppercase">Papel</span>
            <span className="relative mt-2 block">
              <select
                className={selectClass}
                name="role"
                value={role}
                onChange={(event) => onRoleChange(event.target.value as DashboardRoleFilter)}
              >
                <option value="ALL">Todos</option>
                <option value="OWNER">Organizador</option>
                <option value="PARTICIPANT">Participante</option>
              </select>
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2" aria-hidden="true">
                <ChevronDownIcon />
              </span>
            </span>
          </label>

          <label className="block">
            <span className="flex items-center gap-2 text-xs font-black uppercase">
              <span className="size-4" aria-hidden="true"><SortIcon /></span>
              Ordenar por data
            </span>
            <span className="relative mt-2 block">
              <select
                className={selectClass}
                name="order"
                value={sortOrder}
                onChange={(event) => onSortOrderChange(event.target.value as DashboardSortOrder)}
              >
                <option value="DESC">Mais recentes</option>
                <option value="ASC">Mais antigos</option>
              </select>
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2" aria-hidden="true">
                <ChevronDownIcon />
              </span>
            </span>
          </label>

          {hasActiveFilters && (
            <Button className="h-12" size="small" variant="secondary" onClick={onClear}>
              Limpar filtros
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

const periods: Array<{ value: DashboardPeriodFilter; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'TODAY', label: 'Hoje' },
  { value: 'YESTERDAY', label: 'Ontem' },
  { value: 'LAST_7_DAYS', label: 'Últimos 7 dias' },
  { value: 'LAST_30_DAYS', label: 'Últimos 30 dias' },
  { value: 'OLDER', label: 'Mais antigos' },
]

export function DrawPeriodFilters({
  value,
  onChange,
}: {
  value: DashboardPeriodFilter
  onChange: (value: DashboardPeriodFilter) => void
}) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Filtrar sorteados por período">
      {periods.map((period) => (
        <button
          key={period.value}
          className={`min-h-11 cursor-pointer border-2 border-black px-3 py-2 text-xs font-black uppercase shadow-[2px_2px_0_#151515] transition-[transform,box-shadow,background-color,color] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-black motion-reduce:transition-none ${value === period.value ? 'bg-green-900 text-white' : 'bg-white text-black'}`}
          type="button"
          aria-pressed={value === period.value}
          onClick={() => onChange(period.value)}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}
