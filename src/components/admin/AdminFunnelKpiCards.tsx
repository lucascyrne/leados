import type { DashboardMetrics } from '@/services/adminDashboard'

type Props = {
  metrics: DashboardMetrics
}

function asPercent(v: number) {
  return `${v.toFixed(1)}%`
}

export function AdminFunnelKpiCards({ metrics }: Props) {
  const cards = [
    { label: 'Simulações iniciadas', value: String(metrics.simulacaoIniciada) },
    { label: 'Qualificações enviadas', value: String(metrics.qualificacaoEnviada) },
    { label: 'Handoff visualizado', value: String(metrics.handoffViewed) },
    { label: 'Clique no parceiro', value: String(metrics.parceiroClicked) },
    { label: 'Lead validado', value: String(metrics.leadValidado) },
    { label: 'Taxa handoff', value: asPercent(metrics.taxaHandoff) },
    { label: 'Taxa clique parceiro', value: asPercent(metrics.taxaCliqueParceiro) },
    {
      label: 'Tempo médio contato humano',
      value:
        metrics.tempoMedioContatoHoras == null
          ? '-'
          : `${metrics.tempoMedioContatoHoras.toFixed(1)}h`,
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="rounded-lg border border-border bg-card p-3 text-left">
          <p className="text-muted-foreground text-xs">{card.label}</p>
          <p className="text-foreground mt-1 text-lg font-semibold">{card.value}</p>
        </article>
      ))}
    </div>
  )
}
