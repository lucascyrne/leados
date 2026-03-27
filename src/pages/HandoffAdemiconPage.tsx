import { useEffect } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { MinimalMotionBackground } from '@/components/MinimalMotionBackground'
import { PageHeader } from '@/components/PageHeader'
import { PublicLayout } from '@/components/PublicLayout'
import { Button } from '@/components/ui/button'
import { ADEMICON_PARTNER_LINK } from '@/config/partners'
import { usePageTitle } from '@/hooks/usePageTitle'
import { logInteracao } from '@/services/interacoes'
import type { CategoriaLead } from '@/types/lead'
import { PARTNER_HANDOFF_MIN_SCORE } from '@/utils/score'

type HandoffState = {
  leadId?: string
  categoria?: CategoriaLead
  score?: number
}

export default function HandoffAdemiconPage() {
  usePageTitle('Continuar na Ademicon')

  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state ?? {}) as HandoffState
  const isEligible = (state.score ?? 0) >= PARTNER_HANDOFF_MIN_SCORE

  useEffect(() => {
    if (!isEligible) return

    void logInteracao({
      leadId: state.leadId ?? null,
      tipo: 'ademicon_handoff_viewed',
      idempotencyKey: state.leadId ? `ademicon_handoff_viewed:${state.leadId}` : undefined,
      payload: {
        origem: 'leados_ademicon',
        categoria: state.categoria,
        score: state.score ?? null,
        handoff_status: 'viewed',
        handoff_timestamp: new Date().toISOString(),
      },
    }).then(
      () => {},
      () => {},
    )

    void logInteracao({
      leadId: state.leadId ?? null,
      tipo: 'ademicon_qr_viewed',
      idempotencyKey: state.leadId ? `ademicon_qr_viewed:${state.leadId}` : undefined,
      payload: {
        origem: 'leados_ademicon',
        handoff_status: 'viewed',
        handoff_timestamp: new Date().toISOString(),
      },
    }).then(
      () => {},
      () => {},
    )
  }, [isEligible, state.categoria, state.leadId, state.score])

  async function onContinueToPartner() {
    await logInteracao({
      leadId: state.leadId ?? null,
      tipo: 'ademicon_link_clicked',
      idempotencyKey: state.leadId ? `ademicon_link_clicked_main:${state.leadId}` : undefined,
      payload: {
        origem: 'leados_ademicon',
        destino: ADEMICON_PARTNER_LINK,
        handoff_status: 'clicked',
        handoff_timestamp: new Date().toISOString(),
      },
    })
    window.open(ADEMICON_PARTNER_LINK, '_blank', 'noopener,noreferrer')
  }

  async function onContactClick() {
    await logInteracao({
      leadId: state.leadId ?? null,
      tipo: 'ademicon_whatsapp_fallback_clicked',
      idempotencyKey: state.leadId ? `ademicon_whatsapp_fallback_clicked:${state.leadId}` : undefined,
      payload: {
        origem: 'leados_ademicon',
        handoff_status: 'abandoned',
        fallback: 'contato_leados',
      },
    })
    await logInteracao({
      leadId: state.leadId ?? null,
      tipo: 'leados_contact_cta_clicked',
      payload: { origem: 'handoff_ademicon' },
    })
    navigate('/contato')
  }

  if (!isEligible) {
    return <Navigate to="/orientacao" replace state={state} />
  }

  return (
    <PublicLayout
      backgroundLayer={<MinimalMotionBackground className="opacity-100" />}
      showFooter
    >
      <section className="relative z-10 rounded-2xl border border-border bg-card/92 px-4 py-6 shadow-sm backdrop-blur-[1px] sm:px-6 sm:py-8">
        <PageHeader
          title="Você está pronto para continuar"
          subtitle="Sua pré-avaliação no LeadOS indica um bom momento para seguir para a simulação oficial da Ademicon. O próximo passo é rápido e direto."
        />

        <div className="mx-auto max-w-md space-y-4 text-left">
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Para concluir, abra o fluxo oficial do parceiro pelo botão abaixo ou use o QR Code.
              Assim você mantém continuidade do atendimento sem repetir etapas desnecessárias.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={onContinueToPartner} className="w-full">
              Continuar na simulação oficial da Ademicon
            </Button>
            <Button variant="outline" onClick={onContactClick} className="w-full">
              O que achou da experiência? Conheça o LeadOS
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-foreground mb-3 text-sm font-medium">Ou escaneie o QR Code</p>
            <img
              src="/images/qrcode.png"
              alt="QR Code para continuar na simulação oficial da Ademicon"
              className="mx-auto h-44 w-44 rounded-md border border-border"
              loading="lazy"
            />
            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              Se preferir, você também pode abrir o link direto em uma nova aba.
            </p>
            <a
              href={ADEMICON_PARTNER_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary mt-2 inline-block text-sm underline underline-offset-2"
              onClick={() => {
                void logInteracao({
                  leadId: state.leadId ?? null,
                  tipo: 'ademicon_link_clicked',
                  idempotencyKey: state.leadId
                    ? `ademicon_link_clicked_text:${state.leadId}`
                    : undefined,
                  payload: {
                    origem: 'leados_ademicon',
                    destino: ADEMICON_PARTNER_LINK,
                    handoff_status: 'clicked',
                    handoff_timestamp: new Date().toISOString(),
                    origem_clique: 'text_link',
                  },
                })
              }}
            >
              Abrir link oficial da Ademicon
            </a>
          </div>

          <p className="text-muted-foreground text-center text-xs">
            Ao continuar, seus dados seguem o fluxo autorizado na{' '}
            <Link to="/privacy-policy" className="text-primary underline underline-offset-2">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </section>
    </PublicLayout>
  )
}
