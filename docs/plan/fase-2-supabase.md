# Fase 2 — Supabase: schema, RLS e serviços

## Objetivo

Persistir leads com `score` e `categoria` calculados no cliente, registar interações de tracking, e expor operações tipadas em `src/services/`, com políticas de segurança coerentes (público insere lead; admin lê/atualiza).

## Pré-requisitos

- Fase 1: tipos e nomes de `categoria` / `status` alinhados.
- Projeto Supabase criado; URL e anon key na `.env`.

## Schema SQL

### Tabela `leads`

| Coluna | Tipo | Notas |
|--------|------|--------|
| `id` | `uuid` | `primary key`, `default gen_random_uuid()` |
| `nome` | `text` | |
| `email` | `text` | |
| `telefone` | `text` | |
| `renda_mensal` | `numeric` | |
| `valor_desejado` | `numeric` | |
| `parcela_desejada` | `numeric` | alinhado à parcela usada na classificação |
| `objetivo` | `text` | |
| `prazo_inicio` | `text` ou `date` | conforme formato do form (documentar) |
| `score` | `integer` | 0–100 |
| `categoria` | `text` | `HIGH`, `LOW`, `DESCARTADO` |
| `status` | `text` | `NOVO`, `QUALIFICADO`, `ENVIADO`, `CONVERTIDO` — default `NOVO` |
| `created_at` | `timestamptz` | default `now()` |

**Integridade**: considerar `check` em `score` entre 0 e 100 e `check` em `status` / `categoria` com valores permitidos (opcional mas reduz lixo).

### Tabela `interacoes`

| Coluna | Tipo | Notas |
|--------|------|--------|
| `id` | `uuid` | PK default |
| `lead_id` | `uuid` | FK → `leads(id)` nullable se evento antes do lead |
| `tipo` | `text` | ex.: `page_view`, `simulador_submit`, `lead_created` |
| `payload` | `jsonb` | opcional |
| `created_at` | `timestamptz` | default `now()` |

## RLS (modelo recomendado)

- **`leads`**
  - `INSERT`: papel `anon` permitido **apenas** para colunas do formulário; `status` não enviado pelo cliente — forçar `NOVO` via default ou trigger.
  - `SELECT` / `UPDATE`: apenas utilizadores autenticados com papel de admin (ex.: tabela `profiles` com `role = 'admin'` + política por `auth.uid()`, ou allowlist de emails no MVP).
- **`interacoes`**
  - `INSERT`: `anon` se o tracking for necessário no site público.
  - `SELECT`: só admin.

Ajustar conforme política de privacidade (RGPD): minimizar dados em `payload`.

## Serviços (`src/services/`)

| Ficheiro | Funções |
|----------|---------|
| `supabaseClient.ts` | `createClient` singleton com env Vite |
| `leads.ts` | `createLead`, `listLeads` (filtros: score min/max, categoria, faixa `valor_desejado`), `getLeadById`, `updateLeadStatus` |
| `interacoes.ts` | `logInteracao` |

Padronizar retorno: `{ data, error }` tipado para a camada UI tratar erros de rede/RLS.

## Critérios de conclusão

- Migrações aplicadas no projeto Supabase (ou SQL versionado no repo).
- `createLead` a partir de um script ou página de teste grava linha com `score`/`categoria` corretos.
- Utilizador anónimo **não** consegue listar leads; admin consegue.

## Referência de negócio

Classificação e limites numéricos: [`REFERENCIA-DADOS-CANONICOS.md`](REFERENCIA-DADOS-CANONICOS.md)

## Próximo passo

- [`fase-3-estado-hooks.md`](fase-3-estado-hooks.md)
