import { z } from 'zod'

export const credentialsSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
})

export type CredentialsFormData = z.infer<typeof credentialsSchema>

export const registrationSchema = credentialsSchema.extend({
  name: z.string().trim().min(1, 'Informe seu nome.').max(100, 'Use no máximo 100 caracteres.'),
})

export type RegistrationFormData = z.infer<typeof registrationSchema>

export const authFormSchema = credentialsSchema.extend({ name: z.string().optional() })
export type AuthFormData = z.infer<typeof authFormSchema>
