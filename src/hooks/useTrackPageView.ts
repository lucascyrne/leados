import { useEffect, useRef } from 'react'
import { logInteracao } from '../services/interacoes'

/**
 * Regista visualização de página em `interacoes` (uma vez por montagem).
 */
export function useTrackPageView(path: string) {
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    done.current = true
    void logInteracao({
      tipo: 'page_view',
      payload: { path },
    }).then(
      () => {},
      () => {},
    )
  }, [path])
}
