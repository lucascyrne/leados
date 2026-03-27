import { useCallback, useEffect, useMemo, useState } from 'react'
import { listLeads, type ListLeadsFilters } from '../services/leads'
import type { Lead } from '../types/lead'

const defaultFilters: ListLeadsFilters = {}

export function useLeads(filters: ListLeadsFilters = defaultFilters) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters])
  const parsedFilters = useMemo(
    () => JSON.parse(filtersKey) as ListLeadsFilters,
    [filtersKey],
  )

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await listLeads(parsedFilters)
    if (err) {
      setError(err)
      setLeads([])
    } else {
      setLeads((data as Lead[]) ?? [])
    }
    setLoading(false)
  }, [parsedFilters])

  useEffect(() => {
    // Carregar quando `parsedFilters` muda; refetch coordena loading/erro/dados.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch remoto ao montar / mudar filtros
    void refetch()
  }, [refetch])

  return { leads, loading, error, refetch }
}
