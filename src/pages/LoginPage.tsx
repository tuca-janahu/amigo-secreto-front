import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { PixelBrand } from '../components/PixelBrand'
import { AuthForm } from '../features/auth/AuthForm'
import { authQueryKey, authQueryOptions } from '../features/auth/auth.queries'
import type { AuthFormData } from '../features/auth/auth.schemas'
import { ApiError } from '../lib/http'
import { authService } from '../services/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit({ email, password }: AuthFormData) {
    setError(undefined)
    setIsSubmitting(true)

    try {
      await authService.login({ email, password })
      await queryClient.invalidateQueries({ queryKey: authQueryKey })
      await queryClient.fetchQuery(authQueryOptions)
      navigate('/dashboard', { replace: true })
    } catch (submitError) {
      setError(
        submitError instanceof ApiError && submitError.status === 401
          ? 'E-mail ou senha inválidos.'
          : 'Não foi possível entrar. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen font-mono text-black lg:grid-cols-[1fr_minmax(430px,0.85fr)]">
      <section className="relative overflow-hidden bg-amber-400 px-6 py-7 text-white sm:px-10 lg:px-[clamp(40px,7vw,110px)] lg:py-10">
        <div className="flex items-center gap-4">
          <Link className="border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0_#151515] transition hover:bg-amber-100" to="/">← Voltar</Link>
          <PixelBrand light />
        </div>
        <div className="mx-auto mt-16 max-w-xl lg:mt-[clamp(72px,14vh,150px)]">
          <p className="inline-block border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0_#151515]">Bom te ver de novo</p>
          <h1 className="mt-6 text-4xl leading-[0.95] font-black tracking-[-0.07em] sm:text-6xl">Seu próximo sorteio está esperando.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white sm:text-lg">Entre na sua conta para acompanhar os grupos e deixar a surpresa acontecer.</p>
        </div>
        <div className="relative mx-auto mt-12 max-w-sm border-2 border-black bg-green-900 p-5 shadow-[7px_7px_0_#151515]" aria-hidden="true">
          <div className="border-2 border-dashed border-black bg-white p-5 text-black">
            <p className="text-xs font-black uppercase tracking-wider">Mensagem secreta</p>
            <p className="mt-4 border-2 border-black bg-red-600 p-4 text-center text-xl font-black text-white shadow-[4px_4px_0_#151515]">Quem você tirou?</p>
          </div>
          <span className="absolute -right-4 -top-4 grid size-9 place-items-center border-2 border-black bg-white text-xl text-black">*</span>
        </div>
      </section>

      <section className="grid place-items-center bg-amber-100 px-5 py-12 sm:px-8">
        <div className="w-full max-w-md border-2 border-black bg-white p-6 shadow-[7px_7px_0_#151515] sm:p-10" aria-labelledby="login-title">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-600">Acesse sua conta</p>
          <h2 id="login-title" className="mt-3 text-3xl leading-none font-black tracking-[-0.06em] sm:text-4xl">Vamos jogar?</h2>
          <p className="mt-4 text-sm leading-6 text-black/70">Preencha seus dados para continuar.</p>
          <div className="mt-6"><AuthForm submitLabel="Entrar" isSubmitting={isSubmitting} error={error} onSubmit={handleSubmit} /></div>
          <p className="mt-7 text-center text-xs leading-6 text-black/70">Ainda não tem uma conta? <Link className="font-black uppercase text-red-600 underline decoration-2 underline-offset-4" to="/register">Criar conta</Link></p>
        </div>
      </section>
    </main>
  )
}
