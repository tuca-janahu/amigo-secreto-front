# Amigo Secreto — Frontend

Frontend da aplicação de Amigo Secreto, separado do backend. Esta primeira versão implementa cadastro, login, sessão por cookie HTTP-only e uma área autenticada inicial.

## Requisitos

- Node.js 20+
- pnpm
- Backend em execução e configurado para aceitar credenciais por cookie

## Configuração

Copie `.env.example` para `.env` e ajuste a URL da API:

```ini
VITE_API_URL=http://localhost:3000
```

Depois, execute:

```bash
pnpm install
pnpm dev
```

## Verificação

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Endpoints consumidos

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`
