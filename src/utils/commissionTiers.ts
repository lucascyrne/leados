/**
 * Faixas de comissão por valor do crédito (R$) e ISS sobre a comissão.
 * Fonte: docs/plan/REFERENCIA-DADOS-CANONICOS.md — não alterar sem decisão de negócio.
 */

export const ISS_SOBRE_COMISSAO_PERCENT = 16

export type CommissionTier = {
  /** Limite superior da faixa (inclusive), em reais; +∞ na última faixa. */
  limiteSuperiorInclusive: number
  comissaoPercent: number
  issSobreComissaoPercent: typeof ISS_SOBRE_COMISSAO_PERCENT
}

/** Ordenado por faixa crescente de crédito. */
export const COMMISSION_TIERS: readonly CommissionTier[] = [
  {
    limiteSuperiorInclusive: 500_000,
    comissaoPercent: 0.5,
    issSobreComissaoPercent: ISS_SOBRE_COMISSAO_PERCENT,
  },
  {
    limiteSuperiorInclusive: 1_000_000,
    comissaoPercent: 0.75,
    issSobreComissaoPercent: ISS_SOBRE_COMISSAO_PERCENT,
  },
  {
    limiteSuperiorInclusive: Number.POSITIVE_INFINITY,
    comissaoPercent: 1,
    issSobreComissaoPercent: ISS_SOBRE_COMISSAO_PERCENT,
  },
]

/**
 * Devolve a faixa de comissão aplicável ao valor do crédito (reais).
 * - `credito <= 500_000` → 0,5%
 * - `500_000 < credito <= 1_000_000` → 0,75%
 * - `credito > 1_000_000` → 1%
 */
export function getCommissionTierForCredito(credito: number): CommissionTier {
  if (!Number.isFinite(credito) || credito <= 0) {
    return COMMISSION_TIERS[0]
  }
  if (credito <= COMMISSION_TIERS[0].limiteSuperiorInclusive) {
    return COMMISSION_TIERS[0]
  }
  if (credito <= COMMISSION_TIERS[1].limiteSuperiorInclusive) {
    return COMMISSION_TIERS[1]
  }
  return COMMISSION_TIERS[2]
}

/** Exibe percentual de comissão no padrão pt-BR (ex.: 0,5). */
export function formatComissaoPercentPt(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
}
