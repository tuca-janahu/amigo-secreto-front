import type { ReactNode } from 'react'
import { eventLabels, statusLabels, type AuditEvent, type AdminUser, type AdminGroup, type Overview } from '../../services/admin'

const number = new Intl.NumberFormat('pt-BR')
const timestamp = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })
const day = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short' })
function Identity({ name, detail }: { name: string; detail?: string | null }) {
  return <><span className="block font-bold [overflow-wrap:anywhere]">{name}</span>{detail && <span className="mt-1 block text-xs leading-relaxed text-black/65 [overflow-wrap:anywhere]">{detail}</span>}</>
}
function DataTable({ headings, rows }: { headings: string[]; rows: { id: string; cells: ReactNode[] }[] }) {
  return <table className="admin-table w-full table-fixed text-left text-sm">
    <thead className="bg-amber-100/60"><tr>{headings.map(label => <th key={label} scope="col" className="px-5 py-4 text-xs font-black">{label}</th>)}</tr></thead>
    <tbody>{rows.map(row => <tr key={row.id} className="border-t border-black/20 hover:bg-amber-50/70">{row.cells.map((cell, index) => <td key={headings[index]} className="px-5 py-5 align-top tabular-nums"><span className="admin-cell-label" aria-hidden="true">{headings[index]}</span><div className="min-w-0">{cell}</div></td>)}</tr>)}</tbody>
  </table>
}
export function EventResults({ items }: { items: AuditEvent[] }) {
  return <DataTable headings={['Evento', 'Autor', 'Grupo', 'Data e hora']} rows={items.map(event => ({ id: event.id, cells: [
    <span className={`inline-block border px-2 py-1 text-xs font-bold ${event.type === 'GROUP_DELETED' ? 'border-red-800 bg-red-50 text-red-800' : event.type === 'SORTEIO_COMPLETED' ? 'border-green-900 bg-green-50 text-green-900' : 'border-black/30 bg-white'}`}>{eventLabels[event.type] ?? event.type}</span>,
    <Identity name={event.actorName} detail={event.actorUserId} />,
    <Identity name={event.groupName ?? 'Não se aplica'} detail={event.groupId} />,
    <time dateTime={event.occurredAt}>{timestamp.format(new Date(event.occurredAt))}</time>,
  ] }))} />
}
export function UserResults({ items }: { items: AdminUser[] }) {
  return <DataTable headings={['Conta', 'Cadastro', 'Grupos', 'Sorteios']} rows={items.map(user => ({ id: user.id, cells: [<><Identity name={user.name} detail={user.email} /><span className="mt-2 block text-xs text-black/65 [overflow-wrap:anywhere]">{user.id}</span></>, day.format(new Date(user.createdAt)), number.format(user.groupsCount), number.format(user.sorteiosCount)] }))} />
}
export function GroupResults({ items }: { items: AdminGroup[] }) {
  return <DataTable headings={['Grupo', 'Organizador', 'Participações', 'Datas']} rows={items.map(group => ({ id: group.id, cells: [
    <><Identity name={group.name} detail={group.id} /><span className="mt-2 inline-block border border-black/30 bg-amber-50 px-2 py-1 text-xs font-bold">{statusLabels[group.status] ?? group.status}</span></>,
    <Identity name={group.owner.name} detail={group.owner.email} />,
    <>{number.format(group.participantsCount)} participantes<span className="mt-1 block text-xs text-black/65">{number.format(group.revealedCount)} revelaram</span></>,
    <span className="text-xs leading-relaxed">Criado: {day.format(new Date(group.createdAt))}<br />Sorteio: {group.sorteadoAt ? day.format(new Date(group.sorteadoAt)) : 'Não realizado'}</span>,
  ] }))} />
}
export function OverviewResults({ data }: { data: Overview }) {
  return <div className="space-y-8 p-5 sm:p-6">
    <section aria-labelledby="totals-title"><h3 id="totals-title" className="text-lg font-black">Plataforma hoje</h3><p className="mt-1 text-xs text-black/65">Registros existentes, independentemente do período selecionado.</p>
      <dl className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4">{[['Contas', data.totals.users], ['Grupos', data.totals.groups], ['Sorteios', data.totals.sorteios], ['Participações', data.totals.participations]].map(([label, value]) => <div key={label} className="border-l-4 border-green-900 pl-4"><dt className="text-xs font-bold">{label}</dt><dd className="mt-2 text-3xl font-black tabular-nums">{number.format(Number(value))}</dd></div>)}</dl>
      <p className="mt-5 text-xs leading-relaxed text-black/65">{Object.entries(statusLabels).map(([status, label]) => `${label}: ${number.format(data.totals.groupsByStatus[status as keyof typeof statusLabels])}`).join(' · ')}</p>
    </section>
    <section className="border-t border-black/20 pt-6" aria-labelledby="activity-title"><h3 id="activity-title" className="text-lg font-black">No período selecionado</h3><dl className="mt-4 grid gap-4 sm:grid-cols-3">{[['Novas contas', data.activity.newUsers], ['Novos grupos', data.activity.newGroups], ['Sorteios realizados', data.activity.completedSorteios]].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 bg-amber-50 p-4"><dt className="text-sm">{label}</dt><dd className="text-xl font-black tabular-nums">{number.format(Number(value))}</dd></div>)}</dl></section>
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="border-2 border-black p-5"><h3 className="font-black">Revelações do amigo secreto</h3><p className="mt-3 text-3xl font-black text-green-900 tabular-nums">{data.engagement.participations ? `${number.format(data.engagement.revealRate)}%` : '—'}</p><p className="mt-2 text-sm">{number.format(data.engagement.revealed)} de {number.format(data.engagement.participations)} participações</p><p className="mt-3 text-xs leading-relaxed text-black/65">Estado atual das revelações em grupos sorteados no período. Uma pessoa pode participar de vários grupos.</p></section>
      <section className="border-2 border-black p-5"><h3 className="font-black">Convites por e-mail</h3><p className="mt-3 text-sm"><strong className="text-3xl tabular-nums">{number.format(data.invitations.attempts)}</strong> tentativas</p><dl className="mt-4 grid grid-cols-2 gap-3 text-xs">{([['PENDING', 'Pendentes'], ['SENT', 'Aceitos pelo provedor'], ['DELIVERED', 'Entregues'], ['FAILED', 'Falhas']] as const).map(([key, label]) => <div key={key}><dt>{label}</dt><dd className="mt-1 font-black tabular-nums">{number.format(data.invitations.attemptsByStatus[key])}</dd></div>)}</dl><p className="mt-3 text-xs leading-relaxed text-black/65">Inclui reenvios. Aceite pelo provedor não confirma entrega na caixa de entrada.</p></section>
    </div>
  </div>
}
