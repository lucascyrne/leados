# Fase 1 — Tipos, dados reais e utilitários (núcleo de negócio)

## Objetivo

Isolar **toda** a lógica de negócio em funções puras e tipos, testáveis sem UI, usando **exatamente** os dados e regras abaixo (espelho da referência canónica).

## Pré-requisitos

- Fase 0 concluída.

## Dados reais (obrigatório — copiar para código)

Créditos e parcelas **exatos**:

| Crédito (R$) | Parcela (R$) |
|-------------:|-------------:|
| 50.000       | 348,00       |
| 80.000       | 451,60       |
| 100.000      | 337,30       |
| 120.000      | 677,40       |
| 200.000      | 674,60       |
| 500.000      | 1.800,00     |
| 800.000      | 2.880,00     |

Fonte única no código: ex. [`src/utils/creditTable.ts`](../../src/utils/creditTable.ts) (caminho alvo após implementação).

## Regras de classificação (obrigatório — ordem fixa)

1. **HIGH VALUE**: `renda >= 8000` **e** `parcela >= 800`
2. **LOW VALUE QUALIFICADO**: se não for HIGH, **e** `renda >= 3000` **e** `parcela >= 300` **e** objetivo definido (`trim().length > 0`)
3. **DESCARTADO**: caso contrário

Categorias persistidas sugeridas: `HIGH`, `LOW`, `DESCARTADO`.

> Dupla verificação: [`REFERENCIA-DADOS-CANONICOS.md`](REFERENCIA-DADOS-CANONICOS.md)

## Ficheiros sugeridos

| Ficheiro | Responsabilidade |
|----------|------------------|
| `src/types/lead.ts` | `Lead`, `CategoriaLead`, `StatusLead`, payload do formulário, tipos de resposta de classificação |
| `src/utils/creditTable.ts` | Array constante dos 7 pares; helpers `getParcelaForCredito(exato)`, listagem ordenada por crédito para UI |
| `src/utils/currency.ts` | `formatBRL`, parse de string mascarada → `number` (centavos ou decimal — documentar) |
| `src/utils/parcelEstimate.ts` | Para valores **não** na tabela: estratégia documentada (ex.: interpolação linear entre vizinhos por **valor de crédito** ordenado); **se** o valor coincidir com entrada da tabela, devolver **sempre** a parcela oficial |
| `src/utils/score.ts` | `classifyLead(renda, parcela, objetivo)` → `{ score: 0..100, categoria }` |

## Score 0–100

O prompt não define fórmula. Implementar algo **determinístico**, por exemplo:

- Faixa base por categoria: HIGH → 80–100, LOW → 40–79, DESCARTADO → 0–39
- Ajuste fino dentro da faixa com base em distância aos limiares (renda/parcela) para permitir ordenação e filtros no admin

Documentar a fórmula em comentário no topo de `score.ts`.

## Testes (recomendado)

- Limiares: `7999` vs `8000` renda; `799` vs `800` parcela; `2999` vs `3000`; `299` vs `300` parcela
- Objetivo vazio impede LOW mesmo com renda/parcela altas (mas HIGH não depende de objetivo)
- Valores da tabela: cada um dos 7 pares retorna parcela exata

## Critérios de conclusão

- Nenhum valor da tabela diverge da referência.
- Ordem HIGH → LOW → DESCARTADO está coberta por testes ou checklist manual documentado.
- Utils exportados são usáveis a partir de formulário e simulador nas fases seguintes.

## Próximo passo

- [`fase-2-supabase.md`](fase-2-supabase.md)
