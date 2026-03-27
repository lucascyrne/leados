import { describe, expect, it } from 'vitest'
import { formatBRL, parseBRLString } from './currency'

describe('currency', () => {
  it('formatBRL', () => {
    expect(formatBRL(1234.5)).toMatch(/1\.234,50/)
  })

  it('parseBRLString pt-BR', () => {
    expect(parseBRLString('1.234,56')).toBe(1234.56)
    expect(parseBRLString('R$ 348,00')).toBe(348)
    expect(parseBRLString('')).toBeNaN()
  })
})
