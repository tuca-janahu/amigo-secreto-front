import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './auth.queries'

function SessionLoading() {
  return <main className="grid min-h-screen place-items-center bg-white p-6 font-mono text-sm font-black uppercase tracking-wider text-black"><p className="border-2 border-black bg-amber-400 px-5 py-3 shadow-[4px_4px_0_#151515]">Verificando sessão...</p></main>
}

export function ProtectedRoute() {
  const { data: user, isPending } = useAuth()
  if (isPending) return <SessionLoading />
  if (!user) return <Navigate to="/" replace />
  return <Outlet />
}

export function PublicOnlyRoute() {
  const { data: user, isPending } = useAuth()
  if (isPending) return <SessionLoading />
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
