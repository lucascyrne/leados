/**
 * Tabela oficial crédito (R$) → parcela mensal (R$).
 * Fonte: `docs/plan/REFERENCIA-DADOS-CANONICOS.md` (parcelas e comissões) — não alterar sem decisão de negócio.
 */
export const CREDIT_PARCEL_PAIRS = [
  { credito: 50_000, parcela: 348 },
  { credito: 80_000, parcela: 451.6 },
  { credito: 100_000, parcela: 337.3 },
  { credito: 120_000, parcela: 677.4 },
  { credito: 200_000, parcela: 674.6 },
  { credito: 500_000, parcela: 1800 },
  { credito: 800_000, parcela: 2880 },
] as const

/** Mesmos pares, ordenados por crédito crescente (para UI e interpolação). */
export const CREDIT_PARCEL_PAIRS_SORTED = [...CREDIT_PARCEL_PAIRS].sort(
  (a, b) => a.credito - b.credito,
)

export type CreditParcelPair = (typeof CREDIT_PARCEL_PAIRS)[number]

/** Parcela oficial apenas quando o crédito coincide exatamente com uma linha da tabela. */
export function getParcelaForCredito(credito: number): number | undefined {
  const row = CREDIT_PARCEL_PAIRS.find((p) => p.credito === credito)
  return row?.parcela
}

/** Lista ordenada por crédito (ex.: selects no simulador). */
export function listCreditParcelPairsSorted(): readonly CreditParcelPair[] {
  return CREDIT_PARCEL_PAIRS_SORTED
}
