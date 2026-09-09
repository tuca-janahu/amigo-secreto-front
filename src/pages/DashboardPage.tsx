import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PixelBrand } from '../components/PixelBrand'
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
      navigate('/', { replace: true })
    }
  }

  return (
    <main className="min-h-screen bg-white px-5 py-6 font-mono text-black sm:px-8 lg:px-14">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4"><PixelBrand /><button className="border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0_#151515] transition enabled:hover:bg-green-900 disabled:opacity-60" type="button" onClick={handleLogout} disabled={isLeaving}>{isLeaving ? 'Saindo...' : 'Sair'}</button></header>
      <section className="mx-auto max-w-6xl py-16" aria-labelledby="dashboard-title">
        <p className="inline-block border-2 border-black bg-green-900 px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0_#151515]">Area do jogador</p>
        <h1 id="dashboard-title" className="mt-6 max-w-3xl text-4xl leading-[0.95] font-black tracking-[-0.07em] sm:text-6xl">Olá, {user?.email}</h1>
        <div className="mt-10 grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
          <section className="border-2 border-black bg-white p-6 shadow-[6px_6px_0_#151515] sm:p-8"><span className="inline-block border-2 border-black bg-red-600 px-2 py-1 text-xs font-black text-white">EM BREVE</span><h2 className="mt-5 text-2xl font-black uppercase">Seus grupos vão aparecer aqui.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-black/70">Quando a criação de grupos estiver disponível, este será o seu painel para acompanhar cada sorteio.</p></section>
          <aside className="border-2 border-black bg-green-900 p-6 shadow-[6px_6px_0_#151515]"><p className="text-xs font-black uppercase tracking-wider">Próximo passo</p><p className="mt-4 text-lg font-black leading-6">Prepare a turma para o próximo amigo secreto.</p><div className="mt-6 grid size-16 place-items-center border-2 border-black bg-green-900 text-3xl font-black text-white shadow-[4px_4px_0_#151515]">?</div></aside>
        </div>
      </section>
    </main>
  )
}
