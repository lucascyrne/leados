import { CREDIT_PARCEL_PAIRS_SORTED } from '@/utils/creditTable'
import { formatBRL } from '@/utils/currency'

export function RealExamplesSection() {
  const rows = CREDIT_PARCEL_PAIRS_SORTED

  return (
    <section className="space-y-4" aria-labelledby="exemplos-heading">
      <h2
        id="exemplos-heading"
        className="text-foreground text-lg font-semibold"
      >
        Exemplos de cenários (tabela oficial)
      </h2>
      <div className="mb-2">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Os valores abaixo vêm diretamente da referência canónica do produto — mesmos números
          em toda a experiência.
        </p>
      </div>
      <div className="border-border overflow-hidden rounded-xl border">
        <div
          className="text-muted-foreground grid grid-cols-2 gap-4 border-b px-4 py-2 text-xs font-medium tracking-wide uppercase"
          role="row"
        >
          <span>Crédito</span>
          <span className="text-right">Parcela</span>
        </div>
        <ul role="list">
          {rows.map(({ credito, parcela }) => (
            <li
              key={credito}
              className="border-border grid grid-cols-2 gap-4 border-t px-4 py-3 text-sm"
            >
              <span className="text-foreground font-medium tabular-nums">
                {formatBRL(credito)}
              </span>
              <span className="text-foreground text-right font-medium tabular-nums">
                {formatBRL(parcela)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
