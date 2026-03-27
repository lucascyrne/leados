import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type ModoEntrada = 'credito' | 'parcela'

type SimuladorState = {
  valorDesejado: number | null
  parcelaDesejada: number | null
  modoEntrada: ModoEntrada
  setFromSimulador: (patch: {
    valorDesejado?: number | null
    parcelaDesejada?: number | null
    modoEntrada?: ModoEntrada
  }) => void
  reset: () => void
}

const initial = {
  valorDesejado: null as number | null,
  parcelaDesejada: null as number | null,
  modoEntrada: 'credito' as ModoEntrada,
}

export const useSimuladorStore = create<SimuladorState>()(
  persist(
    (set) => ({
      ...initial,
      setFromSimulador: (patch) => set((s) => ({ ...s, ...patch })),
      reset: () => set(initial),
    }),
    {
      name: 'leados-simulador',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        valorDesejado: s.valorDesejado,
        parcelaDesejada: s.parcelaDesejada,
        modoEntrada: s.modoEntrada,
      }),
    },
  ),
)
