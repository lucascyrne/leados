import { MinimalMotionBackground } from '@/components/MinimalMotionBackground'
import { PageHeader } from '@/components/PageHeader'
import { PublicLayout } from '@/components/PublicLayout'
import { SimuladorPanel } from '@/features/simulador/SimuladorPanel'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useTrackPageView } from '@/hooks/useTrackPageView'

export default function SimuladorPage() {
  usePageTitle('Simulador')
  useTrackPageView('/simulador')

  return (
    <PublicLayout
      backgroundLayer={<MinimalMotionBackground className="opacity-100" />}
      showFooter
    >
      <section className="relative z-10 rounded-2xl border border-border bg-card/92 px-4 py-6 shadow-sm backdrop-blur-[1px] sm:px-6 sm:py-8">
        <PageHeader
          title="Simulador"
          subtitle="Informe o valor de crédito desejado ou a parcela que cabe no seu orçamento. Usamos a tabela oficial e interpolação entre os pontos quando necessário."
        />
        <SimuladorPanel variant="page" showExamples showIntroCopy />
      </section>
    </PublicLayout>
  )
}
