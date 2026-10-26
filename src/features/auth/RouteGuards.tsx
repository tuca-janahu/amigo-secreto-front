import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './auth.queries'
import { getAuthReturnTo } from './navigation'

function SessionLoading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-white p-6 font-mono text-sm font-black uppercase tracking-wider text-black">
      <p className="border-2 border-black bg-amber-400 px-5 py-3 shadow-[4px_4px_0_#151515]">
        Verificando sessão...
      </p>
    </main>
  )
}

export function ProtectedRoute() {
  const { data: user, isPending } = useAuth()
  if (isPending) return <SessionLoading />
  if (!user) return <Navigate to="/" replace />
  return <Outlet />
}

export function PublicOnlyRoute() {
  const { data: user, isPending } = useAuth()
  const location = useLocation()
  if (isPending) return <SessionLoading />
  if (user) return <Navigate to={getAuthReturnTo(location.state)} replace />
  return <Outlet />
}
