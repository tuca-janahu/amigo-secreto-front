import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ButtonLink } from '../components/Button'
import { BackIcon, PixelBrand } from '../components/PixelIcons'
import { AuthForm } from '../features/auth/AuthForm'
import { authQueryKey, authQueryOptions } from '../features/auth/auth.queries'
import { getAuthReturnTo } from '../features/auth/navigation'
import type { AuthFormData } from '../features/auth/auth.schemas'
import { getErrorMessage } from '../lib/errors'
import { ApiError } from '../lib/http'
import { authService } from '../services/auth'
import { appToast } from '../lib/toast'

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const returnTo = getAuthReturnTo(location.state)

  async function handleSubmit({ name, email, password }: AuthFormData) {
    setIsSubmitting(true)
    try {
      if (!name) return
      await authService.register({ name, email, password })
      try {
        await queryClient.invalidateQueries({ queryKey: authQueryKey })
        await queryClient.fetchQuery(authQueryOptions)
        navigate(returnTo, { replace: true })
      } catch (authError) {
        if (authError instanceof ApiError && authError.status === 401) {
          navigate('/login', { replace: true, state: { returnTo } })
          return
        }
        appToast.error('Conta criada, mas não foi possível confirmar sua sessão. Tente entrar.', { id: 'register-session-error' })
      }
    } catch (submitError) {
      appToast.error(getErrorMessage(
        submitError,
        'Não foi possível criar sua conta. Tente novamente.',
        { 409: 'Este e-mail já está cadastrado.' },
      ), { id: 'register-error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-dvh overflow-x-clip font-mono text-black lg:grid-cols-[minmax(430px,0.85fr)_1fr]">
      <section className="order-1 grid place-items-center bg-green-100 px-4 py-8 sm:px-8 sm:py-12">
        <div className="w-full max-w-md">
          <nav className="mb-5 flex items-center gap-3 lg:hidden" aria-label="Navegação da autenticação">
            <ButtonLink size="small" variant="secondary" to="/" icon={<BackIcon />}>Voltar</ButtonLink>
            <PixelBrand />
          </nav>
          <div className="w-full border-2 border-black bg-white p-6 shadow-[7px_7px_0_#151515] sm:p-10" aria-labelledby="register-title">
          <h1 id="register-title" className="mt-3 text-3xl leading-none font-black tracking-[-0.06em] sm:text-4xl">Crie sua conta.</h1>
          <p className="mt-4 text-sm leading-6 text-black/70">Em poucos segundos você já pode preparar o próximo sorteio.</p>
          <div className="mt-6"><AuthForm includeName submitLabel="Criar conta" isSubmitting={isSubmitting} onSubmit={handleSubmit} /></div>
          <p className="mt-5 text-center text-xs leading-6 text-black/70">Já tem uma conta? <Link className="inline-flex min-h-11 items-center font-black uppercase text-red-600 underline decoration-2 underline-offset-4" to="/login" state={{ returnTo }}>Entrar</Link></p>
          </div>
        </div>
      </section>

      <section className="relative order-2 overflow-hidden bg-green-900 px-4 py-6 text-white sm:px-10 sm:py-8 lg:py-10">
        <div className="hidden items-center gap-4 lg:flex">
          <ButtonLink size="small" variant="secondary" to="/" icon={<BackIcon />}>Voltar</ButtonLink>
          <PixelBrand light />
        </div>
        <div className="mx-auto mt-9 flex max-w-xl flex-col items-start sm:mt-14 sm:items-end sm:text-right lg:mt-[clamp(72px,14vh,150px)]">
          <p className="inline-block border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0_#151515]">Comece agora</p>
          <h2 className="mt-7 text-3xl font-black italic sm:mt-10 sm:text-5xl">“É tão fácil de fazer!”</h2>
          <p className="mt-4 max-w-md text-base text-white/70 sm:mt-8 sm:text-lg">— Alguém, provavelmente</p>
        </div>
      </section>
    </main>
  )
}
