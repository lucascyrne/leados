import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6">
          <Link to="/" className="inline-flex items-center">
            <img
              src="/logo/leados-logo.png"
              alt="Leados"
              className="h-8 w-auto"
              loading="lazy"
            />
          </Link>

          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
            Simulação informativa para apoiar tomada de decisão. O contato comercial acontece
            somente após manifestação de interesse do usuário.
          </p>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <Link className="text-muted-foreground hover:text-primary transition-colors" to="/">
              Início
            </Link>
            <Link
              className="text-muted-foreground hover:text-primary transition-colors"
              to="/simulador"
            >
              Simulador
            </Link>
            <Link
              className="text-muted-foreground hover:text-primary transition-colors"
              to="/privacy-policy"
            >
              Política de Privacidade
            </Link>
          </nav>

          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Leados. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
