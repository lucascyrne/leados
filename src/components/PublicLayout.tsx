import { Link } from 'react-router-dom'
import Footer from '@/components/Footer'
import { cn } from '@/lib/utils'

type PublicLayoutProps = {
  children: React.ReactNode
  backgroundLayer?: React.ReactNode
  showFooter?: boolean
  /** Centraliza o conteúdo do main na altura útil abaixo do header (ex.: página de obrigado). */
  centerMain?: boolean
}

export function PublicLayout({
  children,
  backgroundLayer,
  showFooter = false,
  centerMain = false,
}: PublicLayoutProps) {
  return (
    <div
      className={cn(
        'bg-background text-foreground relative min-h-dvh w-full',
        centerMain && 'flex flex-col',
      )}
    >
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Ir para o conteúdo principal
      </a>
      <header className="bg-background/90 sticky top-0 z-50 border-b border-border backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center"
            aria-label="Leados"
          >
            <img
              src="/logo/leados-logo.png"
              alt="Leados"
              className="h-7 w-auto"
              loading="lazy"
            />
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link
              to="/simulador"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Simulador
            </Link>
          </nav>
        </div>
      </header>
      <main
        id="conteudo-principal"
        className={cn(
          'relative z-10 mx-auto w-full max-w-2xl px-4 py-8 pb-16 text-center',
          centerMain &&
            'flex flex-1 flex-col justify-center py-10 pb-20 sm:py-12 sm:pb-24',
        )}
        tabIndex={-1}
      >
        {backgroundLayer ? (
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            {backgroundLayer}
          </div>
        ) : null}
        {children}
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  )
}
