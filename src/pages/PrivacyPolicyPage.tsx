import { MinimalMotionBackground } from '@/components/MinimalMotionBackground'
import { PublicLayout } from '@/components/PublicLayout'
import { usePageTitle } from '@/hooks/usePageTitle'

export default function PrivacyPolicyPage() {
  usePageTitle('Política de Privacidade')

  return (
    <PublicLayout>
      <div className="relative overflow-hidden rounded-2xl">
        <MinimalMotionBackground className="opacity-85" />
        <article className="relative z-10 mx-auto max-w-3xl space-y-6 rounded-2xl border border-border bg-card/90 px-4 py-6 text-left backdrop-blur-[1px] sm:px-6 sm:py-8">
          <header className="space-y-2 text-center sm:text-left">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
              Política de Privacidade
            </h1>
            <p className="text-muted-foreground text-sm">
              Última atualização: 26/03/2026
            </p>
          </header>

          <section className="space-y-2">
            <h2 className="text-foreground text-lg font-semibold">1. Dados coletados</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Coletamos apenas os dados informados por você durante o fluxo de simulação e
              qualificação, como nome, contato e informações necessárias para retorno comercial.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-lg font-semibold">2. Finalidade de uso</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Os dados são utilizados para responder ao seu interesse, apresentar opções de
              atendimento e viabilizar o contato consultivo solicitado, inclusive continuidade do
              fluxo junto a parceiros de atendimento autorizados.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-lg font-semibold">3. Compartilhamento</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Não comercializamos dados pessoais. O compartilhamento ocorre somente quando
              necessário para execução do atendimento, como no fluxo com o parceiro Ademicon e seu
              representante comercial, com intermediação da LeadOS, ou por obrigação legal.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-lg font-semibold">4. Base legal e consentimento</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Quando o fluxo exigir compartilhamento para atendimento parceiro, solicitamos
              consentimento expresso antes do envio, com registro de data e versão do texto de
              aceite, nos termos da Lei 13.709/2018 (LGPD).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-lg font-semibold">5. Direitos do titular</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Você pode solicitar confirmação de tratamento, atualização, correção ou exclusão de
              dados, respeitadas as hipóteses legais aplicáveis.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-foreground text-lg font-semibold">6. Contato</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Para dúvidas sobre privacidade e tratamento de dados, utilize os canais oficiais da
              LeadOS informados durante o atendimento.
            </p>
          </section>
        </article>
      </div>
    </PublicLayout>
  )
}
