import type { Session, User } from '@supabase/supabase-js'
import { create } from 'zustand'

type AuthRole = 'user' | 'admin' | null

type AuthState = {
  user: User | null
  session: Session | null
  role: AuthRole
  isAdmin: boolean
  loading: boolean
  setAuth: (session: Session | null, role: AuthRole) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  role: null,
  isAdmin: false,
  loading: true,
  setAuth: (session, role) =>
    set({
      session,
      user: session?.user ?? null,
      role,
      isAdmin: role === 'admin',
    }),
  setLoading: (loading) => set({ loading }),
}))
