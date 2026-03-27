import type { Json } from '@/types/database'
import { supabase } from './supabaseClient'

export type NotificationJobStatus = 'pending' | 'retrying' | 'sent' | 'failed' | 'dead_letter'

export type NotificationJob = {
  id: string
  lead_id: string | null
  event_type: string
  status: NotificationJobStatus
  attempts: number
  max_attempts: number
  next_retry_at: string
  idempotency_key: string
  last_error: string | null
  created_at: string
  sent_at: string | null
}

type EnqueueQualifiedLeadInput = {
  leadId: string
  payload: Json
}

export async function enqueueQualifiedLeadNotification(input: EnqueueQualifiedLeadInput) {
  const idempotencyKey = `lead_qualified_positive:${input.leadId}`

  const { data, error } = await supabase
    .from('notification_jobs')
    .insert({
      lead_id: input.leadId,
      event_type: 'lead_qualified_positive',
      channel: 'whatsapp_intermediador',
      payload: input.payload,
      status: 'pending',
      attempts: 0,
      max_attempts: 3,
      idempotency_key: idempotencyKey,
    })
    .select()
    .single<NotificationJob>()

  if (!error) return { data, error: null, idempotencyKey }

  // Idempotência: se já existir pelo idempotency_key, reaproveita o job existente.
  if ((error as { code?: string }).code === '23505') {
    const { data: existing, error: existingError } = await supabase
      .from('notification_jobs')
      .select('id,lead_id,event_type,status,attempts,max_attempts,next_retry_at,idempotency_key,last_error,created_at,sent_at')
      .eq('idempotency_key', idempotencyKey)
      .single<NotificationJob>()
    return { data: existing ?? null, error: existingError, idempotencyKey }
  }

  return { data: null, error, idempotencyKey }
}

export async function dispatchNotificationJob(job: Pick<NotificationJob, 'id' | 'lead_id' | 'idempotency_key'>, payload: Json) {
  // #region agent log
  fetch('http://127.0.0.1:7852/ingest/306754ad-509d-455f-acd3-0fedd05bf34f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'aaddc1'},body:JSON.stringify({sessionId:'aaddc1',runId:'pre-fix',hypothesisId:'H4',location:'notifications.ts:dispatchNotificationJob:start',message:'Dispatch invoke start',data:{jobId:job.id,leadId:job.lead_id,idempotencyKey:job.idempotency_key},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  const result = await supabase.functions.invoke('notify-intermediador', {
    body: {
      jobId: job.id,
      leadId: job.lead_id,
      idempotencyKey: job.idempotency_key,
      payload,
    },
  })
  // #region agent log
  fetch('http://127.0.0.1:7852/ingest/306754ad-509d-455f-acd3-0fedd05bf34f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'aaddc1'},body:JSON.stringify({sessionId:'aaddc1',runId:'pre-fix',hypothesisId:'H4',location:'notifications.ts:dispatchNotificationJob:finish',message:'Dispatch invoke finished',data:{jobId:job.id,invokeHasError:!!result.error,invokeErrorMessage:result.error?.message??null,invokeData:result.data??null},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  return result
}

export async function listNotificationJobs() {
  return supabase
    .from('notification_jobs')
    .select('id,lead_id,event_type,status,attempts,max_attempts,next_retry_at,idempotency_key,last_error,created_at,sent_at')
    .order('created_at', { ascending: false })
    .limit(30)
}

export async function listNotificationJobsByLead(leadId: string) {
  return supabase
    .from('notification_jobs')
    .select('id,lead_id,event_type,status,attempts,max_attempts,next_retry_at,idempotency_key,last_error,created_at,sent_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
}

export async function retryNotificationJob(jobId: string) {
  const { data: job, error } = await supabase
    .from('notification_jobs')
    .select('id,lead_id,idempotency_key,payload,status')
    .eq('id', jobId)
    .single<{
      id: string
      lead_id: string | null
      idempotency_key: string
      payload: Json
      status: NotificationJobStatus
    }>()

  if (error || !job) return { error: error ?? new Error('Job não encontrado.') }

  const { error: updateError } = await supabase
    .from('notification_jobs')
    .update({
      status: 'pending',
      next_retry_at: new Date().toISOString(),
      last_error: null,
    })
    .eq('id', jobId)

  if (updateError) return { error: updateError }

  return dispatchNotificationJob(
    { id: job.id, lead_id: job.lead_id, idempotency_key: job.idempotency_key },
    job.payload,
  )
}
