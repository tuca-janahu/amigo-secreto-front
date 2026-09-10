import { http } from '../lib/http'

export type AnonymousMessage = {
  id: string
  content: string
  createdAt: string
}

const messagesPath = (token: string) => `/public/participant-access/${encodeURIComponent(token)}/messages`

export const messagesService = {
  list: async (token: string) =>
    (await http<{ messages: AnonymousMessage[] }>(messagesPath(token))).messages,
  create: async (token: string, content: string) =>
    (await http<{ message: AnonymousMessage }>(messagesPath(token), { method: 'POST', body: { content } })).message,
}
