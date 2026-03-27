import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

/** Fallback consistente para rotas `lazy` + Suspense (spinner + skeleton). */
export function RouteFallback() {
  return (
    <div
      className="bg-background flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 py-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2
        className="text-primary size-10 animate-spin"
        aria-hidden
      />
      <div className="w-full max-w-md space-y-3">
        <Skeleton className="h-4 w-[60%] max-w-xs rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-[80%] max-w-sm rounded-md" />
      </div>
      <span className="text-muted-foreground sr-only">A carregar página…</span>
    </div>
  )
}
