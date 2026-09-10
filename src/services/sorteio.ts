import { http } from '../lib/http'
import type { Group } from './groups'

export type SorteioViability =
  | { viable: true }
  | { viable: false; reason: 'NOT_ENOUGH_PARTICIPANTS' | 'NO_VALID_ASSIGNMENT' }

export const sorteioService = {
  viability: (groupId: string) => http<SorteioViability>(`/groups/${groupId}/sorteio/viability`),
  draw: async (groupId: string) =>
    (await http<{ group: Group }>(`/groups/${groupId}/sorteio`, { method: 'POST' })).group,
}
