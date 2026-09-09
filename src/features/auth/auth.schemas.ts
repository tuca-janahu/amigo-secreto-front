import { z } from 'zod'

export const credentialsSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
})

export type CredentialsFormData = z.infer<typeof credentialsSchema>
