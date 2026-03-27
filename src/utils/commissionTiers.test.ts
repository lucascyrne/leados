import { describe, expect, it } from 'vitest'
import {
  COMMISSION_TIERS,
  getCommissionTierForCredito,
  ISS_SOBRE_COMISSAO_PERCENT,
} from './commissionTiers'

describe('getCommissionTierForCredito', () => {
  it('usa 0,5% até 500 mil (inclusive)', () => {
    expect(getCommissionTierForCredito(1).comissaoPercent).toBe(0.5)
    expect(getCommissionTierForCredito(500_000).comissaoPercent).toBe(0.5)
  })

  it('usa 0,75% acima de 500 mil até 1 milhão (inclusive)', () => {
    expect(getCommissionTierForCredito(500_001).comissaoPercent).toBe(0.75)
    expect(getCommissionTierForCredito(750_000).comissaoPercent).toBe(0.75)
    expect(getCommissionTierForCredito(1_000_000).comissaoPercent).toBe(0.75)
  })

  it('usa 1% acima de 1 milhão', () => {
    expect(getCommissionTierForCredito(1_000_001).comissaoPercent).toBe(1)
    expect(getCommissionTierForCredito(2_000_000).comissaoPercent).toBe(1)
  })

  it('ISS constante 16% em todas as faixas', () => {
    for (const t of COMMISSION_TIERS) {
      expect(t.issSobreComissaoPercent).toBe(ISS_SOBRE_COMISSAO_PERCENT)
    }
  })
})
