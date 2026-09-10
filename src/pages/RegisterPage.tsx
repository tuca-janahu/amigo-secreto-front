import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { PixelBrand } from '../components/PixelBrand'
import { AuthForm } from '../features/auth/AuthForm'
import { authQueryKey, authQueryOptions } from '../features/auth/auth.queries'
import type { AuthFormData } from '../features/auth/auth.schemas'
import { ApiError } from '../lib/http'
import { authService } from '../services/auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(credentials: AuthFormData) {
    setError(undefined)
    setIsSubmitting(true)

    try {
      if (!credentials.name) return
      await authService.register({ ...credentials, name: credentials.name })

      try {
        await queryClient.invalidateQueries({ queryKey: authQueryKey })
        await queryClient.fetchQuery(authQueryOptions)
        navigate('/dashboard', { replace: true })
      } catch (authError) {
        if (authError instanceof ApiError && authError.status === 401) {
          navigate('/login', { replace: true })
          return
        }

        setError('Conta criada, mas não foi possível confirmar sua sessão. Tente entrar.')
      }
    } catch (submitError) {
      setError(
        submitError instanceof ApiError && submitError.status === 409
          ? 'Este e-mail já está cadastrado.'
          : 'Não foi possível criar sua conta. Tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen font-mono text-black lg:grid-cols-[minmax(430px,0.85fr)_1fr]">
      <section className="order-2 grid place-items-center bg-green-100 px-5 py-12 sm:px-8 lg:order-1">
        <div className="w-full max-w-md border-2 border-black bg-white p-6 shadow-[7px_7px_0_#151515] sm:p-10" aria-labelledby="register-title">
          <h1 id="register-title" className="mt-3 text-3xl leading-none font-black tracking-[-0.06em] sm:text-4xl">Crie sua conta.</h1>
          <p className="mt-4 text-sm leading-6 text-black/70">Em poucos segundos você já pode preparar o próximo sorteio.</p>
          <div className="mt-6"><AuthForm includeName submitLabel="Criar conta" isSubmitting={isSubmitting} error={error} onSubmit={handleSubmit} /></div>
          <p className="mt-7 text-center text-xs leading-6 text-black/70">Já tem uma conta? <Link className="font-black uppercase text-red-600 underline decoration-2 underline-offset-4" to="/login">Entrar</Link></p>
        </div>
      </section>

      <section className="order-1 relative overflow-hidden bg-green-900 px-6 py-7 text-white sm:px-10 lg:order-2 lg:px-[clamp(40px,7vw,110px)] lg:py-10">
        <div className="flex items-center gap-4">
          <Link className="inline-flex cursor-pointer items-center justify-center border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase text-black shadow-[3px_3px_0_#151515] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_#151515]" to="/">← Voltar</Link>
          <PixelBrand light />
        </div>
        <div className="mx-auto mt-14 max-w-xl lg:mt-[clamp(72px,14vh,150px)]">
          <p className="inline-block border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0_#151515]">Comece agora</p>
          <h2 className="mt-10 text-4xl leading-[0.95] font-black tracking-[-0.07em] sm:text-6xl">"É tão fácil! de fazer!"</h2>
          <p className="max-w-md text-base leading-7 text-white sm:text-lg text-right">- Alguém, provavelmente</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-sm grid-cols-3 gap-3" aria-hidden="true">
          {['Grupo', 'Convite', 'Sorteio'].map((label, index) => <div key={label} className={`border-2 border-black p-3 text-center text-xs font-black uppercase shadow-[4px_4px_0_#151515] ${index === 1 ? 'bg-red-600 text-white' : 'bg-white text-black'}`}>{label}</div>)}
        </div>
      </section>
    </main>
  )
}
