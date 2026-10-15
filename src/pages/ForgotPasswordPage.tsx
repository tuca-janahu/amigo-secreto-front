import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { ButtonLink } from '../components/Button'
import { Form } from '../components/Form'
import { BackIcon, PixelBrand } from '../components/PixelIcons'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '../features/auth/auth.schemas'
import { authService } from '../services/auth'

export function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string>()
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit({ email }: ForgotPasswordFormData) {
    setError(undefined)
    setIsSubmitting(true)

    try {
      await authService.forgotPassword(email)
      setSubmitted(true)
    } catch {
      setError('Não foi possível concluir a solicitação. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-amber-100 px-5 py-12 font-mono text-black sm:px-8">
      <div className="w-full max-w-md border-2 border-black bg-white p-6 shadow-[7px_7px_0_#151515] sm:p-10" aria-labelledby="forgot-password-title">
        <div className="flex items-center justify-between gap-4">
          <PixelBrand />
          <ButtonLink size="small" variant="secondary" to="/login" icon={<BackIcon />}>Voltar</ButtonLink>
        </div>
        <h1 id="forgot-password-title" className="mt-8 text-3xl leading-none font-black tracking-[-0.06em] sm:text-4xl">Esqueceu a senha?</h1>
        {submitted ? (
          <div className="mt-6">
            <p className="border-2 border-green-900 bg-green-100 p-4 text-sm font-bold leading-6" role="status">Se existir uma conta com este e-mail, enviaremos um link para redefinir a senha.</p>
            <p className="mt-7 text-center text-xs leading-6"><Link className="font-black uppercase text-red-600 underline decoration-2 underline-offset-4" to="/login">Voltar ao login</Link></p>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm leading-6 text-black/70">Informe o e-mail da sua conta para receber o link de redefinição.</p>
            <Form className="mt-6 grid gap-2" onSubmit={handleSubmit(onSubmit)}>
              <Form.Label htmlFor="email">E-mail</Form.Label>
              <Form.Input id="email" className="py-3 placeholder:text-black/50" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} />
              {errors.email && <p id="email-error" className="border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-700" role="alert">{errors.email.message}</p>}
              {error && <p className="mt-2 border border-red-300 bg-red-50 p-3 text-xs font-bold leading-5 text-red-700" role="alert">{error}</p>}
              <Form.Button className="mt-5 py-3 text-sm" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Aguarde...' : 'Enviar link'}</Form.Button>
            </Form>
          </>
        )}
      </div>
    </main>
  )
}
