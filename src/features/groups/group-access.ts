import type { AccessibleGroup } from '../../services/groups'

type GroupAccess = Pick<AccessibleGroup, 'participant' | 'roles'>

export function getGroupCardActions(group: GroupAccess) {
  const canManage = group.roles.includes('OWNER')
  const canViewDraw = Boolean(group.participant)

  return {
    canManage,
    canViewDraw,
    manageIconOnly: canManage && canViewDraw,
  }
}
