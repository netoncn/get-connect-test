# GetConnect — Backend

API REST do GetConnect, construída com NestJS 11 e Prisma 6 sobre PostgreSQL.

## Stack

- **NestJS 11** — Framework Node.js
- **Prisma 6** — ORM com PostgreSQL
- **Passport + JWT** — Autenticação
- **Argon2** — Hash de senhas
- **Swagger** — Documentação automática da API
- **Helmet** — Headers de segurança
- **Throttler** — Rate limiting
- **Joi** — Validação de variáveis de ambiente
- **class-validator / class-transformer** — Validação de DTOs

## Estrutura

```
src/
├── auth/               # Autenticação JWT
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/     # JWT strategy (Passport)
│   ├── guards/         # JWT guard global
│   ├── decorators/     # @CurrentUser(), @Public()
│   └── dto/            # Register, Login, AuthResponse
├── lists/              # CRUD de listas
│   ├── lists.controller.ts
│   ├── lists.service.ts
│   ├── guards/         # ListAccess e ListRole guards
│   ├── decorators/     # @ListRoles()
│   └── dto/
├── invites/            # Convites e membros (com verificação de email)
│   ├── invites.controller.ts
│   ├── invites.service.ts
│   └── dto/            # Create, Update, Invite, PendingInvite DTOs
├── items/              # Itens das listas
│   ├── items.controller.ts
│   ├── items.service.ts
│   └── dto/
├── catalog/            # Busca de livros
│   ├── catalog.controller.ts
│   ├── catalog.service.ts
│   └── providers/      # Open Library provider
├── prisma/             # Serviço Prisma (conexão com banco)
├── config/             # Validação de config com Joi
├── common/             # Filtros globais e decorators
├── app.module.ts       # Módulo raiz
└── main.ts             # Bootstrap (Helmet, CORS, Swagger, Pipes)
```

## Instalação

```bash
pnpm install
```

## Configuração

Copie o arquivo de exemplo e ajuste:

```bash
cp .env.example .env
```

Variáveis obrigatórias:

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://app:app@localhost:5432/app?schema=public` |
| `JWT_SECRET` | Chave secreta JWT (mín. 32 caracteres) | `sua-chave-super-secreta-aqui` |

Variáveis opcionais:

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3333` | Porta da API |
| `JWT_EXPIRATION` | `7d` | Expiração do token |
| `CORS_ORIGIN` | `http://localhost:4200` | Origem CORS permitida |

## Banco de Dados

### Rodar migrations

```bash
pnpm exec prisma migrate dev
```

### Criar migration manualmente

```bash
pnpm exec prisma migrate dev --name <nome_da_migration> --create-only
```

### Gerar Prisma Client

```bash
pnpm exec prisma generate
```

### Visualizar banco (Prisma Studio)

```bash
pnpm exec prisma studio
```

## Executar

```bash
# Desenvolvimento (hot-reload)
pnpm start:dev

# Produção
pnpm build
pnpm start:prod
```

## Testes

```bash
# Testes unitários
pnpm test

# Testes e2e
pnpm test:e2e

# Cobertura
pnpm test:cov
```

## Documentação da API

Com o servidor rodando, acesse o Swagger em:

```
http://localhost:3333/api
```

## Docker

O Dockerfile possui 3 estágios:

- **base** — Instala dependências e gera Prisma Client
- **dev** — Roda `pnpm start:dev` com hot-reload
- **prod** — Build de produção com `entrypoint.sh` que auto-cria o banco e roda migrations

```bash
# Build da imagem
docker build -t getconnect-api .

# Ou via docker-compose na raiz do projeto
docker compose up api --build
```

## Segurança

- **Helmet** — Headers HTTP seguros
- **CORS** — Origem configurável
- **Rate limiting** — 3 req/s (curto), 20 req/10s (médio), 60 req/min (longo)
- **ValidationPipe** — Whitelist + forbidNonWhitelisted em todos os DTOs
- **Argon2** — Hash de senha memory-hard
- **JWT** — Tokens assinados com expiração configurável
