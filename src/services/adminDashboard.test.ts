import { describe, expect, it } from 'vitest'
import { getMainBottleneck, getStartIso, pct } from './adminDashboard'

describe('adminDashboard helpers', () => {
  it('returns null start for all period', () => {
    expect(getStartIso('all')).toBeNull()
  })

  it('returns zero percent when denominator is zero', () => {
    expect(pct(5, 0)).toBe(0)
  })

  it('calculates percent correctly', () => {
    expect(pct(25, 100)).toBe(25)
  })

  it('identifies the main bottleneck by highest drop ratio', () => {
    const result = getMainBottleneck(100, 60, 50, 20)
    expect(result).toBe('Handoff -> Clique parceiro')
  })
})
