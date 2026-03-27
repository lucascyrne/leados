# Fase 0 — Bootstrap e stack

## Objetivo

Ter um projeto React + Vite executável, com todas as dependências da stack, Tailwind + HeroUI configurados, variáveis de ambiente documentadas e **esqueleto de rotas** (públicas + `/admin/*`), sem ainda implementar lógica de negócio.

## Pré-requisitos

- Node.js LTS.
- Repositório alvo: raiz do projeto (ex.: `leados/`). Se a pasta estiver vazia, criar o projeto aqui.

## Tarefas

### 1. Projeto Vite + React + TypeScript

- Se não existir `package.json`: `npm create vite@latest . -- --template react-ts` (ou equivalente aprovado pela equipa).
- Garantir `src/` padrão Vite e build sem erros.

### 2. Dependências

Instalar e fixar versões compatíveis:

- `react-router-dom`
- `tailwindcss`, `postcss`, `autoprefixer` (fluxo Tailwind v4 ou v3 conforme doc HeroUI do momento)
- `@heroui/react` e peer dependencies indicadas em [HeroUI — Installation](https://www.heroui.com/docs/guide/installation)
- `react-hook-form`, `@hookform/resolvers`, `zod`
- `zustand`
- `@supabase/supabase-js`

### 3. Configuração

- Configurar Tailwind + plugin/content HeroUI conforme documentação atual (evitar drift de versão).
- Criar `.env.example` com:
  - `VITE_SUPABASE_URL=`
  - `VITE_SUPABASE_ANON_KEY=`
- Não commitar secrets; documentar no README interno se necessário.

### 4. Estrutura de pastas

Criar diretórios vazios (ou com `index` mínimo) em `src/`:

- `components/`
- `pages/`
- `hooks/`
- `services/`
- `store/`
- `utils/`
- `types/`

### 5. Router base

- Em `App.tsx` ou módulo dedicado: `BrowserRouter`, `Routes`, `Route`.
- Rotas placeholder (componente “Em construção” ou vazio):
  - `/`, `/simulador`, `/qualificacao`, `/obrigado`
  - `/admin/login`, `/admin/dashboard`, `/admin/leads`, `/admin/lead/:id`
- Preparar **lazy loading** (`React.lazy` + `Suspense`) para páginas admin e, opcionalmente, públicas — alinha ao requisito “multi-page” sem carregar tudo de uma vez.

### 6. Provider HeroUI

- Envolver a árvore da app com o provider exigido pelo HeroUI (nome exato na doc da versão instalada).

## Critérios de conclusão

- `npm run dev` sobe sem erros.
- Navegação manual entre rotas placeholder funciona.
- Tailwind + um componente HeroUI de teste renderiza corretamente.

## Referência de negócio

Os valores de crédito/parcela e regras de classificação estão em **[`REFERENCIA-DADOS-CANONICOS.md`](REFERENCIA-DADOS-CANONICOS.md)** — nesta fase ainda não são codificados.

## Próximo passo

- [`fase-1-tipos-utils-e-negocio.md`](fase-1-tipos-utils-e-negocio.md)
