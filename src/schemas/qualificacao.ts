import { z } from 'zod'

const telDigits = (s: string) => s.replace(/\D/g, '')

export const OBJETIVOS = [
  'Crédito imobiliário',
  'Veículo',
  'Investimento',
  'Outros',
] as const

export const PRAZOS_INICIO = [
  'Imediato',
  'Em até 3 meses',
  'Entre 3 e 6 meses',
  'Acima de 6 meses',
] as const

export const qualificacaoSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome completo'),
  email: z
    .string()
    .trim()
    .email('Informe um e-mail válido (ex.: nome@dominio.com)'),
  telefone: z
    .string()
    .trim()
    .refine((s) => {
      const d = telDigits(s)
      return d.length >= 10 && d.length <= 11
    }, 'Informe um telefone válido (DDD + número)'),
  renda_mensal: z
    .number({ error: 'Informe a renda mensal' })
    .positive('A renda deve ser maior que zero'),
  valor_desejado: z
    .number({ error: 'Informe o valor desejado' })
    .positive('O valor deve ser maior que zero'),
  parcela_desejada: z
    .number({ error: 'Informe a parcela desejada' })
    .positive('A parcela deve ser maior que zero'),
  objetivo: z.enum(OBJETIVOS, { error: 'Selecione o objetivo' }),
  prazo_inicio: z.enum(PRAZOS_INICIO, { error: 'Selecione o prazo' }),
  aceitar_termos: z
    .boolean()
    .refine((v) => v, 'Para continuar, confirme o aceite dos termos de uso dos dados.'),
})

export type QualificacaoValues = z.infer<typeof qualificacaoSchema>
