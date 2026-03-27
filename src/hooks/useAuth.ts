import type { AuthError } from '@supabase/supabase-js'
import { useCallback } from 'react'
import { getMyRole } from '../services/profiles'
import { supabase } from '../services/supabaseClient'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const session = useAuthStore((s) => s.session)
  const role = useAuthStore((s) => s.role)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const loading = useAuthStore((s) => s.loading)

  const signIn = useCallback(async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { error: error as AuthError | null, isAdmin: false }
    }
    const userId = data.user?.id
    const role = userId ? await getMyRole(userId) : null
    return { error: null, isAdmin: role === 'admin' }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return { user, session, role, isAdmin, loading, signIn, signOut }
}
