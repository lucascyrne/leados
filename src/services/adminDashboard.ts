import { supabase } from './supabaseClient'

export type DashboardPeriod = 'today' | '7d' | '30d' | 'all'

export type DashboardMetrics = {
  simulacaoIniciada: number
  qualificacaoEnviada: number
  handoffViewed: number
  parceiroClicked: number
  leadValidado: number
  taxaHandoff: number
  taxaCliqueParceiro: number
  tempoMedioContatoHoras: number | null
  volumePorObjetivo: Array<{ objetivo: string; total: number }>
  consentPendentes: number
  duplicadosBloqueados: number
  principalGargalo: string
}

type LeadLite = {
  id: string
  status: string
  created_at: string
  objetivo: string
}

type InteracaoLite = {
  tipo: string
  created_at: string
}

export function getStartIso(period: DashboardPeriod) {
  if (period === 'all') return null
  const now = new Date()
  if (period === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  }
  const days = period === '7d' ? 7 : 30
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
}

export function pct(numerator: number, denominator: number) {
  if (denominator <= 0) return 0
  return (numerator / denominator) * 100
}

export function getMainBottleneck(
  simulacaoIniciada: number,
  qualificacaoEnviada: number,
  handoffViewed: number,
  parceiroClicked: number,
) {
  const steps = [
    {
      label: 'Simulação -> Qualificação',
      drop: simulacaoIniciada - qualificacaoEnviada,
      base: simulacaoIniciada,
    },
    {
      label: 'Qualificação -> Handoff',
      drop: qualificacaoEnviada - handoffViewed,
      base: qualificacaoEnviada,
    },
    {
      label: 'Handoff -> Clique parceiro',
      drop: handoffViewed - parceiroClicked,
      base: handoffViewed,
    },
  ]
  const ranked = steps
    .map((s) => ({ ...s, ratio: s.base > 0 ? s.drop / s.base : 0 }))
    .sort((a, b) => b.ratio - a.ratio)

  return ranked[0]?.label ?? 'Sem dados suficientes'
}

export async function getDashboardMetrics(period: DashboardPeriod): Promise<DashboardMetrics> {
  const startIso = getStartIso(period)

  let leadsQuery = supabase.from('leads').select('id,status,created_at,objetivo')
  let interacoesQuery = supabase.from('interacoes').select('tipo,created_at')

  if (startIso) {
    leadsQuery = leadsQuery.gte('created_at', startIso)
    interacoesQuery = interacoesQuery.gte('created_at', startIso)
  }

  const [{ data: leadsData, error: leadsError }, { data: interacoesData, error: interacoesError }] =
    await Promise.all([leadsQuery, interacoesQuery])

  if (leadsError) throw leadsError
  if (interacoesError) throw interacoesError

  const leads = (leadsData ?? []) as LeadLite[]
  const interacoes = (interacoesData ?? []) as InteracaoLite[]

  const byTipo = new Map<string, number>()
  for (const i of interacoes) {
    byTipo.set(i.tipo, (byTipo.get(i.tipo) ?? 0) + 1)
  }

  const simulacaoIniciada = byTipo.get('simulador_submit') ?? 0
  const qualificacaoEnviada = byTipo.get('lead_created') ?? 0
  const handoffViewed = byTipo.get('ademicon_handoff_viewed') ?? 0
  const parceiroClicked = byTipo.get('ademicon_link_clicked') ?? 0
  const termosAceitos = byTipo.get('ademicon_terms_accepted') ?? 0
  const duplicadosBloqueados = byTipo.get('lead_duplicate_blocked') ?? 0

  const leadValidado = leads.filter((l) => l.status === 'ENVIADO' || l.status === 'CONVERTIDO').length
  const taxaHandoff = pct(handoffViewed, qualificacaoEnviada)
  const taxaCliqueParceiro = pct(parceiroClicked, handoffViewed)

  const byObjetivo = new Map<string, number>()
  for (const lead of leads) {
    byObjetivo.set(lead.objetivo, (byObjetivo.get(lead.objetivo) ?? 0) + 1)
  }

  const volumePorObjetivo = Array.from(byObjetivo.entries())
    .map(([objetivo, total]) => ({ objetivo, total }))
    .sort((a, b) => b.total - a.total)

  const consentPendentes = Math.max(qualificacaoEnviada - termosAceitos, 0)

  return {
    simulacaoIniciada,
    qualificacaoEnviada,
    handoffViewed,
    parceiroClicked,
    leadValidado,
    taxaHandoff,
    taxaCliqueParceiro,
    tempoMedioContatoHoras: null,
    volumePorObjetivo,
    consentPendentes,
    duplicadosBloqueados,
    principalGargalo: getMainBottleneck(
      simulacaoIniciada,
      qualificacaoEnviada,
      handoffViewed,
      parceiroClicked,
    ),
  }
}
