import { describe, expect, it } from 'vitest'
import {
  estimateCreditoForParcela,
  estimateParcelaForCredito,
} from './parcelEstimate'

describe('estimateParcelaForCredito', () => {
  it.each([
    [50_000, 348],
    [80_000, 451.6],
    [100_000, 337.3],
    [120_000, 677.4],
    [200_000, 674.6],
    [500_000, 1800],
    [800_000, 2880],
  ] as const)('crédito oficial %i → parcela %s', (c, p) => {
    expect(estimateParcelaForCredito(c)).toBe(p)
  })

  it('interpola entre 80k e 100k (90k)', () => {
    expect(estimateParcelaForCredito(90_000)).toBe(394.45)
  })
})

describe('estimateCreditoForParcela', () => {
  it.each([
    [50_000, 348],
    [80_000, 451.6],
    [100_000, 337.3],
    [120_000, 677.4],
    [200_000, 674.6],
    [500_000, 1800],
    [800_000, 2880],
  ] as const)('parcela oficial %s → crédito %i', (c, p) => {
    expect(estimateCreditoForParcela(p)).toBe(c)
  })

  it('inverso da interpolação 90k ↔ 394,45', () => {
    expect(estimateCreditoForParcela(394.45)).toBe(90_000)
  })
})
