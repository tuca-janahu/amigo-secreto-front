import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../lib/http'
import { AuthForm } from '../features/auth/AuthForm'
import { authQueryKey, authQueryOptions } from '../features/auth/auth.queries'
import type { CredentialsFormData } from '../features/auth/auth.schemas'
import { authService } from '../services/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(credentials: CredentialsFormData) {
    setError(undefined)
    setIsSubmitting(true)

    try {
      await authService.login(credentials)
      await queryClient.invalidateQueries({ queryKey: authQueryKey })
      await queryClient.fetchQuery(authQueryOptions)
      navigate('/', { replace: true })
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
    <main className="page page-centered">
      <section className="auth-card" aria-labelledby="login-title">
        <p className="eyebrow">Amigo Secreto</p>
        <h1 id="login-title">Que bom ter você por aqui</h1>
        <p className="intro">Entre para acompanhar os seus sorteios.</p>
        <AuthForm
          submitLabel="Entrar"
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
        />
        <p className="auth-link">
          Ainda não tem uma conta? <Link to="/register">Criar conta</Link>
        </p>
      </section>
    </main>
  )
}
