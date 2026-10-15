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

export const forgotPasswordSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
  confirmPassword: z.string(),
}).refine(({ password, confirmPassword }) => password === confirmPassword, {
  path: ['confirmPassword'],
  message: 'As senhas não coincidem.',
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const authFormSchema = credentialsSchema.extend({
  name: z.string().optional(),
  confirmPassword: z.string().optional(),
}).superRefine(({ password, confirmPassword }, context) => {
  if (confirmPassword !== undefined && confirmPassword !== password) {
    context.addIssue({
      code: 'custom',
      path: ['confirmPassword'],
      message: 'As senhas não coincidem.',
    })
  }
})
export type AuthFormData = z.infer<typeof authFormSchema>
