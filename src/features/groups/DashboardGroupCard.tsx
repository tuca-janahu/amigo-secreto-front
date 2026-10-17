import { Button, ButtonLink } from '../../components/Button'
import { DeleteIcon, SettingsIcon } from '../../components/PixelIcons'
import { panelClass } from '../../lib/styles'
import type { AccessibleGroup, GroupStatus } from '../../services/groups'
import { getGroupCardActions } from './group-access'

const statusLabel: Record<GroupStatus, string> = {
  DRAFT: 'Rascunho',
  READY: 'Pronto',
  SORTEADO: 'Sorteado',
  CANCELLED: 'Cancelado',
}

const statusClass: Record<GroupStatus, string> = {
  DRAFT: 'bg-amber-400 text-amber-950',
  READY: 'bg-green-100 text-green-950',
  SORTEADO: 'bg-green-900 text-white',
  CANCELLED: 'bg-gray-200 text-black',
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' })

function cardDate(group: AccessibleGroup) {
  if (group.status === 'SORTEADO') {
    return { label: 'Sorteado em', value: group.sorteadoAt ?? group.updatedAt ?? group.createdAt }
  }

  if (group.updatedAt) return { label: 'Atualizado em', value: group.updatedAt }
  return { label: 'Criado em', value: group.createdAt }
}

export function DashboardGroupCard({
  group,
  onDelete,
}: {
  group: AccessibleGroup
  onDelete: (group: AccessibleGroup) => void
}) {
  const actions = getGroupCardActions(group)
  const date = cardDate(group)
  const hasActions = actions.canViewDraw || actions.canManage

  return (
    <article className={`${panelClass} flex h-full min-w-0 flex-col`}>
      <div className="flex flex-wrap gap-2">
        <span className={`inline-block border-2 border-black px-2 py-1 text-xs font-black uppercase ${statusClass[group.status]}`}>
          {statusLabel[group.status]}
        </span>
        {group.roles.includes('OWNER') && (
          <span className="inline-block border-2 border-black bg-white px-2 py-1 text-xs font-black uppercase">
            Organizador
          </span>
        )}
        {group.roles.includes('PARTICIPANT') && (
          <span className="inline-block border-2 border-black bg-green-100 px-2 py-1 text-xs font-black uppercase">
            Participante
          </span>
        )}
      </div>

      <h3 className="mt-5 break-words text-2xl leading-tight font-black">{group.name}</h3>
      <p className="mt-3 text-xs font-bold text-black/65">
        {date.label}{' '}
        <time dateTime={date.value}>{dateFormatter.format(new Date(date.value))}</time>
      </p>

      {hasActions && (
        <div className="mt-auto flex items-stretch gap-2 pt-6">
          {actions.canViewDraw && (
            <ButtonLink className="min-h-14 min-w-0 flex-1" to={`/dashboard/groups/${group.id}/participation`}>
              Ver meu sorteio
            </ButtonLink>
          )}

          {actions.manageIconOnly && (
            <ButtonLink
              className="size-14 shrink-0 px-0 py-0"
              variant="secondary"
              to={`/dashboard/groups/${group.id}`}
              aria-label={`Gerenciar grupo ${group.name}`}
              title="Gerenciar grupo"
            >
              <SettingsIcon />
            </ButtonLink>
          )}

          {actions.canManage && !actions.manageIconOnly && (
            <ButtonLink
              className="min-h-14 min-w-0 flex-1"
              variant="secondary"
              to={`/dashboard/groups/${group.id}`}
              icon={<SettingsIcon />}
            >
              Gerenciar grupo
            </ButtonLink>
          )}

          {actions.canManage && group.status === 'DRAFT' && (
            <Button
              className="size-14 shrink-0 px-0 py-0"
              variant="danger"
              aria-label={`Excluir grupo ${group.name}`}
              title="Excluir grupo"
              onClick={() => onDelete(group)}
            >
              <DeleteIcon />
            </Button>
          )}
        </div>
      )}
    </article>
  )
}
