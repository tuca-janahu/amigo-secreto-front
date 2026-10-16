import { http } from '../lib/http'

export type AnonymousMessage = {
  id: string
  content: string
  createdAt: string
}

const messagesPath = (token: string) => `/public/participant-access/${encodeURIComponent(token)}/messages`
const groupMessagesPath = (groupId: string) => `/groups/${encodeURIComponent(groupId)}/messages`

export const messagesService = {
  list: async (token: string) =>
    (await http<{ messages: AnonymousMessage[] }>(messagesPath(token))).messages,
  create: async (token: string, content: string) =>
    (await http<{ message: AnonymousMessage }>(messagesPath(token), { method: 'POST', body: { content } })).message,
  listForGroup: async (groupId: string) =>
    (await http<{ messages: AnonymousMessage[] }>(groupMessagesPath(groupId))).messages,
  createForGroup: async (groupId: string, content: string) =>
    (await http<{ message: AnonymousMessage }>(groupMessagesPath(groupId), { method: 'POST', body: { content } })).message,
}
