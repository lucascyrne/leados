import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAdmin } from './components/admin/RequireAdmin'
import { RouteFallback } from './components/RouteFallback'

const HomePage = lazy(() => import('./pages/HomePage'))
const SimuladorPage = lazy(() => import('./pages/SimuladorPage'))
const QualificacaoPage = lazy(() => import('./pages/QualificacaoPage'))
const ObrigadoPage = lazy(() => import('./pages/ObrigadoPage'))
const HandoffAdemiconPage = lazy(() => import('./pages/HandoffAdemiconPage'))
const OrientacaoPage = lazy(() => import('./pages/OrientacaoPage'))
const ContatoPage = lazy(() => import('./pages/ContatoPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const AdminLoginPage = lazy(() => import('./pages/admin/LoginPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const AdminLeadsPage = lazy(() => import('./pages/admin/LeadsPage'))
const AdminLeadDetailPage = lazy(() => import('./pages/admin/LeadDetailPage'))

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/simulador" element={<SimuladorPage />} />
        <Route path="/qualificacao" element={<QualificacaoPage />} />
        <Route path="/obrigado" element={<ObrigadoPage />} />
        <Route path="/parceiro/ademicon" element={<HandoffAdemiconPage />} />
        <Route path="/orientacao" element={<OrientacaoPage />} />
        <Route path="/contato" element={<ContatoPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <RequireAdmin>
              <AdminDashboardPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/leads"
          element={
            <RequireAdmin>
              <AdminLeadsPage />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/lead/:id"
          element={
            <RequireAdmin>
              <AdminLeadDetailPage />
            </RequireAdmin>
          }
        />
      </Routes>
    </Suspense>
  )
}
