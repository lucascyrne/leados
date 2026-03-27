# Referência canónica — dados reais e regras de classificação

**Este ficheiro é a fonte de verdade para implementação.** Os valores e limiares abaixo **não devem ser alterados** sem decisão explícita de negócio; qualquer código, cópia de UI ou migração SQL deve alinhar-se aqui.

---

## Créditos e parcelas (valores exatos)

Usar **exatamente** estes pares (crédito → parcela mensal em R$):

| Crédito (R$) | Parcela (R$) |
|-------------:|-------------:|
| 50.000,00    | 348,00       |
| 80.000,00    | 451,60       |
| 100.000,00   | 337,30       |
| 120.000,00   | 677,40       |
| 200.000,00   | 674,60       |
| 500.000,00   | 1.800,00     |
| 800.000,00   | 2.880,00     |

**Representação sugerida no código** (números, sem formatação):

- `50000` → `348`
- `80000` → `451.60`
- `100000` → `337.30`
- `120000` → `677.40`
- `200000` → `674.60`
- `500000` → `1800`
- `800000` → `2880`

**Nota de implementação**: a relação crédito/parcela **não é monótona** entre todos os pontos (ex.: 100k tem parcela menor que 80k). O simulador deve tratar a tabela como **conjunto discreto oficial**; interpolações ou estimativas só entre vizinhos ordenados por crédito, com aviso na UI se necessário.

---

## Regras de classificação (ordem de avaliação)

Avaliar **nesta ordem** (a primeira condição satisfeita define a categoria):

### HIGH VALUE

- `renda_mensal >= 8000`
- **e** `parcela_desejada >= 800` (usar o valor numérico da parcela usada no score, em R$)

### LOW VALUE QUALIFICADO

- Caso não seja HIGH, **e**:
  - `renda_mensal >= 3000`
  - **e** `parcela_desejada >= 300`
  - **e** objetivo definido: string não vazia após `trim()` (ex.: imóvel, veículo, investimento)

### DESCARTADO

- Tudo o que ficar abaixo dos critérios acima (inclui objetivo vazio quando renda/parcela seriam suficientes para LOW).

---

## Mapeamento para o produto

- **Categoria persistida** (ex.: coluna `categoria`): valores sugeridos `HIGH`, `LOW`, `DESCARTADO` (alinhados ao prompt original).
- **Score 0–100**: não definido pelo negócio; definir na Fase 1 uma função determinística documentada em [`fase-1-tipos-utils-e-negocio.md`](fase-1-tipos-utils-e-negocio.md), coerente com estas três faixas.

---

## Comissões (referência — valor do crédito)

Faixas por **valor do crédito** (R$), com **ISS 16%** sobre a comissão. Usar estes intervalos e percentuais em qualquer UI ou cálculo relacionado a ganhos/comissões.

| Faixa do crédito (R$) | Comissão | ISS sobre a comissão |
|----------------------:|---------:|---------------------:|
| Até 500.000,00       | 0,5%     | 16%                  |
| Acima de 500.000,00 até 1.000.000,00 | 0,75% | 16%          |
| Acima de 1.000.000,00 | 1%       | 16%                  |

**Implementação sugerida (limites em número, sem formatação):**

- `credito <= 500_000` → comissão **0,5%**; ISS **16%** sobre a comissão.
- `500_000 < credito <= 1_000_000` → **0,75%**; ISS **16%**.
- `credito > 1_000_000` → **1%**; ISS **16%**.

---

## Ligações

- Índice geral: [`INDICE.md`](INDICE.md)
