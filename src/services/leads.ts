import type { CategoriaLead, Lead, StatusLead } from '../types/lead'
import { supabase } from './supabaseClient'

export type CreateLeadInput = {
  nome: string
  email: string
  telefone?: string | null
  renda_mensal: number
  valor_desejado: number
  parcela_desejada: number
  objetivo: string
  prazo_inicio?: string | null
  score: number
  categoria: CategoriaLead
  partner_name?: string | null
  partner_agent_name?: string | null
  partner_link?: string | null
  consent_lgpd?: boolean | null
  consent_text_version?: string | null
  handoff_status?: 'pending' | 'viewed' | 'clicked' | 'completed' | 'abandoned' | null
}

export type ListLeadsFilters = {
  scoreMin?: number
  scoreMax?: number
  categoria?: CategoriaLead
  status?: StatusLead
  valorDesejadoMin?: number
  valorDesejadoMax?: number
  q?: string
}

export function createLead(input: CreateLeadInput) {
  return supabase
    .rpc('create_public_lead', {
      p_nome: input.nome,
      p_email: input.email,
      p_telefone: input.telefone ?? null,
      p_renda_mensal: input.renda_mensal,
      p_valor_desejado: input.valor_desejado,
      p_parcela_desejada: input.parcela_desejada,
      p_objetivo: input.objetivo,
      p_prazo_inicio: input.prazo_inicio ?? null,
      p_score: input.score,
      p_categoria: input.categoria,
    })
    .single<Lead>()
}

export function listLeads(filters: ListLeadsFilters = {}) {
  let q = supabase.from('leads').select('*').order('created_at', { ascending: false })

  if (filters.scoreMin != null) q = q.gte('score', filters.scoreMin)
  if (filters.scoreMax != null) q = q.lte('score', filters.scoreMax)
  if (filters.categoria != null) q = q.eq('categoria', filters.categoria)
  if (filters.status != null) q = q.eq('status', filters.status)
  if (filters.valorDesejadoMin != null) {
    q = q.gte('valor_desejado', filters.valorDesejadoMin)
  }
  if (filters.valorDesejadoMax != null) {
    q = q.lte('valor_desejado', filters.valorDesejadoMax)
  }
  if (filters.q?.trim()) {
    const term = filters.q.trim()
    q = q.or(`nome.ilike.%${term}%,email.ilike.%${term}%,telefone.ilike.%${term}%`)
  }

  return q
}

export function getLeadById(id: string) {
  return supabase.from('leads').select('*').eq('id', id).single<Lead>()
}

export function updateLeadStatus(id: string, status: StatusLead) {
  return supabase
    .from('leads')
    .update({ status })
    .eq('id', id)
    .select()
    .single<Lead>()
}
