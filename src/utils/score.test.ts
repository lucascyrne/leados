import { describe, expect, it } from 'vitest'
import { classifyLead } from './score'

describe('classifyLead', () => {
  it('HIGH nos limiares 8000 / 800', () => {
    expect(classifyLead(8000, 800, '').categoria).toBe('HIGH')
  })

  it('abaixo de HIGH em renda (7999) com parcela alta → não HIGH', () => {
    expect(classifyLead(7999, 800, '').categoria).not.toBe('HIGH')
  })

  it('abaixo de HIGH em parcela (799) com renda alta → não HIGH', () => {
    expect(classifyLead(8000, 799, '').categoria).not.toBe('HIGH')
  })

  it('LOW nos limiares 3000 / 300 com objetivo', () => {
    expect(classifyLead(3000, 300, 'imóvel').categoria).toBe('LOW')
  })

  it('renda 2999 impede LOW mesmo com objetivo', () => {
    expect(classifyLead(2999, 300, 'x').categoria).toBe('DESCARTADO')
  })

  it('parcela 299 impede LOW mesmo com objetivo', () => {
    expect(classifyLead(3000, 299, 'x').categoria).toBe('DESCARTADO')
  })

  it('objetivo vazio impede LOW (mas não HIGH)', () => {
    expect(classifyLead(5000, 500, '').categoria).toBe('DESCARTADO')
    expect(classifyLead(8000, 800, '').categoria).toBe('HIGH')
  })

  it('objetivo só espaços impede LOW', () => {
    expect(classifyLead(5000, 500, '   ').categoria).toBe('DESCARTADO')
  })

  it('faixas de score por categoria', () => {
    const high = classifyLead(20_000, 5000, '')
    expect(high.categoria).toBe('HIGH')
    expect(high.score).toBeGreaterThanOrEqual(80)
    expect(high.score).toBeLessThanOrEqual(100)

    const low = classifyLead(5000, 500, 'carro')
    expect(low.categoria).toBe('LOW')
    expect(low.score).toBeGreaterThanOrEqual(40)
    expect(low.score).toBeLessThanOrEqual(79)

    const d = classifyLead(100, 50, '')
    expect(d.categoria).toBe('DESCARTADO')
    expect(d.score).toBeGreaterThanOrEqual(0)
    expect(d.score).toBeLessThanOrEqual(39)
  })
})
