import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form } from '../../components/Form'
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authFormSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: undefined },
  })

  return (
    <Form className="grid gap-2 font-mono" onSubmit={handleSubmit(onSubmit)}>
      {includeName && <>
        <Form.Label className="mt-3" htmlFor="name">Nome</Form.Label>
        <Form.Input id="name" className="py-3 placeholder:text-black/50" type="text" autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} {...register('name', { validate: (value) => Boolean(value?.trim()) || 'Informe seu nome.', maxLength: { value: 100, message: 'Use no máximo 100 caracteres.' } })} />
        {errors.name && <p id="name-error" className="border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700" role="alert">{errors.name.message}</p>}
      </>}

      <Form.Label className="mt-3" htmlFor="email">E-mail</Form.Label>
      <Form.Input id="email" className="py-3 placeholder:text-black/50" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} />
      {errors.email && <p id="email-error" className="border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700" role="alert">{errors.email.message}</p>}

      <Form.Label className="mt-3" htmlFor="password">Senha</Form.Label>
      <div className="relative">
        <Form.Input id="password" className="py-3 pr-12 placeholder:text-black/50" type={showPassword ? 'text' : 'password'} autoComplete={includeName ? 'new-password' : 'current-password'} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} {...register('password')} />
        <button className="absolute inset-y-1 right-1 grid size-10 cursor-pointer place-items-center border-2 border-black bg-white text-black transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#151515] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-black" type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>
          <EyeIcon hidden={showPassword} />
        </button>
      </div>
      {errors.password && <p id="password-error" className="border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700" role="alert">{errors.password.message}</p>}

      {includeName && <>
        <Form.Label className="mt-3" htmlFor="confirm-password">Confirmar senha</Form.Label>
        <div className="relative">
          <Form.Input id="confirm-password" className="py-3 pr-12 placeholder:text-black/50" type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined} {...register('confirmPassword')} />
          <button className="absolute inset-y-1 right-1 grid size-10 cursor-pointer place-items-center border-2 border-black bg-white text-black transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#151515] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-black" type="button" aria-label={showConfirmation ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'} aria-pressed={showConfirmation} onClick={() => setShowConfirmation((value) => !value)}>
            <EyeIcon hidden={showConfirmation} />
          </button>
        </div>
        {errors.confirmPassword && <p id="confirm-password-error" className="border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700" role="alert">{errors.confirmPassword.message}</p>}
      </>}

      {error && <p className="mt-2 border border-red-300 bg-red-50 p-3 text-xs font-bold leading-5 text-red-700" role="alert">{error}</p>}

      <Form.Button className="mt-5 py-3 text-sm" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Aguarde...' : submitLabel}
      </Form.Button>
    </Form>
  )
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
      <path d="M2.5 12s3.25-5 9.5-5 9.5 5 9.5 5-3.25 5-9.5 5-9.5-5-9.5-5Z" />
      <circle cx="12" cy="12" r="2.5" />
      {hidden && <path d="m4 4 16 16" />}
    </svg>
  )
}
