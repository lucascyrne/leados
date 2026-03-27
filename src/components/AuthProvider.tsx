import type { Session } from '@supabase/supabase-js'
import { useEffect } from 'react'
import { getMyRole } from '../services/profiles'
import { supabase } from '../services/supabaseClient'
import { useAuthStore } from '../store/authStore'

type AuthProviderProps = {
  children: React.ReactNode
}

/** Uma subscrição global a `onAuthStateChange`; o estado espelha-se em `authStore`. */
export function AuthProvider({ children }: AuthProviderProps) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    let cancelled = false

    async function syncSession(session: Session | null) {
      const role = session?.user ? await getMyRole(session.user.id) : null
      if (cancelled) return
      setAuth(session, role)
      setLoading(false)
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      void syncSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [setAuth, setLoading])

  return children
}
