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


# Frontend Development Guidelines

## Skills
- Use frontend-skill for new interfaces and visual redesigns.
- Use ui-ux-pro-max for design system and UX decisions.
- Use web-design-guidelines for accessibility and responsive reviews.
- Use vercel-react-best-practices for React performance.
- Use vercel-composition-patterns for reusable component architecture.

## UI/UX
- Preserve the existing visual identity.
- Prefer consistent spacing, typography and design tokens.
- Avoid unnecessary visual clutter.
- Include loading, empty, error and success states.

## Responsiveness
- Follow a mobile-first approach.
- Test layouts at 375px, 768px, 1024px and 1440px.
- Avoid horizontal overflow.
- Ensure touch-friendly controls and readable typography.

## Engineering
- Use TypeScript when supported by the project.
- Reuse existing components.
- Avoid unnecessary dependencies.
- Run lint, typecheck and available tests.
- Do not break existing functionality.
