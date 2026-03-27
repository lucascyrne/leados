import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CurrencyInput } from '@/components/CurrencyInput'
import { MinimalMotionBackground } from '@/components/MinimalMotionBackground'
import { PageHeader } from '@/components/PageHeader'
import { PublicLayout } from '@/components/PublicLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePageTitle } from '@/hooks/usePageTitle'
import { LEAD_CONSENT_VERSION, LEAD_SHARING_CONTEXT } from '@/config/compliance'
import { ADEMICON_PARTNER_LINK } from '@/config/partners'
import { createLead } from '@/services/leads'
import { logInteracao } from '@/services/interacoes'
import { dispatchNotificationJob, enqueueQualifiedLeadNotification } from '@/services/notifications'
import {
  OBJETIVOS,
  PRAZOS_INICIO,
  qualificacaoSchema,
  type QualificacaoValues,
} from '@/schemas/qualificacao'
import { useSimuladorStore } from '@/store/simuladorStore'
import { toastDescriptionForError } from '@/utils/serviceError'
import { classifyLead, PARTNER_HANDOFF_MIN_SCORE } from '@/utils/score'

function onlyDigits(s: string) {
  return s.replace(/\D/g, '')
}

const selectClass =
  'border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

function toISODate(value: Date) {
  return value.toISOString().slice(0, 10)
}

