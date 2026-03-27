import { useMemo, useState } from 'react'
import { AdminCategoriaBadge, AdminStatusBadge } from '@/components/admin/AdminBadges'
import { AdminKpiCards } from '@/components/admin/AdminKpiCards'
import { AdminEmptyState, AdminErrorState } from '@/components/admin/AdminStates'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLeads } from '@/hooks/useLeads'
import { exportLeadsPdf } from '@/services/adminExport'
import type { CategoriaLead, Lead, StatusLead } from '@/types/lead'
import {
  ISS_SOBRE_COMISSAO_PERCENT,
  getCommissionTierForCredito,
} from '@/utils/commissionTiers'
import { formatBRL } from '@/utils/currency'
import { userFacingError } from '@/utils/serviceError'

export default function LeadsPage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [categoria, setCategoria] = useState<CategoriaLead | ''>('')
  const [status, setStatus] = useState<StatusLead | ''>('')
  const [scoreMin, setScoreMin] = useState('')
  const [scoreMax, setScoreMax] = useState('')
  const [valorDesejadoMin, setValorDesejadoMin] = useState('')
  const [valorDesejadoMax, setValorDesejadoMax] = useState('')
  const [exporting, setExporting] = useState(false)

  const filters = useMemo(
    () => ({
      q: q.trim() || undefined,
      categoria: categoria || undefined,
      status: status || undefined,
      scoreMin: scoreMin ? Number(scoreMin) : undefined,
      scoreMax: scoreMax ? Number(scoreMax) : undefined,
      valorDesejadoMin: valorDesejadoMin ? Number(valorDesejadoMin) : undefined,
      valorDesejadoMax: valorDesejadoMax ? Number(valorDesejadoMax) : undefined,
    }),
    [categoria, q, scoreMax, scoreMin, status, valorDesejadoMax, valorDesejadoMin],
  )
  const { leads, loading, error, refetch } = useLeads(filters)

  const comissaoResumo = useMemo(() => {
    let bruto = 0
    let liquido = 0
    leads.forEach((lead: Lead) => {
      const tier = getCommissionTierForCredito(lead.valor_desejado)
      const valorBruto = (lead.valor_desejado * tier.comissaoPercent) / 100
      const valorLiquido = valorBruto * (1 - ISS_SOBRE_COMISSAO_PERCENT / 100)
      bruto += valorBruto
      liquido += valorLiquido
    })
    return { bruto, liquido }
  }, [leads])

  const ticketMedio = leads.length
    ? leads.reduce((acc, lead) => acc + lead.valor_desejado, 0) / leads.length
    : 0

  async function onExportPdf() {
    setExporting(true)
    const { error } = await exportLeadsPdf(filters)
    setExporting(false)
    if (error) {
      toast.error('Falha ao exportar PDF', {
        description: userFacingError(error, 'Tente novamente em instantes.'),
      })
      return
    }
    toast.success('PDF gerado com sucesso.')
  }

  function limparFiltros() {
    setQ('')
    setCategoria('')
    setStatus('')
    setScoreMin('')
    setScoreMax('')
    setValorDesejadoMin('')
    setValorDesejadoMax('')
  }

  return (
    <div className="bg-background text-foreground mx-auto max-w-6xl space-y-5 p-6">
      <h1 className="mb-2 text-2xl font-semibold">Admin · Leads</h1>

      <AdminKpiCards
        totalLeads={leads.length}
        ticketMedio={ticketMedio}
        comissaoLiquidaTotal={comissaoResumo.liquido}
      />

      <section className="rounded-lg border border-border bg-card p-4 text-left">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            placeholder="Busca por nome/e-mail/telefone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaLead | '')}
          >
            <option value="">Categoria (todas)</option>
            <option value="HIGH">HIGH</option>
            <option value="LOW">LOW</option>
            <option value="DESCARTADO">DESCARTADO</option>
          </select>
          <select
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusLead | '')}
          >
            <option value="">Status (todos)</option>
            <option value="NOVO">NOVO</option>
            <option value="QUALIFICADO">QUALIFICADO</option>
            <option value="ENVIADO">ENVIADO</option>
            <option value="CONVERTIDO">CONVERTIDO</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
              placeholder="Score mín."
              type="number"
              value={scoreMin}
              onChange={(e) => setScoreMin(e.target.value)}
            />
            <input
              className="border-input bg-background rounded-md border px-3 py-2 text-sm"
              placeholder="Score máx."
              type="number"
              value={scoreMax}
              onChange={(e) => setScoreMax(e.target.value)}
            />
          </div>
          <input
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            placeholder="Valor mín. (R$)"
            type="number"
            value={valorDesejadoMin}
            onChange={(e) => setValorDesejadoMin(e.target.value)}
          />
          <input
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            placeholder="Valor máx. (R$)"
            type="number"
            value={valorDesejadoMax}
            onChange={(e) => setValorDesejadoMax(e.target.value)}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => void refetch()}>
            Aplicar filtros
          </Button>
          <Button size="sm" variant="outline" onClick={limparFiltros}>
            Limpar filtros
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4 text-left">
        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </Button>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Atualizar
          </Button>
          <Button size="sm" onClick={() => void onExportPdf()} disabled={exporting || loading}>
            {exporting ? 'Exportando…' : 'Exportar PDF'}
          </Button>
        </div>

        <div className="mb-6">
          <p className="text-muted-foreground text-xs">
            Comissão potencial (bruta): {formatBRL(comissaoResumo.bruto)} · líquida (ISS{' '}
            {ISS_SOBRE_COMISSAO_PERCENT}%): {formatBRL(comissaoResumo.liquido)}
          </p>
        </div>

        {loading ? (
          <ul
            className="divide-border border-border divide-y rounded-md border text-left text-sm"
            aria-busy="true"
            aria-label="A carregar leads"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="px-3 py-3">
                <Skeleton className="h-4 w-full max-w-md rounded-md" />
              </li>
            ))}
          </ul>
        ) : error ? (
          <AdminErrorState message={userFacingError(error, 'Não foi possível carregar os leads.')} />
        ) : leads.length === 0 ? (
          <AdminEmptyState message="Nenhum lead encontrado para os filtros atuais." />
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Nome</th>
                  <th className="px-3 py-2 text-left">Contato</th>
                  <th className="px-3 py-2 text-left">Score</th>
                  <th className="px-3 py-2 text-left">Categoria</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Valor desejado</th>
                  <th className="px-3 py-2 text-left">Comissão líquida</th>
                  <th className="px-3 py-2 text-left">Criado em</th>
                  <th className="px-3 py-2 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => {
                  const tier = getCommissionTierForCredito(l.valor_desejado)
                  const bruto = (l.valor_desejado * tier.comissaoPercent) / 100
                  const liquido = bruto * (1 - ISS_SOBRE_COMISSAO_PERCENT / 100)
                  return (
                    <tr key={l.id} className="border-t border-border">
                      <td className="px-3 py-2">{l.nome}</td>
                      <td className="px-3 py-2">
                        <div className="text-xs">
                          <p>{l.email}</p>
                          <p className="text-muted-foreground">{l.telefone ?? '-'}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2 font-medium">{l.score}</td>
                      <td className="px-3 py-2">
                        <AdminCategoriaBadge categoria={l.categoria} />
                      </td>
                      <td className="px-3 py-2">
                        <AdminStatusBadge status={l.status} />
                      </td>
                      <td className="px-3 py-2">{formatBRL(l.valor_desejado)}</td>
                      <td className="px-3 py-2">{formatBRL(liquido)}</td>
                      <td className="px-3 py-2">
                        {new Date(l.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/lead/${l.id}`)}
                        >
                          Detalhe
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
