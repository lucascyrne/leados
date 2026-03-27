import type { ListLeadsFilters } from './leads'
import { supabase } from './supabaseClient'

export async function exportLeadsPdf(filters: ListLeadsFilters) {
  const { data: sessionData } = await supabase.auth.getSession()
  let accessToken = sessionData.session?.access_token

  if (sessionData.session?.refresh_token) {
    const { data: refreshed } = await supabase.auth.refreshSession()
    if (refreshed.session?.access_token) accessToken = refreshed.session.access_token
  }

  if (!accessToken) {
    return {
      error: new Error('Sessão expirada. Entre novamente para exportar o PDF.'),
    }
  }

  const { data, error } = await supabase.functions.invoke('export-leads-pdf', {
    body: filters,
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (error) return { error }

  const blob =
    data instanceof Blob
      ? data
      : new Blob([typeof data === 'string' ? data : JSON.stringify(data)], {
          type: 'application/pdf',
        })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)

  return { error: null }
}
