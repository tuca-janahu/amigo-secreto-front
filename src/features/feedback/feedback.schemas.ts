import { z } from 'zod'

export const feedbackTypeSchema = z.enum(['BUG', 'SUGGESTION'])

export const feedbackSourceSchema = z.enum([
  'HOME',
  'LOGIN',
  'REGISTER',
  'DASHBOARD',
  'GROUP',
  'PARTICIPANT',
  'OTHER',
])

export const feedbackFormSchema = z.object({
  type: feedbackTypeSchema,
  message: z
    .string()
    .trim()
    .min(5, 'Descreva o feedback em pelo menos 5 caracteres.')
    .max(2_000, 'O feedback deve ter no máximo 2.000 caracteres.'),
})

export type FeedbackFormData = z.infer<typeof feedbackFormSchema>
export type FeedbackSource = z.infer<typeof feedbackSourceSchema>

export function getFeedbackSource(pathname: string): FeedbackSource {
  if (pathname === '/') return 'HOME'
  if (pathname === '/login') return 'LOGIN'
  if (pathname === '/register') return 'REGISTER'
  if (/^\/s\/[^/]+\/?$/.test(pathname)) return 'PARTICIPANT'
  if (/^\/dashboard\/groups\/[^/]+\/?$/.test(pathname)) return 'GROUP'
  if (pathname === '/dashboard' || pathname === '/dashboard/') return 'DASHBOARD'
  return 'OTHER'
}
