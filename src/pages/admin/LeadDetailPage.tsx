import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AdminCategoriaBadge, AdminStatusBadge } from '@/components/admin/AdminBadges'
import { Button } from '@/components/ui/button'
import { getLeadById, updateLeadStatus } from '@/services/leads'
import {
  listNotificationJobsByLead,
  retryNotificationJob,
  type NotificationJob,
} from '@/services/notifications'
import type { Lead, StatusLead } from '@/types/lead'
import {
  ISS_SOBRE_COMISSAO_PERCENT,
  getCommissionTierForCredito,
} from '@/utils/commissionTiers'
import { formatBRL } from '@/utils/currency'
import { userFacingError } from '@/utils/serviceError'

export default function LeadDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobs, setJobs] = useState<NotificationJob[]>([])
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null)

  useEffect(() => {
    async function run() {
      if (!id) return
      setLoading(true)
      const { data, error } = await getLeadById(id)
      if (error || !data) {
        setError(userFacingError(error, 'Lead não encontrado.'))
        setLoading(false)
        return
      }
      setLead(data)
      const { data: jobsData } = await listNotificationJobsByLead(data.id)
      setJobs((jobsData as NotificationJob[]) ?? [])
      setLoading(false)
    }
    void run()
  }, [id])

  async function setStatus(status: StatusLead) {
    if (!lead || saving) return
    setSaving(true)
    const { data, error } = await updateLeadStatus(lead.id, status)
    setSaving(false)
    if (error || !data) {
      toast.error('Falha ao atualizar status', {
        description: userFacingError(error, 'Tente novamente.'),
      })
      return
    }
    setLead(data)
    toast.success('Status atualizado.')
  }

  async function onRetryJob(jobId: string) {
    if (retryingJobId) return
    setRetryingJobId(jobId)
    const { error } = await retryNotificationJob(jobId)
    setRetryingJobId(null)
    if (error) {
      toast.error('Falha ao reprocessar notificação.')
      return
    }
    toast.success('Notificação reprocessada.')
    if (lead) {
      const { data: jobsData } = await listNotificationJobsByLead(lead.id)
      setJobs((jobsData as NotificationJob[]) ?? [])
    }
  }

  if (loading) {
    return (
      <div className="bg-background flex min-h-[40vh] items-center justify-center">
        <Loader2 className="text-primary size-10 animate-spin" />
      </div>
    )
  }

  if (error || !lead) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <p className="text-destructive text-sm">{error ?? 'Lead não encontrado.'}</p>
        <Button className="mt-3" variant="outline" onClick={() => navigate('/admin/leads')}>
          Voltar para leads
        </Button>
      </div>
    )
  }

  const tier = getCommissionTierForCredito(lead.valor_desejado)
  const comissaoBruta = (lead.valor_desejado * tier.comissaoPercent) / 100
  const comissaoLiquida = comissaoBruta * (1 - ISS_SOBRE_COMISSAO_PERCENT / 100)

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6 text-left">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Admin · Lead</h1>
        <Button variant="outline" onClick={() => navigate('/admin/leads')}>
          Voltar
        </Button>
      </div>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-lg font-semibold">{lead.nome}</h2>
        <p className="text-muted-foreground text-sm">{lead.email}</p>
        <p className="text-muted-foreground text-sm">{lead.telefone ?? '-'}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <AdminCategoriaBadge categoria={lead.categoria} />
          <AdminStatusBadge status={lead.status} />
        </div>
      </section>

      <section className="grid gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-2">
        <p className="text-sm">Score: <strong>{lead.score}</strong></p>
        <p className="text-sm">Objetivo: <strong>{lead.objetivo}</strong></p>
        <p className="text-sm">Valor desejado: <strong>{formatBRL(lead.valor_desejado)}</strong></p>
        <p className="text-sm">Parcela desejada: <strong>{formatBRL(lead.parcela_desejada)}</strong></p>
        <p className="text-sm">Renda mensal: <strong>{formatBRL(lead.renda_mensal)}</strong></p>
        <p className="text-sm">
          Criado em: <strong>{new Date(lead.created_at).toLocaleString('pt-BR')}</strong>
        </p>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-base font-semibold">Comissão estimada</h3>
        <p className="text-sm">Faixa: {tier.comissaoPercent}%</p>
        <p className="text-sm">Bruta: {formatBRL(comissaoBruta)}</p>
        <p className="text-sm">Líquida (ISS {ISS_SOBRE_COMISSAO_PERCENT}%): {formatBRL(comissaoLiquida)}</p>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-base font-semibold">Atualizar status</h3>
        <div className="flex flex-wrap gap-2">
          {(['NOVO', 'QUALIFICADO', 'ENVIADO', 'CONVERTIDO'] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={lead.status === s ? 'default' : 'outline'}
              disabled={saving}
              onClick={() => void setStatus(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-base font-semibold">Notificações ao intermediador</h3>
        {jobs.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhuma notificação registrada para este lead.</p>
        ) : (
          <ul className="space-y-2">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
              >
                <div className="text-sm">
                  <p className="font-medium">
                    {job.event_type} · {job.status}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    tentativas {job.attempts}/{job.max_attempts}
                    {job.last_error ? ` · ${job.last_error}` : ''}
                  </p>
                </div>
                {(job.status === 'retrying' || job.status === 'failed' || job.status === 'dead_letter') && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={retryingJobId === job.id}
                    onClick={() => void onRetryJob(job.id)}
                  >
                    {retryingJobId === job.id ? 'A reenviar…' : 'Reprocessar'}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
