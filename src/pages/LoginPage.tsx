import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ButtonLink } from '../components/Button'
import { BackIcon, CancelIcon, PixelBrand } from '../components/PixelIcons'
import { AuthForm } from '../features/auth/AuthForm'
import { authQueryKey, authQueryOptions } from '../features/auth/auth.queries'
import { getAuthReturnTo, type AuthNavigationState } from '../features/auth/navigation'
import type { AuthFormData } from '../features/auth/auth.schemas'
import { getErrorMessage } from '../lib/errors'
import { authService } from '../services/auth'
import { appToast } from '../lib/toast'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const passwordWasReset =
    (location.state as AuthNavigationState | null)?.passwordReset ===
    true
  const returnTo = getAuthReturnTo(location.state)

  async function handleSubmit({ email, password }: AuthFormData) {
    setIsSubmitting(true)

    try {
      await authService.login({ email, password })
      await queryClient.invalidateQueries({ queryKey: authQueryKey })
      await queryClient.fetchQuery(authQueryOptions)
      navigate(returnTo, { replace: true })
    } catch (submitError) {
      appToast.error(getErrorMessage(
        submitError,
        'Não foi possível entrar. Tente novamente.',
        { 401: 'E-mail ou senha inválidos.' },
      ), { id: 'login-error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen font-mono text-black lg:grid-cols-[1fr_minmax(430px,0.85fr)]">
      <section className="relative overflow-hidden bg-amber-400 px-6 py-7 text-white sm:px-10 lg:px-[clamp(40px,7vw,110px)] lg:py-10">
        <div className="flex items-center gap-4">
          <ButtonLink
            className="hover:shadow-[1px_1px_0_#151515]"
            size="small"
            variant="secondary"
            to="/"
            icon={<BackIcon />}
          >
            Voltar
          </ButtonLink>
          <PixelBrand light />
        </div>
        <div className="mx-auto mt-16 max-w-xl lg:mt-[clamp(72px,14vh,150px)]">
          <p className="inline-block border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0_#151515]">
            Bom te ver de novo
          </p>
          <h1 className="mt-6 text-4xl leading-[0.95] font-black tracking-[-0.07em] sm:text-6xl">
            Tá esperando o que?
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white sm:text-lg">
            Entre na sua conta para acompanhar os grupos e deixar a surpresa
            acontecer.
          </p>
        </div>
        <div
          className="relative mx-auto mt-12 max-w-sm border-2 border-black bg-slate-300 p-5 shadow-[7px_7px_0_#151515]"
          aria-hidden="true"
        >
          <div className="border-2 border-dashed border-black bg-white p-5 text-black">
            <p className="text-xs font-black uppercase tracking-wider">
              (essa mensagem é protegida ok)
            </p>
            <p className="mt-4 border-2 border-black bg-green-900/50 p-4 text-center text-xl font-black text-white shadow-[4px_4px_0_#151515]">
              Seu amigo secreto é...
            </p>
          </div>
          <span className="absolute -right-4 -top-4 grid size-9 place-items-center border-2 border-black bg-red-600 text-xl text-white">
            <CancelIcon />
          </span>
        </div>
      </section>

      <section className="grid place-items-center bg-amber-100 px-5 py-12 sm:px-8">
        <div
          className="w-full max-w-md border-2 border-black bg-white p-6 shadow-[7px_7px_0_#151515] sm:p-10"
          aria-labelledby="login-title"
        >
          <h2
            id="login-title"
            className="mt-3 text-3xl leading-none font-black tracking-[-0.06em] sm:text-4xl"
          >
            Acesse sua conta
          </h2>
          <p className="mt-4 text-sm leading-6 text-black/70">
            Preencha seus dados para continuar.
          </p>
          {passwordWasReset && (
            <p
              className="mt-5 border-2 border-green-900 bg-green-100 p-3 text-xs font-bold leading-5"
              role="status"
            >
              Senha redefinida. Entre com sua nova senha.
            </p>
          )}
          <div className="mt-6">
            <AuthForm
              submitLabel="Entrar"
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </div>
          <p className="mt-6 text-center text-xs leading-6">
            <Link
              className="font-black uppercase text-red-600 underline decoration-2 underline-offset-4"
              to="/forgot-password"
            >
              Esqueci minha senha
            </Link>
          </p>
          <p className="mt-4 text-center text-xs leading-6 text-black/70">
            Ainda não tem uma conta?{' '}
            <Link
              className="font-black uppercase text-red-600 underline decoration-2 underline-offset-4"
              to="/register"
              state={{ returnTo }}
            >
              Criar conta
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
