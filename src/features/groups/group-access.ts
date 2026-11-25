import type { AccessibleGroup } from '../../services/groups'

type GroupAccess = Pick<AccessibleGroup, 'participant' | 'roles' | 'status'>

export function getGroupCardActions(group: GroupAccess) {
  const canManage = group.roles.includes('OWNER')
  const canViewDraw = Boolean(group.participant) && (!canManage || group.status === 'SORTEADO')

  return {
    canManage,
    canViewDraw,
    manageIconOnly: canManage && canViewDraw,
  }
}
