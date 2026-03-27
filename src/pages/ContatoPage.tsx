import { useEffect } from 'react'
import { MinimalMotionBackground } from '@/components/MinimalMotionBackground'
import { PageHeader } from '@/components/PageHeader'
import { PublicLayout } from '@/components/PublicLayout'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/usePageTitle'
import { logInteracao } from '@/services/interacoes'

const CONTACT_EMAIL = 'cyrnedev@gmail.com'

export default function ContatoPage() {
  usePageTitle('Contato LeadOS')

  useEffect(() => {
    void logInteracao({
      tipo: 'leados_contact_page_viewed',
      payload: { origem: 'public' },
    }).then(
      () => {},
      () => {},
    )
  }, [])

  return (
    <PublicLayout
      backgroundLayer={<MinimalMotionBackground className="opacity-100" />}
      showFooter
    >
      <section className="relative z-10 rounded-2xl border border-border bg-card/92 px-4 py-6 shadow-sm backdrop-blur-[1px] sm:px-6 sm:py-8">
        <PageHeader
          title="Que bom ter você aqui"
          subtitle="Se quiser usar o LeadOS para aquisição de leads qualificados no seu negócio, converse com nosso time."
        />

        <div className="flex flex-col items-center mx-auto max-w-md space-y-4 text-left gap-4">
          <p className="text-muted-foreground text-center text-sm leading-relaxed">
            Nosso foco é ajudar operações comerciais a qualificar melhor e vender com mais
            eficiência, sem desperdiçar tempo com oportunidades frias.
          </p>

          <Button asChild className="w-full">
            <a href={`mailto:${CONTACT_EMAIL}?subject=Quero conhecer o LeadOS`}>
              Falar com o time LeadOS
            </a>
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            Ou envie um e-mail direto para <span className="text-foreground">{CONTACT_EMAIL}</span>.
          </p>
        </div>
      </section>
    </PublicLayout>
  )
}
