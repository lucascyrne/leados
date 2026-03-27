# Fase 4 — UI pública (mobile-first, HeroUI + Tailwind)

## Objetivo

Implementar o funil público com tom **consultivo** (sem pressão agressiva), formulário validado (RHF + Zod), máscaras monetárias, estados de loading/erro, e **exemplos numéricos idênticos** à referência canónica.

## Pré-requisitos

- Fases 0–3: router, utils, serviços, store do simulador.

## Dados reais na interface (obrigatório)

A landing e o simulador devem mostrar **exatamente** estes exemplos quando listarem cenários oficiais:

| Crédito | Parcela |
|--------:|--------:|
| R$ 50.000 | R$ 348 |
| R$ 80.000 | R$ 451,60 |
| R$ 100.000 | R$ 337,30 |
| R$ 120.000 | R$ 677,40 |
| R$ 200.000 | R$ 674,60 |
| R$ 500.000 | R$ 1.800,00 |
| R$ 800.000 | R$ 2.880,00 |

Fonte: derivar labels de `creditTable` + `formatBRL` para evitar divergência manual.

> [`REFERENCIA-DADOS-CANONICOS.md`](REFERENCIA-DADOS-CANONICOS.md)

## Componentes sugeridos (`src/components/`)

- `Layout` / `PublicLayout`: container mobile-first, tipografia consistente.
- `RealExamplesSection`: lista/card dos 7 pares (reutilizar na landing e possivelmente no simulador).
- `CurrencyInput`: máscara BRL, integração com RHF (`Controller` ou registo customizado); expõe número para validação Zod.
- `PageHeader`, `PrimaryCta` (HeroUI Button/Link).

## Páginas (`src/pages/`)

### 1. Landing `/`

- Headline: foco em crédito **sem juros abusivos**, linguagem clara.
- Secção com os 7 exemplos reais.
- CTA principal → `/simulador`.

### 2. Simulador `/simulador`

- Input: **valor desejado** **ou** **parcela** (com máscara).
- Mostrar resultado usando tabela oficial + `parcelEstimate` quando fora dos pontos; quando bater valor exato na tabela, mostrar parcela **oficial**.
- CTA → `/qualificacao`; gravar escolhas em `simuladorStore`.

### 3. Qualificação `/qualificacao`

Campos (todos obrigatórios com Zod):

- nome, email, telefone (validação forte BR), renda mensal, valor desejado, parcela desejada, objetivo (imóvel, veículo, investimento, etc.), prazo para iniciar

Fluxo no submit:

1. Calcular `score` e `categoria` com `classifyLead` (renda, parcela, objetivo) — regras em [`REFERENCIA-DADOS-CANONICOS.md`](REFERENCIA-DADOS-CANONICOS.md).
2. `insert` em `leads` com `status: 'NOVO'`.
3. Opcional: `logInteracao` `lead_created`.
4. Loading no botão; erro visível (toast ou Callout HeroUI).
5. Sucesso → navegar `/obrigado` (pode passar `id` por state ou query se necessário para tracking).

### 4. Obrigado `/obrigado`

- Feedback positivo discreto.
- CTA secundário neutro (ex.: voltar ao início ou nova simulação).

## UX

- Mobile-first, espaçamento generoso, hierarquia clara.
- Evitar copy de “últimas vagas” etc.; tom consultoria financeira.

## Critérios de conclusão

- Nenhum número da tabela de exemplos diverge da referência.
- Formulário bloqueia submissão inválida; erros acessíveis (associação label/erro).
- Fluxo completo landing → obrigado grava lead no Supabase em ambiente de staging.

## Próximo passo

- [`fase-5-admin.md`](fase-5-admin.md)
