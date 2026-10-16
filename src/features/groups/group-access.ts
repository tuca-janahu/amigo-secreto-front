import type { AccessibleGroup } from '../../services/groups'

type GroupAccess = Pick<AccessibleGroup, 'participant' | 'roles'>

export function getGroupCardActions(group: GroupAccess) {
  return {
    canManage: group.roles.includes('OWNER'),
    canViewDraw: Boolean(group.participant),
  }
}
