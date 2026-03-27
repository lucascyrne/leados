import { MinimalMotionBackground } from '@/components/MinimalMotionBackground'

type LandingLayoutProps = {
  hero: React.ReactNode
  children: React.ReactNode
}

/** Landing em duas colunas: vídeo narrativo + painel (simulador). Em mobile, vídeo em cima. */
export function LandingLayout({ hero, children }: LandingLayoutProps) {
  return (
    <section className="bg-background grid min-h-dvh w-full grid-cols-1 lg:h-dvh lg:grid-cols-2">
      <div className="relative h-[32dvh] min-h-[220px] w-full lg:h-full lg:min-h-0">{hero}</div>
      <div className="minimal-surface text-card-foreground flex min-h-[68dvh] w-full flex-col justify-center border-t border-border lg:h-full lg:min-h-0 lg:border-l lg:border-t-0">
        <MinimalMotionBackground />
        <div className="relative z-10 mx-auto w-full max-w-xl px-4 py-5 sm:px-5 sm:py-6 lg:px-10 lg:py-8">
          {children}
        </div>
      </div>
    </section>
  )
}
