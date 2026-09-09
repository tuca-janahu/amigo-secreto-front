import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth, authQueryKey } from '../features/auth/auth.queries'
import { authService } from '../services/auth'

export function DashboardPage() {
  const { data: user } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isLeaving, setIsLeaving] = useState(false)

  async function handleLogout() {
    setIsLeaving(true)

    try {
      await authService.logout()
    } finally {
      queryClient.removeQueries({ queryKey: authQueryKey })
      navigate('/login', { replace: true })
    }
  }

  return (
    <main className="page dashboard-page">
      <section className="dashboard-card" aria-labelledby="dashboard-title">
        <p className="eyebrow">Amigo Secreto</p>
        <h1 id="dashboard-title">Olá, {user?.email}</h1>
        <p>Seus sorteios aparecerão aqui.</p>
        <button className="secondary-button" type="button" onClick={handleLogout} disabled={isLeaving}>
          {isLeaving ? 'Saindo...' : 'Sair'}
        </button>
      </section>
    </main>
  )
}
