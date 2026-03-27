# Fase 6 — Polimento (UX técnica, tracking, qualidade)

## Objetivo

Uniformizar loading e erros, reforçar validação e máscaras onde faltar, completar tracking em `interacoes`, e revisar acessibilidade — sem alterar os **valores canónicos** de crédito/parcela nem as **regras** de classificação.

## Pré-requisitos

- Fluxo público e admin funcional (Fases 4–5).

## Loading

- `Suspense` nas rotas lazy com fallback consistente (spinner/skeleton HeroUI).
- Botões de submit com `isLoading` / disabled durante chamadas Supabase.
- Listas admin: skeleton nas primeiras cargas.

## Erros

- Padrão único: serviços devolvem `error`; páginas mostram Callout/Toast com mensagem humana (e detalhe técnico só em dev).
- Opcional: Error Boundary na raiz ou por layout admin.

## Validação e máscaras

- Revisar todos os campos monetários: mesma pipeline parse/format que na Fase 1.
- Telefone e email: mensagens Zod específicas.

## Tracking (`interacoes`)

Eventos sugeridos (ajustar à política de dados):

- Visualização de landing / simulador (se permitido)
- Submissão do simulador (tipo + payload mínimo)
- Lead criado (já referido na Fase 4)

Garantir que `INSERT` anon está coberto por RLS da Fase 2.

## Acessibilidade

- Labels associados, ordem de foco, contraste, anúncio de erros no formulário.
- Teclado: CTAs e navegação admin utilizáveis sem rato.

## SEO (opcional)

- `document.title` ou `react-helmet-async` por rota pública — só se o escopo o permitir.

## Critérios de conclusão

- Checklist manual: rede lenta, RLS negado, submissão dupla (debounce/disable).
- Nenhuma regressão nos números oficiais: [`REFERENCIA-DADOS-CANONICOS.md`](REFERENCIA-DADOS-CANONICOS.md)

## Referência

- Índice: [`INDICE.md`](INDICE.md)
