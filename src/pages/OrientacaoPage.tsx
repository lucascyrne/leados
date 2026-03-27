import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MinimalMotionBackground } from '@/components/MinimalMotionBackground'
import { PageHeader } from '@/components/PageHeader'
import { PublicLayout } from '@/components/PublicLayout'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/usePageTitle'
import { logInteracao } from '@/services/interacoes'
import type { CategoriaLead } from '@/types/lead'

type GuidanceState = {
  leadId?: string
  categoria?: CategoriaLead
  score?: number
}

export default function OrientacaoPage() {
  usePageTitle('Próximo melhor passo')

  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as GuidanceState

  useEffect(() => {
    void logInteracao({
      leadId: state.leadId ?? null,
      tipo: 'nonqualified_guidance_viewed',
      idempotencyKey: state.leadId ? `nonqualified_guidance_viewed:${state.leadId}` : undefined,
      payload: {
        origem: 'leados_ademicon',
        categoria: state.categoria ?? null,
        score: state.score ?? null,
        handoff_status: 'abandoned',
      },
    }).then(
      () => {},
      () => {},
    )
  }, [state.categoria, state.leadId, state.score])

  async function onNewSimulation() {
    await logInteracao({
      leadId: state.leadId ?? null,
      tipo: 'nonqualified_new_simulation_clicked',
      payload: { origem: 'orientacao_page' },
    })
    navigate('/simulador')
  }

  async function onContactClick() {
    await logInteracao({
      leadId: state.leadId ?? null,
      tipo: 'leados_contact_cta_clicked',
      payload: { origem: 'orientacao_page' },
    })
    navigate('/contato')
  }

  return (
    <PublicLayout
      backgroundLayer={<MinimalMotionBackground className="opacity-100" />}
      showFooter
    >
      <section className="relative z-10 rounded-2xl border border-border bg-card/92 px-4 py-6 shadow-sm backdrop-blur-[1px] sm:px-6 sm:py-8">
        <PageHeader
          title="Recebemos sua simulação"
          subtitle="Neste momento, o melhor caminho é evoluir alguns pontos antes de seguir para a etapa oficial. Isso ajuda você a avançar com mais segurança e chance real de aprovação."
        />

        <div className="mx-auto max-w-md space-y-4 text-left">
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <h2 className="text-foreground text-sm font-semibold">Dicas para próxima avaliação</h2>
            <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
              <li>Organize uma faixa de parcela que fique confortável no orçamento mensal.</li>
              <li>Revise seu objetivo de investimento para escolher o plano mais aderente.</li>
              <li>Faça uma nova simulação em breve para acompanhar sua evolução.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={onNewSimulation} className="w-full">
              Fazer nova simulação
            </Button>
            <Button variant="outline" onClick={onContactClick} className="w-full">
              O que achou da experiência? Conheça o LeadOS
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