function addDays(base: Date, days: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

function mapPrazoInicioToDate(prazo: QualificacaoValues['prazo_inicio']) {
  const today = new Date()
  switch (prazo) {
    case 'Imediato':
      return toISODate(today)
    case 'Em até 3 meses':
      return toISODate(addDays(today, 90))
    case 'Entre 3 e 6 meses':
      return toISODate(addDays(today, 180))
    case 'Acima de 6 meses':
      return toISODate(addDays(today, 210))
    default:
      return toISODate(today)
  }
}

export default function QualificacaoPage() {
  usePageTitle('Qualificação')

  const navigate = useNavigate()
  const valorStore = useSimuladorStore((s) => s.valorDesejado)
  const parcelaStore = useSimuladorStore((s) => s.parcelaDesejada)

  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    void logInteracao({
      tipo: 'lead_prequalificacao_explained_viewed',
      payload: { origem: 'qualificacao' },
    }).then(
      () => {},
      () => {},
    )
  }, [])

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QualificacaoValues>({
    resolver: zodResolver(qualificacaoSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      renda_mensal: 0,
      valor_desejado: 0,
      parcela_desejada: 0,
      objetivo: 'Crédito imobiliário',
      prazo_inicio: 'Imediato',
      aceitar_termos: false,
    },
  })

  useEffect(() => {
    reset((prev) => ({
      ...prev,
      valor_desejado:
        valorStore != null && valorStore > 0 ? valorStore : 0,
      parcela_desejada:
        parcelaStore != null && parcelaStore > 0 ? parcelaStore : 0,
    }))
  }, [valorStore, parcelaStore, reset])

  async function onSubmit(data: QualificacaoValues) {
    if (enviando) return
    setEnviando(true)
    try {
      const { score, categoria } = classifyLead(
        data.renda_mensal,
        data.parcela_desejada,
        data.objetivo,
      )
      const isScoreQualified = score >= PARTNER_HANDOFF_MIN_SCORE
      // #region agent log
      fetch('http://127.0.0.1:7852/ingest/306754ad-509d-455f-acd3-0fedd05bf34f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'aaddc1'},body:JSON.stringify({sessionId:'aaddc1',runId:'pre-fix',hypothesisId:'H1',location:'QualificacaoPage.tsx:onSubmit:scoreGate',message:'Score gate evaluated',data:{score,categoria,isScoreQualified,consentAccepted:data.aceitar_termos,threshold:PARTNER_HANDOFF_MIN_SCORE},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const telefone = onlyDigits(data.telefone) || null
      const prazoInicioDate = mapPrazoInicioToDate(data.prazo_inicio)

      const { data: lead, error } = await createLead({
        nome: data.nome.trim(),
        email: data.email.trim(),
        telefone,
        renda_mensal: data.renda_mensal,
        valor_desejado: data.valor_desejado,
        parcela_desejada: data.parcela_desejada,
        objetivo: data.objetivo,
        prazo_inicio: prazoInicioDate,
        score,
        categoria,
        partner_name: LEAD_SHARING_CONTEXT.partnerName,
        partner_agent_name: LEAD_SHARING_CONTEXT.representativeName,
        partner_link: ADEMICON_PARTNER_LINK,
        consent_lgpd: data.aceitar_termos,
        consent_text_version: LEAD_CONSENT_VERSION,
        handoff_status: 'pending',
      })

      if (error || !lead) {
        toast.error('Não foi possível enviar', {
          description: toastDescriptionForError(
            error,
            'Tente novamente em instantes.',
          ),
        })
        return
      }

      await logInteracao({
        leadId: lead.id,
        tipo: 'lead_created',
        idempotencyKey: `lead_created:${lead.id}`,
        payload: {
          origem: 'leados_ademicon',
          investment_type: data.objetivo,
          handoff_status: 'pending',
          evidencias_indicacao: {
            origem_canal: 'leados',
            contrato_ref: LEAD_SHARING_CONTEXT.contractRef,
          },
        },
      })

      await logInteracao({
        leadId: lead.id,
        tipo: 'lead_consent_recorded',
        idempotencyKey: `lead_consent_recorded:${lead.id}`,
        payload: {
          origem: 'leados_ademicon',
          investment_type: data.objetivo,
          consent_timestamp: new Date().toISOString(),
          consentimento: {
            aceito: data.aceitar_termos,
            versionamento_texto: LEAD_CONSENT_VERSION,
            base_legal: LEAD_SHARING_CONTEXT.legalBasis,
          },
          compartilhamento: {
            parceiro: LEAD_SHARING_CONTEXT.partnerName,
            intermediacao: LEAD_SHARING_CONTEXT.intermediaryRole,
            representante_parceiro: LEAD_SHARING_CONTEXT.representativeName,
          },
        },
      })

      await logInteracao({
        leadId: lead.id,
        tipo: 'ademicon_terms_accepted',
        idempotencyKey: `ademicon_terms_accepted:${lead.id}`,
        payload: {
          origem: 'leados_ademicon',
          investment_type: data.objetivo,
          consent_timestamp: new Date().toISOString(),
          consent_version: LEAD_CONSENT_VERSION,
        },
      })

      if (isScoreQualified && data.aceitar_termos) {
        // #region agent log
        fetch('http://127.0.0.1:7852/ingest/306754ad-509d-455f-acd3-0fedd05bf34f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'aaddc1'},body:JSON.stringify({sessionId:'aaddc1',runId:'pre-fix',hypothesisId:'H2',location:'QualificacaoPage.tsx:onSubmit:notifyBlockEnter',message:'Entered notification block',data:{leadId:lead.id,score,isScoreQualified},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        const adminLeadUrl =
          typeof window !== 'undefined'
            ? `${window.location.origin}/admin/lead/${lead.id}`
            : `/admin/lead/${lead.id}`

        const notificationPayload = {
          nome: lead.nome,
          telefone: telefone,
          investimento: data.objetivo,
          faixa_credito: data.valor_desejado,
          faixa_parcela: data.parcela_desejada,
          score,
          categoria,
          origem: 'leados_ademicon',
          consent_lgpd: true,
          link_admin: adminLeadUrl,
        }

        const { data: job } = await enqueueQualifiedLeadNotification({
          leadId: lead.id,
          payload: notificationPayload,
        })
        // #region agent log
        fetch('http://127.0.0.1:7852/ingest/306754ad-509d-455f-acd3-0fedd05bf34f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'aaddc1'},body:JSON.stringify({sessionId:'aaddc1',runId:'pre-fix',hypothesisId:'H3',location:'QualificacaoPage.tsx:onSubmit:enqueueResult',message:'Queue insert finished',data:{leadId:lead.id,jobId:job?.id??null,jobStatus:job?.status??null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        if (job) {
          await logInteracao({
            leadId: lead.id,
            tipo: 'lead_qualified_positive',
            idempotencyKey: `lead_qualified_positive:${lead.id}`,
            payload: {
              origem: 'leados_ademicon',
              qualified_by: 'score_threshold',
              score_threshold: PARTNER_HANDOFF_MIN_SCORE,
              score,
              categoria,
              queue_status: job.status,
              notification_job_id: job.id,
            },
          })
          void dispatchNotificationJob(
            { id: job.id, lead_id: job.lead_id, idempotency_key: job.idempotency_key },
            notificationPayload,
          )
        }
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7852/ingest/306754ad-509d-455f-acd3-0fedd05bf34f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'aaddc1'},body:JSON.stringify({sessionId:'aaddc1',runId:'pre-fix',hypothesisId:'H1',location:'QualificacaoPage.tsx:onSubmit:notifyBlockSkipped',message:'Notification block skipped',data:{score,isScoreQualified,consentAccepted:data.aceitar_termos},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      }

      if (isScoreQualified) {
        navigate('/parceiro/ademicon', {
          state: { leadId: lead.id, categoria, score },
          replace: true,
        })
        return
      }

      navigate('/orientacao', {
        state: { leadId: lead.id, categoria, score },
        replace: true,
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <PublicLayout
      backgroundLayer={<MinimalMotionBackground className="opacity-100" />}
      showFooter
    >
      <section className="relative z-10 rounded-2xl border border-border bg-card/92 px-4 py-6 shadow-sm backdrop-blur-[1px] sm:px-6 sm:py-8">
        <PageHeader
          title="Qualificação"
          subtitle="Preencha seus dados para analisarmos seu cenário com o mesmo critério da simulação. Sem pressão: usamos apenas o necessário para continuidade do atendimento."
        />
        <div className="mx-auto mb-5 max-w-md rounded-lg border border-border bg-background/70 p-3 text-left">
          <p className="text-muted-foreground text-sm leading-relaxed">
            A pré-qualificação existe para te direcionar com mais assertividade: quando o perfil
            está no momento ideal, você segue para a simulação oficial da Ademicon; quando ainda
            não está, mostramos orientações práticas para evoluir no tempo certo.
          </p>
        </div>
        <form
          className="mx-auto max-w-md space-y-5 text-left"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-busy={enviando}
        >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nome" className="text-foreground text-sm font-medium">
            Nome completo
          </label>
          <Input
            id="nome"
            autoComplete="name"
            aria-invalid={errors.nome ? true : undefined}
            aria-describedby={errors.nome ? 'nome-err' : undefined}
            {...register('nome')}
          />
          {errors.nome ? (
            <p id="nome-err" className="text-destructive text-sm" role="alert">
              {errors.nome.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-foreground text-sm font-medium">
            E-mail
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'email-err' : undefined}
            {...register('email')}
          />
          {errors.email ? (
            <p id="email-err" className="text-destructive text-sm" role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="telefone" className="text-foreground text-sm font-medium">
            Telefone (WhatsApp)
          </label>
          <Input
            id="telefone"
            type="tel"
            autoComplete="tel"
            placeholder="(11) 99999-9999"
            aria-invalid={errors.telefone ? true : undefined}
            aria-describedby={errors.telefone ? 'tel-err' : undefined}
            {...register('telefone')}
          />
          {errors.telefone ? (
            <p id="tel-err" className="text-destructive text-sm" role="alert">
              {errors.telefone.message}
            </p>
          ) : null}
        </div>

        <Controller
          name="renda_mensal"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Renda mensal"
              value={field.value > 0 ? field.value : null}
              onChange={(v) => field.onChange(v ?? 0)}
              onBlur={field.onBlur}
              error={errors.renda_mensal?.message}
            />
          )}
        />

        <Controller
          name="valor_desejado"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Valor desejado do crédito"
              value={field.value > 0 ? field.value : null}
              onChange={(v) => field.onChange(v ?? 0)}
              onBlur={field.onBlur}
              error={errors.valor_desejado?.message}
            />
          )}
        />

        <Controller
          name="parcela_desejada"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Parcela desejada"
              value={field.value > 0 ? field.value : null}
              onChange={(v) => field.onChange(v ?? 0)}
              onBlur={field.onBlur}
              error={errors.parcela_desejada?.message}
            />
          )}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="objetivo" className="text-foreground text-sm font-medium">
            Objetivo
          </label>
          <select
            id="objetivo"
            className={selectClass}
            aria-invalid={errors.objetivo ? true : undefined}
            aria-describedby={errors.objetivo ? 'objetivo-err' : undefined}
            {...register('objetivo')}
          >
            {OBJETIVOS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {errors.objetivo ? (
            <p id="objetivo-err" className="text-destructive text-sm" role="alert">
              {errors.objetivo.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="prazo" className="text-foreground text-sm font-medium">
            Prazo para iniciar
          </label>
          <select
            id="prazo"
            className={selectClass}
            aria-invalid={errors.prazo_inicio ? true : undefined}
            aria-describedby={errors.prazo_inicio ? 'prazo-err' : undefined}
            {...register('prazo_inicio')}
          >
            {PRAZOS_INICIO.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.prazo_inicio ? (
            <p id="prazo-err" className="text-destructive text-sm" role="alert">
              {errors.prazo_inicio.message}
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border border-border bg-background/70 p-3">
          <label
            htmlFor="aceitar_termos"
            className="flex cursor-pointer items-start gap-2 text-sm leading-relaxed"
          >
            <input
              id="aceitar_termos"
              type="checkbox"
              className="mt-1 size-4 rounded border-input"
              aria-invalid={errors.aceitar_termos ? true : undefined}
              aria-describedby={errors.aceitar_termos ? 'termos-err' : undefined}
              {...register('aceitar_termos')}
            />
            <span className="text-muted-foreground">
              Autorizo o uso dos meus dados para contato consultivo e compartilhamento com o
              parceiro Ademicon e seu representante comercial, com intermediação da Leados, nos
              termos da{' '}
              <a href="/privacy-policy" className="text-primary underline underline-offset-2">
                Política de Privacidade
              </a>
              .
            </span>
          </label>
          {errors.aceitar_termos ? (
            <p id="termos-err" className="text-destructive mt-2 text-sm" role="alert">
              {errors.aceitar_termos.message}
            </p>
          ) : null}
        </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/simulador')}
              >
                Voltar ao simulador
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando ? 'Enviando…' : 'Enviar pedido'}
              </Button>
            </div>
        </form>
      </section>
    </PublicLayout>
  )
}
