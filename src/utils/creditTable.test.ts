import { describe, expect, it } from 'vitest'
import {
  CREDIT_PARCEL_PAIRS,
  getParcelaForCredito,
  listCreditParcelPairsSorted,
} from './creditTable'

describe('creditTable', () => {
  it('mantém os 7 pares exatos da referência', () => {
    expect(CREDIT_PARCEL_PAIRS).toEqual([
      { credito: 50_000, parcela: 348 },
      { credito: 80_000, parcela: 451.6 },
      { credito: 100_000, parcela: 337.3 },
      { credito: 120_000, parcela: 677.4 },
      { credito: 200_000, parcela: 674.6 },
      { credito: 500_000, parcela: 1800 },
      { credito: 800_000, parcela: 2880 },
    ])
  })

  it.each([
    [50_000, 348],
    [80_000, 451.6],
    [100_000, 337.3],
    [120_000, 677.4],
    [200_000, 674.6],
    [500_000, 1800],
    [800_000, 2880],
  ] as const)('getParcelaForCredito(%i) → %s', (c, p) => {
    expect(getParcelaForCredito(c)).toBe(p)
  })

  it('listCreditParcelPairsSorted ordena por crédito', () => {
    const list = listCreditParcelPairsSorted()
    for (let i = 1; i < list.length; i++) {
      expect(list[i].credito).toBeGreaterThan(list[i - 1].credito)
    }
  })
})
