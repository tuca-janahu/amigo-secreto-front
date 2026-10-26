import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './features/auth/RouteGuards'
import { FeedbackWidget } from './features/feedback/FeedbackWidget'
import { AppToaster } from './components/Toast'

const HomePage = lazy(() => import('./pages/HomePage').then((module) => ({ default: module.HomePage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then((module) => ({ default: module.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const GroupPage = lazy(() => import('./pages/GroupPage').then((module) => ({ default: module.GroupPage })))
const ParticipantPage = lazy(() => import('./pages/ParticipantPage').then((module) => ({ default: module.ParticipantPage })))
const AuthenticatedParticipantPage = lazy(() => import('./pages/AuthenticatedParticipantPage').then((module) => ({ default: module.AuthenticatedParticipantPage })))

function RouteLoading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-amber-100/50 p-6 font-mono text-black">
      <p className="border-2 border-black bg-amber-400 px-5 py-3 font-black shadow-[4px_4px_0_#151515]" role="status">
        Carregando…
      </p>
    </main>
  )
}

export function App() {
  return (
    <>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/s/:token" element={<ParticipantPage />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/groups/:groupId" element={<GroupPage />} />
            <Route path="/dashboard/groups/:groupId/participation" element={<AuthenticatedParticipantPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <AppToaster />
      <FeedbackWidget />
    </>
  )
}
