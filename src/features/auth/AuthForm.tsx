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
        <button className="absolute inset-y-0 right-2 grid w-8 cursor-pointer place-items-center border-0 bg-transparent p-0 text-black hover:opacity-70 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-black" type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>
          <EyeIcon hidden={showPassword} />
        </button>
      </div>
      {errors.password && <p id="password-error" className="border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700" role="alert">{errors.password.message}</p>}

      {includeName && <>
        <Form.Label className="mt-3" htmlFor="confirm-password">Confirmar senha</Form.Label>
        <div className="relative">
          <Form.Input id="confirm-password" className="py-3 pr-12 placeholder:text-black/50" type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined} {...register('confirmPassword')} />
          <button className="absolute inset-y-0 right-2 grid w-8 cursor-pointer place-items-center border-0 bg-transparent p-0 text-black hover:opacity-70 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-black" type="button" aria-label={showConfirmation ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'} aria-pressed={showConfirmation} onClick={() => setShowConfirmation((value) => !value)}>
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
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-6">
      <path d={hidden
        ? 'M22 22h-2v-2h2v2Zm-6-2H8v-2h8v2Zm4 0h-2v-2h2v2ZM8 18H4v-2h4v2Zm10 0h-2v-2h2v2ZM4 16H2v-2h2v2Zm6-6h2v2h2v2h2v2h-6v-2H8V8h2v2Zm12 6h-2v-2h2v2ZM2 14H0v-4h2v4Zm22 0h-2v-4h2v4Zm-8-2h-2v-2h2v2ZM4 10H2V8h2v2Zm10 0h-2V8h2v2Zm8 0h-2V8h2v2ZM6 6h2v2H4V4h2v2Zm14 2h-4V6h4v2Zm-4-2h-6V4h6v2ZM4 4H2V2h2v2Z'
        : 'M16 20H8v-2h8v2Zm-8-2H4v-2h4v2Zm12 0h-4v-2h4v2ZM4 16H2v-2h2v2Zm10-6h-2v2h2v-2h2v4h-2v2h-4v-2H8v-4h2V8h4v2Zm8 6h-2v-2h2v2ZM2 14H0v-4h2v4Zm22 0h-2v-4h2v4ZM4 10H2V8h2v2Zm18 0h-2V8h2v2ZM8 8H4V6h4v2Zm12 0h-4V6h4v2Zm-4-2H8V4h8v2Z'} />
    </svg>
  )
}
