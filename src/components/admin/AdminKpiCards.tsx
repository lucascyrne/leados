import { formatBRL } from '@/utils/currency'

type AdminKpiCardsProps = {
  totalLeads: number
  ticketMedio: number
  comissaoLiquidaTotal: number
}

export function AdminKpiCards({
  totalLeads,
  ticketMedio,
  comissaoLiquidaTotal,
}: AdminKpiCardsProps) {
  const cards = [
    { label: 'Total de leads', value: String(totalLeads) },
    { label: 'Ticket médio', value: formatBRL(ticketMedio) },
    { label: 'Comissão líquida potencial', value: formatBRL(comissaoLiquidaTotal) },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <article key={card.label} className="rounded-lg border border-border bg-card p-3 text-left">
          <p className="text-muted-foreground text-xs">{card.label}</p>
          <p className="text-foreground mt-1 text-lg font-semibold">{card.value}</p>
        </article>
      ))}
    </div>
  )
}
