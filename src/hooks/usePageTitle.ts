import { useLayoutEffect } from 'react'

const BASE = 'Leados'

/** Atualiza `document.title` para SEO/acessibilidade do separador (rotas públicas). */
export function usePageTitle(pageTitle: string) {
  useLayoutEffect(() => {
    const prev = document.title
    document.title = `${pageTitle} · ${BASE}`
    return () => {
      document.title = prev
    }
  }, [pageTitle])
}
