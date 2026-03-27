import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AdminFunnelKpiCards } from '@/components/admin/AdminFunnelKpiCards'
import { AdminErrorState } from '@/components/admin/AdminStates'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import {
  listNotificationJobs,
  retryNotificationJob,
  type NotificationJob,
} from '@/services/notifications'
import {
  getDashboardMetrics,
  type DashboardMetrics,
  type DashboardPeriod,
} from '@/services/adminDashboard'
import { userFacingError } from '@/utils/serviceError'

const periodOptions: Array<{ value: DashboardPeriod; label: string }> = [
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: 'all', label: 'Acumulado' },
]

function mapObjetivoLabel(value: string) {
  const v = value.toLowerCase()
  if (v.includes('veículo') || v.includes('veiculo') || v.includes('carro')) return 'Carro'
  if (v.includes('serv')) return 'Serviço'
  if (v.includes('imó') || v.includes('imo') || v.includes('imov')) return 'Imóvel'
  return value
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, loading, signOut } = useAuth()
  const [period, setPeriod] = useState<DashboardPeriod>('7d')
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loadingMetrics, setLoadingMetrics] = useState(true)
  const [metricsError, setMetricsError] = useState<Error | null>(null)
  const [jobs, setJobs] = useState<NotificationJob[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null)

  async function sair() {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function loadMetrics() {
      setLoadingMetrics(true)
      setMetricsError(null)
      try {
        const data = await getDashboardMetrics(period)
        if (!cancelled) setMetrics(data)
      } catch (err) {
        if (!cancelled) {
          setMetricsError(err instanceof Error ? err : new Error('Falha ao carregar dashboard.'))
          setMetrics(null)
        }
      } finally {
        if (!cancelled) setLoadingMetrics(false)
      }
    }

    void loadMetrics()
    return () => {
      cancelled = true
    }
  }, [period, user])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function loadJobs() {
      setLoadingJobs(true)
      const { data, error } = await listNotificationJobs()
      if (!cancelled) {
        if (error) {
          setJobs([])
        } else {
          setJobs((data as NotificationJob[]) ?? [])
        }
        setLoadingJobs(false)
      }
    }

    void loadJobs()
    return () => {
      cancelled = true
    }
  }, [user])

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
    const { data } = await listNotificationJobs()
    setJobs((data as NotificationJob[]) ?? [])
  }

  if (loading) {
    return (
      <div className="bg-background flex min-h-[40vh] items-center justify-center">
        <Loader2
          className="text-primary size-10 animate-spin"
          aria-label="A carregar"
        />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-background text-foreground mx-auto max-w-lg p-6 text-center">
        <p className="text-muted-foreground mb-4">Sessão não iniciada.</p>
        <Button onClick={() => navigate('/admin/login')}>Ir para login</Button>
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground mx-auto max-w-6xl space-y-5 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin · Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Sessão ativa: <strong>{user.email ?? user.id}</strong>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/leads')}>
            Leads
          </Button>
          <Button variant="outline" onClick={sair}>
            Sair
          </Button>
        </div>
      </header>

      <section className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-foreground text-base font-semibold">Saúde do funil Ademicon</h2>
            <p className="text-muted-foreground text-xs">
              Métricas operacionais para identificar gargalos rapidamente.
            </p>
          </div>
          <select
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value as DashboardPeriod)}
            aria-label="Filtro de período do dashboard"
          >
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {loadingMetrics ? (
          <div className="flex min-h-28 items-center justify-center">
            <Loader2 className="text-primary size-8 animate-spin" aria-label="A carregar métricas" />
          </div>
        ) : metricsError ? (
          <AdminErrorState message={userFacingError(metricsError, 'Não foi possível carregar as métricas.')} />
        ) : metrics ? (
          <div className="space-y-4">
            <AdminFunnelKpiCards metrics={metrics} />

            <div className="grid gap-3 lg:grid-cols-3">
              <article className="rounded-lg border border-border bg-background p-3 text-left">
                <p className="text-muted-foreground text-xs">Principal gargalo</p>
                <p className="text-foreground mt-1 text-sm font-semibold">{metrics.principalGargalo}</p>
              </article>
              <article className="rounded-lg border border-border bg-background p-3 text-left">
                <p className="text-muted-foreground text-xs">Consentimentos pendentes</p>
                <p className="text-foreground mt-1 text-sm font-semibold">{metrics.consentPendentes}</p>
              </article>
              <article className="rounded-lg border border-border bg-background p-3 text-left">
                <p className="text-muted-foreground text-xs">Duplicados bloqueados</p>
                <p className="text-foreground mt-1 text-sm font-semibold">{metrics.duplicadosBloqueados}</p>
              </article>
            </div>

            <article className="rounded-lg border border-border bg-background p-3 text-left">
              <p className="text-muted-foreground mb-2 text-xs">Volume por tipo de investimento</p>
              {metrics.volumePorObjetivo.length === 0 ? (
                <p className="text-muted-foreground text-sm">Sem dados no período selecionado.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {metrics.volumePorObjetivo.map((item) => (
                    <li key={item.objetivo} className="flex items-center justify-between">
                      <span className="text-foreground">{mapObjetivoLabel(item.objetivo)}</span>
                      <span className="text-muted-foreground">{item.total}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="rounded-lg border border-border bg-background p-3 text-left">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-muted-foreground text-xs">Fila de notificações (intermediador)</p>
                <Button size="sm" variant="outline" onClick={() => navigate('/admin/leads')}>
                  Ver leads
                </Button>
              </div>
              {loadingJobs ? (
                <p className="text-muted-foreground text-sm">A carregar notificações...</p>
              ) : jobs.length === 0 ? (
                <p className="text-muted-foreground text-sm">Sem notificações recentes.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {jobs.slice(0, 8).map((job) => (
                    <li
                      key={job.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-2 py-2"
                    >
                      <div>
                        <p className="text-foreground text-xs font-medium">
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
            </article>
          </div>
        ) : null}
      </section>
    </div>
  )
}
