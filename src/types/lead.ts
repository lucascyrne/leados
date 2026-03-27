/** Categoria persistida (alinhado à referência canónica). */
export type CategoriaLead = 'HIGH' | 'LOW' | 'DESCARTADO'

/** Estados de workflow (schema `leads.status`). */
export type StatusLead =
  | 'NOVO'
  | 'QUALIFICADO'
  | 'ENVIADO'
  | 'CONVERTIDO'

/** Linha da tabela `public.leads`. */
export type Lead = {
  id: string
  created_at: string
  nome: string
  email: string
  telefone: string | null
  renda_mensal: number
  valor_desejado: number
  parcela_desejada: number
  objetivo: string
  prazo_inicio: string | null
  score: number
  categoria: CategoriaLead
  status: StatusLead
  partner_name?: string | null
  partner_agent_name?: string | null
  partner_link?: string | null
  consent_lgpd?: boolean | null
  consent_text_version?: string | null
  handoff_status?: 'pending' | 'viewed' | 'clicked' | 'completed' | 'abandoned' | null
}

/** Entrada típica do simulador / qualificação (núcleo numérico). */
export type LeadQualificacaoInput = {
  renda_mensal: number
  parcela_desejada: number
  objetivo: string
  credito_desejado?: number
}

/** Resultado da função de classificação (Fase 1). */
export type ClassificacaoResult = {
  score: number
  categoria: CategoriaLead
}
