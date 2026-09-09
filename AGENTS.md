# Regras do projeto

- Use `pnpm` para dependências e scripts.
- A aplicação usa React, TypeScript e Vite.
- Use TanStack Query para dados vindos do backend.
- Use React Hook Form e Zod em formulários.
- Centralize chamadas HTTP em `src/lib/http.ts` e serviços; não use `fetch` diretamente em páginas ou componentes.
- A autenticação depende de cookie HTTP-only. Nunca armazene JWT em `localStorage`, `sessionStorage` ou estado React.
- Não introduza Redux sem solicitação explícita.
- Não antecipe funcionalidades fora da SPEC atual.
- Mantenha componentes pequenos, CSS simples e a estrutura enxuta.
- Antes de concluir, execute `pnpm typecheck`, `pnpm lint`, `pnpm test` e `pnpm build`.
