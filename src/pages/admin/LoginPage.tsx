import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { userFacingError } from '@/utils/serviceError'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, loading, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const forbidden = (location.state as { forbidden?: boolean } | null)?.forbidden

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setErro(null)
    setSubmitting(true)
    try {
      const { error, isAdmin } = await signIn(email.trim(), password)
      if (error) {
        setErro(userFacingError(error, 'Não foi possível iniciar sessão.'))
        return
      }
      if (!isAdmin) {
        await signOut()
        setErro('Esta conta não possui permissão de administrador.')
        return
      }
      navigate('/admin/dashboard', { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-background text-foreground mx-auto max-w-sm p-6">
      <h1 className="mb-6 text-center text-2xl font-semibold">Admin · Login</h1>
      {forbidden ? (
        <p className="text-destructive mb-4 text-sm" role="alert">
          Esta conta não possui permissão de administrador.
        </p>
      ) : null}
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1.5 text-left text-sm">
          <span>E-mail</span>
          <Input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-left text-sm">
          <span>Senha</span>
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {erro ? (
          <p className="text-destructive text-sm" role="alert">
            {erro}
          </p>
        ) : null}
        <Button type="submit" disabled={loading || submitting}>
          {submitting ? 'A entrar…' : 'Entrar'}
        </Button>
      </form>
    </div>
  )
}
