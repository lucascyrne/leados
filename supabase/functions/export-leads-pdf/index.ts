import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1'
import { createClient } from 'npm:@supabase/supabase-js@2.57.4'

type ListLeadsFilters = {
  scoreMin?: number
  scoreMax?: number
  categoria?: 'HIGH' | 'LOW' | 'DESCARTADO'
  status?: 'NOVO' | 'QUALIFICADO' | 'ENVIADO' | 'CONVERTIDO'
  valorDesejadoMin?: number
  valorDesejadoMax?: number
  q?: string
}

function formatBRL(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(value)
}

const VENDEDOR_DESTINO = 'David'

function truncate(s: string, max: number) {
  const t = s.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const authHeader = req.headers.get('Authorization') ?? ''

  if (!supabaseUrl || !serviceRole || !anonKey || !authHeader) {
    return new Response('Missing env/auth', { status: 401, headers: corsHeaders })
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const adminClient = createClient(supabaseUrl, serviceRole)

  const {
    data: { user },
  } = await userClient.auth.getUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders })
  }

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: 'user' | 'admin' }>()

  if (profile?.role !== 'admin') {
    return new Response('Forbidden', { status: 403, headers: corsHeaders })
  }

  const filters = (await req.json().catch(() => ({}))) as ListLeadsFilters

  let query = adminClient.from('leads').select('*').order('created_at', { ascending: false })
  if (filters.scoreMin != null) query = query.gte('score', filters.scoreMin)
  if (filters.scoreMax != null) query = query.lte('score', filters.scoreMax)
  if (filters.categoria) query = query.eq('categoria', filters.categoria)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.valorDesejadoMin != null) query = query.gte('valor_desejado', filters.valorDesejadoMin)
  if (filters.valorDesejadoMax != null) query = query.lte('valor_desejado', filters.valorDesejadoMax)
  if (filters.q?.trim()) {
    const term = filters.q.trim()
    query = query.or(`nome.ilike.%${term}%,email.ilike.%${term}%,telefone.ilike.%${term}%`)
  }

  const { data: leads, error } = await query
  if (error) {
    return new Response(error.message, { status: 500, headers: corsHeaders })
  }

  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  let page = pdf.addPage([842, 595])
  let y = 555
  const rowHeight = 17

  page.drawText('Leados · Relatório de leads para atendimento', {
    x: 36,
    y,
    size: 18,
    font: bold,
    color: rgb(0.35, 0.07, 0.14),
  })
  y -= 22
  page.drawText(`Vendedor: ${VENDEDOR_DESTINO} — use estes dados para contato e qualificação comercial.`, {
    x: 36,
    y,
    size: 10,
    font: bold,
    color: rgb(0.22, 0.22, 0.35),
  })
  y -= 16
  page.drawText(`Gerado em ${new Date().toLocaleString('pt-BR')}`, {
    x: 36,
    y,
    size: 9,
    font,
    color: rgb(0.28, 0.28, 0.28),
  })
  y -= 14
  page.drawText(`Total de leads neste relatório: ${leads?.length ?? 0}`, {
    x: 36,
    y,
    size: 9,
    font: bold,
    color: rgb(0.2, 0.2, 0.2),
  })
  y -= 22

  const headers = [
    'Nome',
    'E-mail',
    'Telefone',
    'Score',
    'Cat.',
    'Status',
    'Crédito',
    'Renda',
    'Parcela',
    'Prazo',
    'Cadastro',
  ]
  const xs = [36, 118, 248, 318, 352, 398, 448, 508, 568, 628, 688]
  headers.forEach((h, i) => {
    page.drawText(h, { x: xs[i]!, y, size: 7.5, font: bold, color: rgb(0.18, 0.18, 0.18) })
  })
  y -= 11

  const rows = leads ?? []
  for (const lead of rows) {
    if (y < 52) {
      page = pdf.addPage([842, 595])
      y = 555
    }
    const prazo =
      lead.prazo_inicio != null && String(lead.prazo_inicio).trim() !== ''
        ? new Date(lead.prazo_inicio as string).toLocaleDateString('pt-BR')
        : '—'
    const created = new Date(lead.created_at).toLocaleDateString('pt-BR')
    const values = [
      truncate(String(lead.nome ?? ''), 14),
      truncate(String(lead.email ?? ''), 18),
      truncate(String(lead.telefone ?? '—'), 12),
      String(lead.score),
      truncate(String(lead.categoria), 10),
      truncate(String(lead.status), 11),
      formatBRL(Number(lead.valor_desejado ?? 0)),
      formatBRL(Number(lead.renda_mensal ?? 0)),
      formatBRL(Number(lead.parcela_desejada ?? 0)),
      prazo,
      created,
    ]
    values.forEach((v, i) => {
      page.drawText(v, { x: xs[i]!, y, size: 7, font, color: rgb(0.22, 0.22, 0.22) })
    })
    y -= rowHeight
    const objLine = `Objetivo: ${truncate(String(lead.objetivo ?? ''), 118)}`
    page.drawText(objLine, { x: 36, y, size: 6.5, font, color: rgb(0.28, 0.28, 0.28) })
    y -= 11
  }

  const bytes = await pdf.save()
  return new Response(bytes, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="leads.pdf"',
      'Cache-Control': 'no-store',
    },
  })
})
