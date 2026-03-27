import type { Json } from '../types/database'
import { supabase } from './supabaseClient'
import { getTrackingContext } from './tracking'

export type LogInteracaoInput = {
  leadId?: string | null
  tipo: string
  payload?: Json | null
  idempotencyKey?: string
}

function enrichPayload(
  payload: Json | null | undefined,
  idempotencyKey?: string,
): Json {
  const tracking = getTrackingContext()

  const baseMeta: Json = {
    ...tracking,
    idempotency_key: idempotencyKey ?? null,
  }

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return {
      ...payload,
      _meta: baseMeta,
    }
  }

  return {
    value: payload ?? null,
    _meta: baseMeta,
  }
}

export function logInteracao(input: LogInteracaoInput) {
  return supabase.from('interacoes').insert({
    lead_id: input.leadId ?? null,
    tipo: input.tipo,
    payload: enrichPayload(input.payload, input.idempotencyKey),
  })
}
