import type { ClassificacaoResult } from '../types/lead'

/**
 * Score mínimo para seguir ao handoff oficial do parceiro.
 * Mantido como constante para facilitar calibração de conversão.
 */
export const PARTNER_HANDOFF_MIN_SCORE = 70

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

/**
 * Classificação e score 0–100 (determinístico).
 *
 * **Categoria** (ordem fixa, espelho da referência canónica):
 * 1. HIGH: renda ≥ 8000 e parcela ≥ 800
 * 2. LOW: se não HIGH; renda ≥ 3000 e parcela ≥ 300 e objetivo com trim não vazio
 * 3. DESCARTADO: restantes
 *
 * **Score** (faixas por categoria):
 * - HIGH: 80–100 — quanto mais acima dos limiares 8000 / 800, mais próximo de 100
 *   (normalização em 12k renda e 4,2k parcela acima do mínimo HIGH).
 * - LOW: 40–79 — proximidade aos tetos antes de HIGH (renda 3k–8k, parcela 300–800).
 * - DESCARTADO: 0–39 — “proximidade” aos limiares HIGH; se faltar só objetivo para LOW,
 *   bónus parcial para refletir renda/parcela já qualificáveis.
 */
export function classifyLead(
  renda: number,
  parcela: number,
  objetivo: string,
): ClassificacaoResult {
  const objOk = objetivo.trim().length > 0

  if (renda >= 8000 && parcela >= 800) {
    const u = clamp((renda - 8000) / 12_000, 0, 1)
    const v = clamp((parcela - 800) / 4200, 0, 1)
    const score = Math.round(80 + 20 * (u + v) / 2)
    return { score: clamp(score, 80, 100), categoria: 'HIGH' }
  }

  if (renda >= 3000 && parcela >= 300 && objOk) {
    const u = clamp((renda - 3000) / 5000, 0, 1)
    const v = clamp((parcela - 300) / 500, 0, 1)
    const score = Math.round(40 + 39 * (u + v) / 2)
    return { score: clamp(score, 40, 79), categoria: 'LOW' }
  }

  let s =
    39 *
    ((clamp(renda / 8000, 0, 1) + clamp(parcela / 800, 0, 1)) / 2)

  if (renda >= 3000 && parcela >= 300 && !objOk) {
    const u = clamp((renda - 3000) / 5000, 0, 1)
    const v = clamp((parcela - 300) / 500, 0, 1)
    s = Math.max(s, 28 + 11 * (u + v) / 2)
  }

  return {
    score: clamp(Math.round(s), 0, 39),
    categoria: 'DESCARTADO',
  }
}
