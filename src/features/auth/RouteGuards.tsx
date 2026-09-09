import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './auth.queries'

function SessionLoading() {
  return (
    <main className="page page-centered">
      <p className="loading">Verificando sua sessão...</p>
    </main>
  )
}

export function ProtectedRoute() {
  const { data: user, isPending } = useAuth()

  if (isPending) {
    return <SessionLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { data: user, isPending } = useAuth()

  if (isPending) {
    return <SessionLoading />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
