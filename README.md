# Amigo Secreto — Frontend

Frontend da aplicação de Amigo Secreto, separado do backend. Implementa autenticação por cookie HTTP-only, gestão de grupos e participantes, restrições, sorteio, convites e a área pública do participante com revelação e mural anônimo.

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
- `GET|POST /groups`
- `GET|PATCH /groups/:groupId`
- `GET|POST|PATCH|DELETE /groups/:groupId/participants`
- `POST /groups/:groupId/participants/import`
- `GET|POST|DELETE /groups/:groupId/restrictions`
- `GET /groups/:groupId/sorteio/viability`
- `POST /groups/:groupId/sorteio`
- `GET /groups/:groupId/invitations`
- `POST /groups/:groupId/participants/:participantId/invite/resend`
- `POST /groups/:groupId/invitations/resend-pending`
- `GET /public/participant-access/:token`
- `POST /public/participant-access/:token/reveal`
- `GET|POST /public/participant-access/:token/messages`
