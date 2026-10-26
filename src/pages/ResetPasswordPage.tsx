import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ButtonLink } from '../components/Button'
import { Form } from '../components/Form'
import { BackIcon, PixelBrand } from '../components/PixelIcons'
import { resetPasswordSchema, type ResetPasswordFormData } from '../features/auth/auth.schemas'
import { getErrorMessage } from '../lib/errors'
import { authService } from '../services/auth'
import { appToast } from '../lib/toast'

export function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onSubmit({ password }: ResetPasswordFormData) {
    if (!token) {
      appToast.error('Link de redefinição inválido ou expirado.', {
        id: 'reset-password-error',
      })
      return
    }

    setIsSubmitting(true)

    try {
      await authService.resetPassword({ token, password })
      navigate('/login', {
        replace: true,
        state: { passwordReset: true },
      })
    } catch (submitError) {
      appToast.error(getErrorMessage(
        submitError,
        'Não foi possível redefinir a senha. Tente novamente.',
        { 400: 'Link de redefinição inválido ou expirado.' },
      ), { id: 'reset-password-error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-green-100 px-4 py-8 font-mono text-black sm:px-8 sm:py-12">
      <div className="w-full max-w-md border-2 border-black bg-white p-6 shadow-[7px_7px_0_#151515] sm:p-10" aria-labelledby="reset-password-title">
        <div className="flex items-center justify-between gap-4">
          <PixelBrand />
          <ButtonLink size="small" variant="secondary" to="/login" icon={<BackIcon />}>Voltar</ButtonLink>
        </div>
        <h1 id="reset-password-title" className="mt-8 text-3xl leading-none font-black tracking-[-0.06em] sm:text-4xl">Crie uma nova senha</h1>
        <p className="mt-4 text-sm leading-6 text-black/70">Use pelo menos 8 caracteres.</p>
        <Form className="mt-6 grid gap-2" onSubmit={handleSubmit(onSubmit)}>
          <Form.Label htmlFor="password">Nova senha</Form.Label>
          <Form.Input id="password" className="py-3 placeholder:text-black/50" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} {...register('password')} />
          {errors.password && <p id="password-error" className="border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700" role="alert">{errors.password.message}</p>}

          <Form.Label className="mt-3" htmlFor="confirm-password">Confirmar nova senha</Form.Label>
          <Form.Input id="confirm-password" className="py-3 placeholder:text-black/50" type="password" autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined} {...register('confirmPassword')} />
          {errors.confirmPassword && <p id="confirm-password-error" className="border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700" role="alert">{errors.confirmPassword.message}</p>}
          <Form.Button className="mt-5 w-full py-3 text-sm" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Aguarde…' : 'Redefinir senha'}</Form.Button>
        </Form>
      </div>
    </main>
  )
}
