import type { CategoriaLead, StatusLead } from '@/types/lead'

const statusClasses: Record<StatusLead, string> = {
  NOVO: 'bg-sky-100 text-sky-800',
  QUALIFICADO: 'bg-amber-100 text-amber-800',
  ENVIADO: 'bg-indigo-100 text-indigo-800',
  CONVERTIDO: 'bg-emerald-100 text-emerald-800',
}

const categoriaClasses: Record<CategoriaLead, string> = {
  HIGH: 'bg-emerald-100 text-emerald-800',
  LOW: 'bg-amber-100 text-amber-800',
  DESCARTADO: 'bg-rose-100 text-rose-800',
}

export function AdminStatusBadge({ status }: { status: StatusLead }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses[status]}`}>
      {status}
    </span>
  )
}

export function AdminCategoriaBadge({ categoria }: { categoria: CategoriaLead }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${categoriaClasses[categoria]}`}
    >
      {categoria}
    </span>
  )
}
