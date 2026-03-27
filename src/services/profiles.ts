import { supabase } from './supabaseClient'

export async function getMyRole(userId: string): Promise<'user' | 'admin' | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single<{ role: 'user' | 'admin' }>()

  if (error || !data) return null
  return data.role
}
