import { Loader2 } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

type RequireAdminProps = {
  children: React.ReactNode
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const { loading, user, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="bg-background flex min-h-[40vh] items-center justify-center">
        <Loader2 className="text-primary size-10 animate-spin" aria-label="A carregar" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ forbidden: true }} />
  }

  return <>{children}</>
}
