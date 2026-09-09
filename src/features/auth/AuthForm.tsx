import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { CredentialsFormData } from './auth.schemas'
import { credentialsSchema } from './auth.schemas'

type AuthFormProps = {
  submitLabel: string
  isSubmitting: boolean
  error?: string
  onSubmit: (data: CredentialsFormData) => Promise<void>
}

export function AuthForm({ submitLabel, isSubmitting, error, onSubmit }: AuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialsFormData>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="email">E-mail</label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        aria-invalid={Boolean(errors.email)}
        aria-describedby={errors.email ? 'email-error' : undefined}
        {...register('email')}
      />
      {errors.email && (
        <p id="email-error" className="field-error" role="alert">
          {errors.email.message}
        </p>
      )}

      <label htmlFor="password">Senha</label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        aria-invalid={Boolean(errors.password)}
        aria-describedby={errors.password ? 'password-error' : undefined}
        {...register('password')}
      />
      {errors.password && (
        <p id="password-error" className="field-error" role="alert">
          {errors.password.message}
        </p>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Aguarde...' : submitLabel}
      </button>
    </form>
  )
}
