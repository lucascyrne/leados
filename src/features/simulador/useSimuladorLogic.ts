import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logInteracao } from '@/services/interacoes'
import { useSimuladorStore } from '@/store/simuladorStore'
import {
  CREDIT_PARCEL_PAIRS,
  getParcelaForCredito,
} from '@/utils/creditTable'
import {
  estimateCreditoForParcela,
  estimateParcelaForCredito,
} from '@/utils/parcelEstimate'

function roundMoney(n: number) {
  return Math.round(n * 100) / 100
}

export function useSimuladorLogic() {
  const navigate = useNavigate()
  const setFromSimulador = useSimuladorStore((s) => s.setFromSimulador)
  const storedCred = useSimuladorStore((s) => s.valorDesejado)
  const storedParc = useSimuladorStore((s) => s.parcelaDesejada)
  const modoEntrada = useSimuladorStore((s) => s.modoEntrada)

  const [credito, setCredito] = useState<number | null>(storedCred)
  const [parcela, setParcela] = useState<number | null>(storedParc)

  const resultado = useMemo(() => {
    if (modoEntrada === 'credito') {
      if (credito == null || credito <= 0) return null
      const p = estimateParcelaForCredito(credito)
      const oficial = getParcelaForCredito(credito)
      return { tipo: 'parcela' as const, valor: p, oficial: oficial !== undefined }
    }
    if (parcela == null || parcela <= 0) return null
    const c = estimateCreditoForParcela(parcela)
    const oficial = CREDIT_PARCEL_PAIRS.some(
      (row) => Math.abs(row.parcela - parcela) < 0.02,
    )
    return { tipo: 'credito' as const, valor: c, oficial }
  }, [modoEntrada, credito, parcela])

  function continuar() {
    if (modoEntrada === 'credito') {
      if (credito == null || credito <= 0) return
      const p = estimateParcelaForCredito(credito)
      setFromSimulador({
        valorDesejado: credito,
        parcelaDesejada: p,
        modoEntrada: 'credito',
      })
      void logInteracao({
        tipo: 'simulador_submit',
        payload: {
          modo: 'credito',
          credito: roundMoney(credito),
          parcela_estimada: roundMoney(p),
        },
      }).then(
        () => {},
        () => {},
      )
    } else {
      if (parcela == null || parcela <= 0) return
      const c = estimateCreditoForParcela(parcela)
      setFromSimulador({
        valorDesejado: c,
        parcelaDesejada: parcela,
        modoEntrada: 'parcela',
      })
      void logInteracao({
        tipo: 'simulador_submit',
        payload: {
          modo: 'parcela',
          parcela: roundMoney(parcela),
          credito_estimado: roundMoney(c),
        },
      }).then(
        () => {},
        () => {},
      )
    }
    navigate('/qualificacao')
  }

  const podeContinuar =
    modoEntrada === 'credito'
      ? credito != null && credito > 0
      : parcela != null && parcela > 0

  return {
    setFromSimulador,
    modoEntrada,
    credito,
    setCredito,
    parcela,
    setParcela,
    resultado,
    continuar,
    podeContinuar,
  }
}
