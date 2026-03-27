import {
  CREDIT_PARCEL_PAIRS,
  CREDIT_PARCEL_PAIRS_SORTED,
  getParcelaForCredito,
} from './creditTable'

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Arredonda para 2 casas (centavos de real). */
function roundMoney(n: number): number {
  return Math.round(n * 100) / 100
}

function roundCredito(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Parcela mensal estimada para um valor de crédito.
 * - Se o crédito existir na tabela, devolve **sempre** a parcela oficial.
 * - Caso contrário, interpolação linear no segmento entre vizinhos imediatos
 *   na ordenação por crédito; abaixo do menor ponto usa a reta dos dois
 *   menores créditos (extrapolação); acima do maior, reta dos dois maiores.
 */
export function estimateParcelaForCredito(credito: number): number {
  const exact = getParcelaForCredito(credito)
  if (exact !== undefined) return exact

  const pts = CREDIT_PARCEL_PAIRS_SORTED
  const n = pts.length
  if (n === 0) return Number.NaN

  if (credito <= pts[0].credito) {
    if (n === 1) return pts[0].parcela
    const t =
      (credito - pts[0].credito) / (pts[1].credito - pts[0].credito)
    return roundMoney(lerp(pts[0].parcela, pts[1].parcela, t))
  }

  if (credito >= pts[n - 1].credito) {
    if (n === 1) return pts[0].parcela
    const t =
      (credito - pts[n - 2].credito) / (pts[n - 1].credito - pts[n - 2].credito)
    return roundMoney(lerp(pts[n - 2].parcela, pts[n - 1].parcela, t))
  }

  let i = 0
  while (i < n - 1 && pts[i + 1].credito < credito) i += 1

  const a = pts[i]
  const b = pts[i + 1]
  const t = (credito - a.credito) / (b.credito - a.credito)
  return roundMoney(lerp(a.parcela, b.parcela, t))
}

const PARCELA_MIN_TABELA = Math.min(...CREDIT_PARCEL_PAIRS.map((p) => p.parcela))
const PARCELA_MAX_TABELA = Math.max(...CREDIT_PARCEL_PAIRS.map((p) => p.parcela))

/**
 * Crédito estimado para uma parcela mensal alvo (inverso da função por segmentos).
 * Espelha os mesmos segmentos lineares de `estimateParcelaForCredito`, com extrapolação
 * nos extremos (primeiro e último segmento por crédito ordenado).
 *
 * Quando vários créditos distintos produzem a mesma parcela (curva não monótona),
 * escolhe-se o crédito do **segmento mediano** (por índice na ordenação por crédito),
 * para simetria com interpolações centrais (ex.: 90k ↔ 394,45).
 */
export function estimateCreditoForParcela(parcela: number): number {
  const eps = 1e-6
  const matchEps = 0.02

  for (const p of CREDIT_PARCEL_PAIRS) {
    if (Math.abs(p.parcela - parcela) < eps) return p.credito
  }

  const pts = CREDIT_PARCEL_PAIRS_SORTED
  const n = pts.length

  function solve(i: number, j: number): number {
    const c0 = pts[i].credito
    const p0 = pts[i].parcela
    const c1 = pts[j].credito
    const p1 = pts[j].parcela
    const dp = p1 - p0
    if (Math.abs(dp) < 1e-12) return Number.NaN
    return c0 + ((parcela - p0) / dp) * (c1 - c0)
  }

  const bySegment: { seg: number; c: number }[] = []

  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i].parcela
    const p1 = pts[i + 1].parcela
    const lo = Math.min(p0, p1) - eps
    const hi = Math.max(p0, p1) + eps
    if (parcela < lo || parcela > hi) continue
    const c0 = pts[i].credito
    const c1 = pts[i + 1].credito
    const c = solve(i, i + 1)
    const cLo = Math.min(c0, c1) - eps
    const cHi = Math.max(c0, c1) + eps
    if (c < cLo || c > cHi) continue
    if (Math.abs(estimateParcelaForCredito(c) - parcela) > matchEps) continue
    bySegment.push({ seg: i, c: roundCredito(c) })
  }

  if (bySegment.length > 0) {
    bySegment.sort((a, b) => a.seg - b.seg)
    const mid = Math.floor((bySegment.length - 1) / 2)
    return bySegment[mid].c
  }

  if (parcela < PARCELA_MIN_TABELA - eps) {
    return roundCredito(solve(0, 1))
  }
  if (parcela > PARCELA_MAX_TABELA + eps) {
    return roundCredito(solve(n - 2, n - 1))
  }

  let best = Number.NaN
  let bestErr = Number.POSITIVE_INFINITY
  for (let i = 0; i < n - 1; i++) {
    const c = solve(i, i + 1)
    if (!Number.isFinite(c)) continue
    const err = Math.abs(estimateParcelaForCredito(c) - parcela)
    if (err < bestErr) {
      bestErr = err
      best = c
    }
  }
  return roundCredito(best)
}
