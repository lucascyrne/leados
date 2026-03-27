// @ts-expect-error Deno edge runtime supports npm: specifiers.
import { createClient } from 'npm:@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type NotifyBody = {
  jobId: string
  leadId?: string | null
  idempotencyKey: string
  payload: Record<string, unknown>
}

function asText(v: unknown, fallback = '-') {
  if (typeof v === 'string' && v.trim()) return v.trim()
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return fallback
}

function formatMoney(v: unknown) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return '-'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function buildCallMeBotMessage(payload: Record<string, unknown>) {
  const nome = asText(payload.nome)
  const telefone = asText(payload.telefone)
  const investimento = asText(payload.investimento)
  const credito = formatMoney(payload.faixa_credito)
  const parcela = formatMoney(payload.faixa_parcela)
  const score = asText(payload.score)
  const categoria = asText(payload.categoria)
  const origem = asText(payload.origem)
  const adminUrl = asText(payload.link_admin, '')

  const lines = [
    'Novo lead qualificado por score',
    `Nome: ${nome}`,
    `Telefone: ${telefone}`,
    `Investimento: ${investimento}`,
    `Credito: ${credito}`,
    `Parcela: ${parcela}`,
    `Score/Categoria: ${score} / ${categoria}`,
    `Origem: ${origem}`,
  ]

  if (adminUrl) lines.push(`Admin: ${adminUrl}`)
  return lines.join('\n')
}

function normalizeCallMeBotPhone(raw: string) {
  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return raw
  return raw.trim().startsWith('+') ? `+${digits}` : `+${digits}`
}

function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString()
}

function calcNextRetry(attempts: number) {
  const delayByAttempt = [1, 3, 8]
  const min = delayByAttempt[Math.max(0, Math.min(attempts - 1, delayByAttempt.length - 1))]
  return addMinutes(new Date().toISOString(), min)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const callMeBotPhone = Deno.env.get('CALLMEBOT_PHONE') ?? ''
  const callMeBotApiKey = Deno.env.get('CALLMEBOT_APIKEY') ?? ''

  if (!supabaseUrl || !serviceRole) {
    return new Response(JSON.stringify({ error: 'Missing env configuration' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const adminClient = createClient(supabaseUrl, serviceRole)
  const body = (await req.json().catch(() => null)) as NotifyBody | null

  if (!body?.jobId || !body?.idempotencyKey || !body?.payload) {
    return new Response(JSON.stringify({ error: 'Invalid payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const { data: job, error: fetchError } = await adminClient
    .from('notification_jobs')
    .select('id,attempts,max_attempts,status')
    .eq('id', body.jobId)
    .single<{
      id: string
      attempts: number
      max_attempts: number
      status: 'pending' | 'retrying' | 'sent' | 'failed' | 'dead_letter'
    }>()

  if (fetchError || !job) {
    return new Response(JSON.stringify({ error: 'Notification job not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (job.status === 'sent' || job.status === 'dead_letter') {
    return new Response(JSON.stringify({ ok: true, skipped: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const attempts = job.attempts + 1

  try {
    if (!callMeBotPhone || !callMeBotApiKey) {
      throw new Error('Configure CALLMEBOT_PHONE e CALLMEBOT_APIKEY.')
    }

    const message = buildCallMeBotMessage(body.payload)
    const endpoint = new URL('https://api.callmebot.com/whatsapp.php')
    endpoint.searchParams.set('phone', normalizeCallMeBotPhone(callMeBotPhone))
    endpoint.searchParams.set('text', message)
    endpoint.searchParams.set('apikey', callMeBotApiKey)

    const resp = await fetch(endpoint.toString(), { method: 'GET' })
    const responseText = await resp.text()
    // #region agent log
    fetch('http://127.0.0.1:7852/ingest/306754ad-509d-455f-acd3-0fedd05bf34f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'aaddc1'},body:JSON.stringify({sessionId:'aaddc1',runId:'pre-fix',hypothesisId:'H5',location:'notify-intermediador:index.ts:callmebotResponse',message:'CallMeBot HTTP response received',data:{jobId:body.jobId,httpStatus:resp.status,responseSnippet:responseText.slice(0,180)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    // CallMeBot pode retornar 203 para erros de credencial; tratamos sucesso apenas em 200.
    if (!resp.ok || resp.status !== 200) {
      throw new Error(`CallMeBot HTTP error: ${resp.status} body=${responseText.slice(0, 200)}`)
    }
    const lower = responseText.toLowerCase()
    if (
      lower.includes('error') ||
      lower.includes('invalid') ||
      lower.includes('api key not valid') ||
      lower.includes('apikey is invalid') ||
      lower.includes('api not activated') ||
      lower.includes('phone number not valid') ||
      lower.includes('you need to activate')
    ) {
      throw new Error(`CallMeBot body error: ${responseText.slice(0, 200)}`)
    }

    const { error: updateError } = await adminClient
      .from('notification_jobs')
      .update({
        attempts,
        status: 'sent',
        sent_at: new Date().toISOString(),
        last_error: null,
      })
      .eq('id', body.jobId)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ ok: true, status: 'sent' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const maxAttempts = job.max_attempts
    const deadLetter = attempts >= maxAttempts
    const nextRetryAt = deadLetter ? null : calcNextRetry(attempts)

    await adminClient
      .from('notification_jobs')
      .update({
        attempts,
        status: deadLetter ? 'dead_letter' : 'retrying',
        next_retry_at: nextRetryAt,
        last_error: err instanceof Error ? err.message : 'Unknown error',
      })
      .eq('id', body.jobId)

    return new Response(JSON.stringify({ ok: false, status: deadLetter ? 'dead_letter' : 'retrying' }), {
      status: 202,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
