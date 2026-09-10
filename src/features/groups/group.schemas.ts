import { z } from 'zod'

export const groupSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do grupo.').max(100, 'Use no máximo 100 caracteres.'),
})

export const participantSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome.').max(150, 'Use no máximo 150 caracteres.'),
  email: z.email('Informe um e-mail válido.').max(254, 'E-mail muito longo.'),
})

export const importSchema = z.object({
  data: z.string().trim().min(1, 'Cole ao menos um participante.'),
})

export const restrictionSchema = z.object({
  firstId: z.string().min(1, 'Escolha o primeiro participante.'),
  secondId: z.string().min(1, 'Escolha o segundo participante.'),
  bilateral: z.boolean(),
}).refine(({ firstId, secondId }) => firstId !== secondId, {
  message: 'Escolha participantes diferentes.',
  path: ['secondId'],
})

export type GroupFormData = z.infer<typeof groupSchema>
export type ParticipantFormData = z.infer<typeof participantSchema>
export type ImportFormData = z.infer<typeof importSchema>
export type RestrictionFormData = z.infer<typeof restrictionSchema>
