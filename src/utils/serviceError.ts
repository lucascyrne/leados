import type { PostgrestError } from '@supabase/supabase-js'

function isPostgrestError(e: unknown): e is PostgrestError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'message' in e &&
    typeof (e as PostgrestError).message === 'string'
  )
}

/** Mensagem curta para o utilizador (toast/callout), sem detalhes técnicos. */
export function userFacingError(
  error: unknown,
  fallback = 'Não foi possível concluir o pedido. Tente novamente.',
): string {
  if (isPostgrestError(error)) {
    const code = error.code
    const msg = error.message ?? ''
    if (code === 'PGRST301' || /jwt|session/i.test(msg)) {
      return 'Sessão inválida ou expirada. Inicie sessão novamente.'
    }
    if (code === '42501' || /rls|policy|permission/i.test(msg)) {
      return 'Não tem permissão para esta operação.'
    }
    if (msg.length > 0 && msg.length < 200) {
      return msg
    }
  }
  if (error instanceof Error && error.message) {
    return error.message.length < 200
      ? error.message
      : fallback
  }
  return fallback
}

/** Descrição para toast: mensagem humana; em dev acrescenta detalhe técnico. */
export function toastDescriptionForError(
  error: unknown,
  fallback: string,
): string {
  const human = userFacingError(error, fallback)
  if (import.meta.env.DEV) {
    const tech =
      isPostgrestError(error) || error instanceof Error
        ? String((error as Error).message ?? error)
        : String(error)
    return `${human}\n\n[dev] ${tech}`
  }
  return human
}
