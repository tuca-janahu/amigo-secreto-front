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
  const passwordWasReset = (location.state as AuthNavigationState | null)?.passwordReset === true
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
    <main className="grid min-h-dvh overflow-x-clip font-mono text-black lg:grid-cols-[1fr_minmax(430px,0.85fr)]">
      <section className="order-1 grid place-items-center bg-amber-100 px-4 py-8 sm:px-8 sm:py-12 lg:order-2">
        <div className="w-full max-w-md">
          <nav className="mb-5 flex items-center gap-3 lg:hidden" aria-label="Navegação da autenticação">
            <ButtonLink size="small" variant="secondary" to="/" icon={<BackIcon />}>Voltar</ButtonLink>
            <PixelBrand />
          </nav>
          <div className="w-full border-2 border-black bg-white p-6 shadow-[7px_7px_0_#151515] sm:p-10" aria-labelledby="login-title">
          <h1 id="login-title" className="mt-3 text-3xl leading-none font-black tracking-[-0.06em] sm:text-4xl">Acesse sua conta</h1>
          <p className="mt-4 text-sm leading-6 text-black/70">Preencha seus dados para continuar.</p>
          {passwordWasReset && <p className="mt-5 border-2 border-green-900 bg-green-100 p-3 text-xs font-bold leading-5" role="status">Senha redefinida. Entre com sua nova senha.</p>}
          <div className="mt-6"><AuthForm submitLabel="Entrar" isSubmitting={isSubmitting} onSubmit={handleSubmit} /></div>
          <p className="mt-6 text-center text-xs leading-6"><Link className="inline-flex min-h-11 items-center font-black uppercase text-red-600 underline decoration-2 underline-offset-4" to="/forgot-password">Esqueci minha senha</Link></p>
          <p className="mt-2 text-center text-xs leading-6 text-black/70">Ainda não tem uma conta?{' '}<Link className="inline-flex min-h-11 items-center font-black uppercase text-red-600 underline decoration-2 underline-offset-4" to="/register" state={{ returnTo }}>Criar conta</Link></p>
          </div>
        </div>
      </section>

      <section className="relative order-2 overflow-hidden bg-amber-400 px-4 py-6 text-white sm:px-10 sm:py-8 lg:order-1 lg:px-[clamp(40px,7vw,110px)] lg:py-10">
        <div className="hidden items-center gap-4 lg:flex">
          <ButtonLink size="small" variant="secondary" to="/" icon={<BackIcon />}>Voltar</ButtonLink>
          <PixelBrand light />
        </div>
        <div className="mx-auto mt-9 max-w-xl sm:mt-14 lg:mt-[clamp(72px,14vh,150px)]">
          <p className="inline-block border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0_#151515]">Bom te ver de novo</p>
          <h2 className="mt-6 text-3xl leading-[0.95] font-black tracking-[-0.07em] sm:text-5xl lg:text-6xl">Tá esperando o que?</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-white sm:text-lg">Entre na sua conta para acompanhar os grupos e deixar a surpresa acontecer.</p>
        </div>
        <div className="relative mx-auto mt-10 hidden max-w-sm border-2 border-black bg-slate-300 p-5 shadow-[7px_7px_0_#151515] sm:block" aria-hidden="true">
          <div className="border-2 border-dashed border-black bg-white p-5 text-black">
            <p className="text-xs font-black uppercase tracking-wider">(essa mensagem é protegida ok)</p>
            <p className="mt-4 border-2 border-black bg-green-900/50 p-4 text-center text-xl font-black text-white shadow-[4px_4px_0_#151515]">Seu amigo secreto é…</p>
          </div>
          <span className="absolute -top-4 -right-4 grid size-9 place-items-center border-2 border-black bg-red-600 text-xl text-white"><CancelIcon /></span>
        </div>
      </section>
    </main>
  )
}
