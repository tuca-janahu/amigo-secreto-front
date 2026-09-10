import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { AuthFormData } from './auth.schemas'
import { authFormSchema } from './auth.schemas'

type AuthFormProps = {
  submitLabel: string
  isSubmitting: boolean
  error?: string
  includeName?: boolean
  onSubmit: (data: AuthFormData) => Promise<void>
}

export function AuthForm({ submitLabel, isSubmitting, error, includeName = false, onSubmit }: AuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authFormSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const inputClassName = (hasError: boolean) =>
    `w-full border-2 px-3 py-3 text-sm outline-none shadow-[3px_3px_0_#151515] placeholder:text-black/50 focus:ring-3 ${
      hasError
        ? 'border-red-700 bg-red-600 text-yellow-300 focus:ring-red-700'
        : 'border-black bg-white focus:bg-white focus:ring-green-900'
    }`

  return (
    <form className="grid gap-2 font-mono" onSubmit={handleSubmit(onSubmit)} noValidate>
      {includeName && <>
        <label className="mt-3 text-xs font-black uppercase tracking-wider" htmlFor="name">Nome</label>
        <input id="name" className={inputClassName(Boolean(errors.name))} type="text" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} {...register('name', { validate: (value) => Boolean(value?.trim()) || 'Informe seu nome.', maxLength: { value: 100, message: 'Use no máximo 100 caracteres.' } })} />
        {errors.name && <p id="name-error" className="border-2 border-red-700 bg-red-600 px-3 py-2 text-xs font-bold text-yellow-300" role="alert">{errors.name.message}</p>}
      </>}

      <label className="mt-3 text-xs font-black uppercase tracking-wider" htmlFor="email">E-mail</label>
      <input id="email" className={inputClassName(Boolean(errors.email))} type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} />
      {errors.email && <p id="email-error" className="border-2 border-red-700 bg-red-600 px-3 py-2 text-xs font-bold text-yellow-300" role="alert">{errors.email.message}</p>}

      <label className="mt-3 text-xs font-black uppercase tracking-wider" htmlFor="password">Senha</label>
      <input id="password" className={inputClassName(Boolean(errors.password))} type="password" autoComplete="current-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} {...register('password')} />
      {errors.password && <p id="password-error" className="border-2 border-red-700 bg-red-600 px-3 py-2 text-xs font-bold text-yellow-300" role="alert">{errors.password.message}</p>}

      {error && <p className="mt-2 border-2 border-red-700 bg-red-600 p-3 text-xs font-bold leading-5 text-yellow-300" role="alert">{error}</p>}

      <button className="mt-5 cursor-pointer border-2 border-black bg-green-900 px-4 py-3 text-sm font-black uppercase tracking-wider text-white shadow-[4px_4px_0_#151515] transition enabled:hover:translate-x-0.5 enabled:hover:translate-y-0.5 enabled:hover:shadow-[2px_2px_0_#151515] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Aguarde...' : submitLabel}
      </button>
    </form>
  )
}
