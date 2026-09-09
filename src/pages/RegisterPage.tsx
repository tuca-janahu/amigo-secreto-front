import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { AuthForm } from '../features/auth/AuthForm'
import { authQueryKey, authQueryOptions } from '../features/auth/auth.queries'
import type { CredentialsFormData } from '../features/auth/auth.schemas'
import { ApiError } from '../lib/http'
import { authService } from '../services/auth'

export function RegisterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(credentials: CredentialsFormData) {
    setError(undefined)
    setIsSubmitting(true)

    try {
      await authService.register(credentials)

      try {
        await queryClient.invalidateQueries({ queryKey: authQueryKey })
        await queryClient.fetchQuery(authQueryOptions)
        navigate('/', { replace: true })
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
    <main className="page page-centered">
      <section className="auth-card" aria-labelledby="register-title">
        <p className="eyebrow">Amigo Secreto</p>
        <h1 id="register-title">Crie sua conta</h1>
        <p className="intro">Prepare-se para os próximos sorteios.</p>
        <AuthForm
          submitLabel="Criar conta"
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
        />
        <p className="auth-link">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </p>
      </section>
    </main>
  )
}
