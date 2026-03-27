import { LandingLayout } from '@/components/LandingLayout'
import Footer from '@/components/Footer'
import { MinimalMotionBackground } from '@/components/MinimalMotionBackground'
import { RealExamplesSection } from '@/components/RealExamplesSection'
import { VideoHero } from '@/components/VideoHero'
import { SimuladorPanel } from '@/features/simulador/SimuladorPanel'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useTrackPageView } from '@/hooks/useTrackPageView'

export default function HomePage() {
  usePageTitle('Início')
  useTrackPageView('/')

  return (
    <>
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Ir para o simulador
      </a>
      <main id="conteudo-principal" tabIndex={-1} className="outline-none">
        <LandingLayout hero={<VideoHero />}>
          <div className="space-y-5 text-left">
            <div className="space-y-2">
              <p className="text-primary text-xs font-semibold uppercase tracking-[0.2em]">
                Simulação imediata
              </p>
              <h1 className="text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
                Descubra o crédito ou parcela ideal para o seu momento
              </h1>
            </div>
            <SimuladorPanel variant="landing" showExamples={false} />
          </div>
        </LandingLayout>

        <section className="minimal-surface border-t border-border">
          <MinimalMotionBackground />
          <div className="relative z-10 mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
                Mais clareza para decidir com tranquilidade
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                O fluxo foi desenhado para quem quer entender cenários com dados consistentes:
                simule, envie seus dados para retorno consultivo e siga para uma conversa humana
                sem pressão.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <article className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-foreground text-sm font-semibold">1. Simulação guiada</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Você inicia por valor de crédito ou parcela mensal, no formato mais confortável.
                </p>
              </article>
              <article className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-foreground text-sm font-semibold">2. Qualificação rápida</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Coletamos só os dados necessários para contato e continuidade do atendimento.
                </p>
              </article>
              <article className="bg-card rounded-xl border border-border p-4">
                <h3 className="text-foreground text-sm font-semibold">3. Retorno consultivo</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Um especialista humano valida opções com você, contexto a contexto.
                </p>
              </article>
            </div>

            <RealExamplesSection />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
