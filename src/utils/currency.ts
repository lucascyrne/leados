/**
 * Valores monetários nos utilitários de negócio são `number` em **reais** (decimal),
 * não centavos inteiros.
 */

const BRL_FORMAT = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatBRL(value: number): string {
  return BRL_FORMAT.format(value)
}

/**
 * Converte texto mascarado em pt-BR (ex.: `"1.234,56"`, `"R$ 348,00"`) para reais.
 * Assume vírgula como separador decimal quando é o último separador significativo.
 */
export function parseBRLString(input: string): number {
  const trimmed = input.trim()
  if (!trimmed) return Number.NaN

  const noCurrency = trimmed.replace(/\s/g, '').replace(/R\$\s?/gi, '')
  const lastComma = noCurrency.lastIndexOf(',')
  const lastDot = noCurrency.lastIndexOf('.')

  let normalized: string
  if (lastComma > lastDot) {
    normalized = noCurrency.replace(/\./g, '').replace(',', '.')
  } else {
    normalized = noCurrency.replace(/,/g, '')
  }

  const n = Number(normalized)
  return Number.isFinite(n) ? n : Number.NaN
}
