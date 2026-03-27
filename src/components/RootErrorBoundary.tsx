import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }

type State = { hasError: boolean }

/** Limite de erros na raiz: evita ecrã em branco silencioso em falhas de render. */
export class RootErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[RootErrorBoundary]', error, info.componentStack)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="bg-background text-foreground flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center"
          role="alert"
        >
          <p className="text-foreground max-w-md text-lg font-medium">
            Algo correu mal ao carregar a aplicação.
          </p>
          <button
            type="button"
            className="border-input bg-background hover:bg-accent rounded-lg border px-4 py-2 text-sm font-medium"
            onClick={() => window.location.reload()}
          >
            Recarregar página
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
