# Fase 3 — Estado global (Zustand) e hooks

## Objetivo

Partilhar dados entre simulador e qualificação sem prop drilling, espelhar sessão admin para UI, e centralizar carregamento/filtragem de leads no painel.

## Pré-requisitos

- Fase 2: `leads.ts` e auth Supabase disponíveis para chamadas reais ou mock.

## Zustand

### `src/store/simuladorStore.ts`

- Estado: `valorDesejado` (number | null), `parcelaDesejada` (number | null), eventualmente `modoEntrada` (`'credito' | 'parcela'`).
- Ações: `setFromSimulador`, `reset`.
- **Uso**: após `/simulador`, pré-preencher `/qualificacao` (RHF `defaultValues` ou `reset` no mount).

### `src/store/authStore.ts` (opcional)

- Espelhar `session` / `user` a partir de `supabase.auth.onAuthStateChange`.
- Alternativa: apenas `useAuth` com `useState`/`useEffect` — escolher um padrão e manter consistente no admin.

## Hooks

### `src/hooks/useAuth.ts`

- Retornar: `user`, `session`, `loading`, `signIn`, `signOut`.
- Tratar estado inicial assíncrono (evitar flash de login incorreto).

### `src/hooks/useLeads.ts`

- Parâmetros: filtros opcionais (score min/max, categoria, min/max `valor_desejado`).
- Retornar: `leads`, `loading`, `error`, `refetch`.
- Internamente chamar `listLeads` do service; debounce opcional para filtros de UI.

## Critérios de conclusão

- Navegar simulador → qualificação mantém valores escolhidos após refresh **se** decidir persistir em `sessionStorage` (opcional); no mínimo na mesma sessão de SPA funciona.
- Admin: após login, `useAuth` reflete sessão até logout.

## Referência de negócio

Valores exibidos no simulador devem continuar a respeitar [`REFERENCIA-DADOS-CANONICOS.md`](REFERENCIA-DADOS-CANONICOS.md).

## Próximo passo

- [`fase-4-ui-publica.md`](fase-4-ui-publica.md)
