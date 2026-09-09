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
    <form className="grid gap-2 font-mono" onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="mt-3 text-xs font-black uppercase tracking-wider" htmlFor="email">E-mail</label>
      <input id="email" className="w-full border-2 border-black bg-white px-3 py-3 text-sm outline-none shadow-[3px_3px_0_#151515] placeholder:text-black/50 focus:bg-white focus:ring-3 focus:ring-green-900" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} />
      {errors.email && <p id="email-error" className="text-xs font-bold text-green-900" role="alert">{errors.email.message}</p>}

      <label className="mt-3 text-xs font-black uppercase tracking-wider" htmlFor="password">Senha</label>
      <input id="password" className="w-full border-2 border-black bg-white px-3 py-3 text-sm outline-none shadow-[3px_3px_0_#151515] placeholder:text-black/50 focus:bg-white focus:ring-3 focus:ring-green-900" type="password" autoComplete="current-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} {...register('password')} />
      {errors.password && <p id="password-error" className="text-xs font-bold text-green-900" role="alert">{errors.password.message}</p>}

      {error && <p className="mt-2 border-2 border-black bg-green-900 p-3 text-xs font-bold leading-5 text-black" role="alert">{error}</p>}

      <button className="mt-5 border-2 border-black bg-green-900 px-4 py-3 text-sm font-black uppercase tracking-wider text-white shadow-[4px_4px_0_#151515] transition enabled:hover:translate-x-0.5 enabled:hover:translate-y-0.5 enabled:hover:shadow-[2px_2px_0_#151515] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Aguarde...' : submitLabel}
      </button>
    </form>
  )
}
