# Amigo Secreto — Frontend

Frontend da aplicação de Amigo Secreto, separado do backend. Implementa autenticação por cookie HTTP-only, gestão de grupos e participantes, restrições, sorteio, convites e a área pública do participante com revelação e mural anônimo.

## Requisitos

- Node.js 20+
- pnpm
- Backend em execução e configurado para aceitar credenciais por cookie

## Configuração

Copie `.env.example` para `.env` e ajuste as URLs da API e do frontend:

```ini
VITE_API_URL=http://localhost:3000
VITE_SITE_URL=http://localhost:5173
```

Em produção, configure `VITE_SITE_URL` com a origem pública do frontend (por exemplo, `https://app.exemplo.com`). Em deploys, a URL de produção da plataforma é usada automaticamente quando essa variável não for definida.

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

### Participação por link

O organizador de um grupo em `DRAFT` pode gerar, copiar, substituir ou desativar
um link na seção **Convide participantes**. Copiar reutiliza o link ativo;
somente gerar outro link invalida o anterior. A adição manual e os convites por
e-mail após o sorteio continuam disponíveis.

A rota pública `/invite/:token` preserva o convite ao entrar ou criar uma conta.
A entrada no grupo exige confirmação explícita. Antes do sorteio, a área do
participante mostra a confirmação e permite atualizar o status, sem carregar
revelação ou mensagens. Os participantes podem ser atualizados manualmente pelo
organizador, incluindo a viabilidade do sorteio; não há polling.

Requer o backend atualizado com a migration
`20261123000000_add_group_invitations` aplicada.

- `GET|POST|DELETE /groups/:groupId/invitation`
- `GET /public/group-invitations/:token`
- `POST /public/group-invitations/:token/join`

### Demais fluxos

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`
- `POST /feedback`
- `GET|POST /groups`
- `POST /groups/sync-owner-participations`
- `GET|PATCH|DELETE /groups/:groupId`
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
