import { z } from 'zod'

export const messageSchema = z.object({
  content: z.string().trim().min(1, 'Escreva uma mensagem.').max(500, 'Use no máximo 500 caracteres.'),
})

export type MessageFormData = z.infer<typeof messageSchema>
