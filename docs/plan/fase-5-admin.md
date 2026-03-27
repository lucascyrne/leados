# Fase 5 — Admin protegido

## Objetivo

Painel interno com autenticação Supabase, rotas guardadas, listagem e detalhe de leads, filtros por score/categoria/valor, e alteração de `status` com feedback de erro.

## Pré-requisitos

- Fase 2: RLS permite admin ler/atualizar `leads`.
- Fase 3: `useAuth` (ou equivalente).

## Rotas

| Rota | Função |
|------|--------|
| `/admin/login` | Email + senha (`signInWithPassword`); mensagens de erro claras; loading |
| `/admin/dashboard` | Resumo: contagens por `categoria` e/ou `status` (query agregada ou reduce no cliente no MVP) |
| `/admin/leads` | Lista com filtros: score (min/max), categoria, faixa `valor_desejado` |
| `/admin/lead/:id` | Detalhe completo do lead; select de `status`: `NOVO`, `QUALIFICADO`, `ENVIADO`, `CONVERTIDO` |

## Guard

- Componente `AdminRoute` (ou layout `/admin`): se não autenticado → `Navigate` para `/admin/login`.
- Opcional: verificar `role` admin (perfil) ou email allowlist; alinhar com políticas RLS.

## UI

- HeroUI: Table, Card, Select, Badge para categoria/status.
- Lista: skeleton/loading; empty state quando filtros zeram resultados.
- Detalhe: botão salvar status; tratar erro de rede/RLS.

## Dados e coerência

- Exibir `score` e `categoria` tal como gravados; estes devem ter sido calculados pelas regras em [`REFERENCIA-DADOS-CANONICOS.md`](REFERENCIA-DADOS-CANONICOS.md) no momento da criação (re-cálculo no admin opcional fora de escopo).

## Critérios de conclusão

- Utilizador não autenticado não acede a `/admin/dashboard` nem a listas.
- Admin atualiza `status` e a alteração persiste e aparece na lista após refetch.

## Próximo passo

- [`fase-6-polimento.md`](fase-6-polimento.md)
