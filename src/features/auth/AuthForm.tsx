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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authFormSchema),
    defaultValues: { name: '', email: '', password: '' },
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
      <Form.Input id="password" className="py-3 placeholder:text-black/50" type="password" autoComplete="current-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} {...register('password')} />
      {errors.password && <p id="password-error" className="border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700" role="alert">{errors.password.message}</p>}

      {error && <p className="mt-2 border border-red-300 bg-red-50 p-3 text-xs font-bold leading-5 text-red-700" role="alert">{error}</p>}

      <Form.Button className="mt-5 py-3 text-sm" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Aguarde...' : submitLabel}
      </Form.Button>
    </Form>
  )
}
