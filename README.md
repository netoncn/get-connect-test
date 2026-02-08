# GetConnect

Sistema de listas compartilhadas com controle de acesso por papeis (RBAC), integração com catálogo de livros e suporte a internacionalização (pt-BR / en).

**Produção:** [getconnect.netoncn.com.br](https://getconnect.netoncn.com.br) | **API:** [api.getconnect.netoncn.com.br/api](https://api.getconnect.netoncn.com.br/api)

## Visão Geral

O GetConnect permite criar listas, convidar membros com diferentes papéis (proprietário, editor, visualizador) e adicionar itens — incluindo livros buscados automaticamente na Open Library. A aplicação suporta tema claro/escuro e troca de idioma em tempo real.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Angular 21, Tailwind CSS 4, TypeScript 5.9 |
| Backend | NestJS 11, Prisma 6, TypeScript 5.7 |
| Banco de dados | PostgreSQL 16 |
| Autenticação | JWT (Passport + Argon2) |
| Infraestrutura | Docker Compose |
| Gerenciador de pacotes | pnpm |

## Funcionalidades

- **Autenticação** — Registro e login com JWT, hash de senha com Argon2
- **Listas** — CRUD de listas com RBAC (Owner / Editor / Viewer)
- **Convites** — Convide membros por e-mail (somente usuários cadastrados); convites pendentes aparecem na tela de listas do convidado com aceite/recusa
- **Itens** — Adicione itens personalizados ou livros do catálogo; edite título e notas de itens personalizados (OTHER)
- **Catálogo de livros** — Busca na Open Library com autocomplete
- **Tema** — Claro/escuro com toggle persistente
- **i18n** — Português (pt-BR) e Inglês (en)
- **Segurança** — Helmet, CORS, rate limiting (Throttler), validação de entrada

## Estrutura do Projeto

```
GetConnect/
├── backend/                # API REST (NestJS + Prisma)
│   ├── prisma/
│   │   └── schema.prisma   # Modelos do banco de dados
│   └── src/
│       ├── auth/            # Módulo de autenticação JWT
│       ├── lists/           # CRUD de listas com guards RBAC
│       ├── invites/         # Convites e gerenciamento de membros
│       ├── items/           # CRUD de itens das listas
│       ├── catalog/         # Integração com Open Library
│       ├── prisma/          # Serviço Prisma
│       ├── config/          # Validação de configuração (Joi)
│       └── common/          # Decorators e filtros globais
├── frontend/               # SPA (Angular + Tailwind)
│   └── src/
│       ├── app/
│       │   ├── core/        # Services, guards, interceptors, models
│       │   ├── features/    # Páginas (auth, home, lists, invite)
│       │   ├── layout/      # Header, auth-header, main-layout
│       │   └── shared/      # Pipes (translate)
│       └── assets/i18n/     # Arquivos de tradução
├── docker-compose.yml
├── .env.example
└── README.md
```

## Requisitos

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- [Docker](https://www.docker.com/) e Docker Compose (para ambiente containerizado)

## Início Rápido

### Com Docker (recomendado)

```bash
# Copie o arquivo de variáveis de ambiente
cp .env.example .env

# Suba todos os serviços
docker compose up --build
```

Acesse:
- **Frontend**: http://localhost:4200
- **API**: http://localhost:3333
- **Swagger**: http://localhost:3333/api

### Desenvolvimento Local

1. Suba apenas o banco de dados:
```bash
docker compose up db -d
```

2. Backend (em um terminal):
```bash
cd backend
pnpm install
cp .env.example .env
pnpm exec prisma migrate dev
pnpm start:dev
```

3. Frontend (em outro terminal):
```bash
cd frontend
pnpm install
pnpm start
```

4. Acesse http://localhost:4200

## Variáveis de Ambiente

Copie `.env.example` para `.env` e ajuste conforme necessário.

> **Importante**: Nunca commite arquivos `.env`. Apenas os `.env.example` devem ser versionados.

### Docker Compose (`.env` na raiz)

| Variável | Descrição | Padrão |
|---|---|---|
| `POSTGRES_USER` | Usuário do PostgreSQL | `app` |
| `POSTGRES_PASSWORD` | Senha do PostgreSQL | `app` |
| `POSTGRES_DB` | Nome do banco | `app` |
| `POSTGRES_PORT` | Porta do banco | `5432` |
| `API_PORT` | Porta exposta da API | `3333` |
| `WEB_PORT` | Porta exposta do frontend | `4200` |
| `JWT_SECRET` | Chave secreta para tokens JWT | `your-secret-key` |
| `JWT_EXPIRATION` | Tempo de expiração do JWT | `7d` |
| `CORS_ORIGIN` | Origem permitida para CORS | `http://localhost:4200` |

### Backend (`backend/.env`)

| Variável | Descrição | Obrigatória |
|---|---|---|
| `DATABASE_URL` | URL de conexão PostgreSQL (Prisma) | Sim |
| `JWT_SECRET` | Chave secreta JWT (mínimo 32 caracteres) | Sim |
| `JWT_EXPIRATION` | Expiração do token | Não |
| `CORS_ORIGIN` | Origem CORS | Não |
| `PORT` | Porta da API | Não |

## Modelo de Dados

```
User ─┬─> List (criador)
      ├─> ListMember (participação com role)
      ├─> ListItem (itens criados)
      └─> ListInvite (convites enviados)

List ─┬─> ListMember[]
      ├─> ListItem[]
      └─> ListInvite[]
```

**Papéis (ListRole):** `OWNER` | `EDITOR` | `VIEWER`

**Tipos de item (ItemKind):** `BOOK` | `OTHER`

## Permissões por Papel

| Ação | Owner | Editor | Viewer |
|---|---|---|---|
| Visualizar lista | Sim | Sim | Sim |
| Atualizar nome da lista | Sim | Sim | Não |
| Excluir lista | Sim | Não | Não |
| Adicionar itens | Sim | Sim | Não |
| Editar/excluir itens | Sim | Sim | Não |
| Convidar membros | Sim | Não | Não |
| Gerenciar membros | Sim | Não | Não |

## Endpoints da API

Documentação interativa disponível no Swagger em `/api` quando o backend estiver rodando.

### Autenticação

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/register` | Registro de novo usuário |
| `POST` | `/auth/login` | Login (retorna JWT) |
| `GET` | `/auth/me` | Dados do usuário autenticado |

### Listas

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/lists` | Listar listas do usuário |
| `POST` | `/lists` | Criar nova lista |
| `GET` | `/lists/:id` | Detalhes da lista |
| `PATCH` | `/lists/:id` | Atualizar lista |
| `DELETE` | `/lists/:id` | Excluir lista (owner) |

### Membros e Convites

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/lists/:id/members` | Listar membros |
| `POST` | `/lists/:id/invites` | Convidar membro (owner, email deve existir) |
| `GET` | `/invites/pending` | Listar convites pendentes do usuário autenticado |
| `POST` | `/invites/:inviteId/accept` | Aceitar convite por ID |
| `POST` | `/invites/:inviteId/reject` | Recusar convite |
| `POST` | `/invites/:token/accept-by-token` | Aceitar convite por token (legado) |
| `PATCH` | `/lists/:id/members/:userId` | Alterar papel do membro (owner) |
| `DELETE` | `/lists/:id/members/:userId` | Remover membro (owner) |

### Itens

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/lists/:id/items` | Listar itens |
| `POST` | `/lists/:id/items` | Adicionar item (owner/editor) |
| `PATCH` | `/lists/:id/items/:itemId` | Atualizar item (owner/editor) |
| `DELETE` | `/lists/:id/items/:itemId` | Excluir item (owner/editor) |

### Catálogo

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/catalog/suggest?query=...` | Buscar livros na Open Library |

## Decisões Técnicas

### Por que NestJS + Angular?

A escolha foi direcionada pelo stack da empresa para a qual este projeto foi desenvolvido como portfólio. A empresa utiliza NestJS no backend e Angular no frontend, então o objetivo foi demonstrar domínio prático dessas tecnologias no contexto de uma aplicação real — com autenticação, RBAC, CRUD completo e integração entre camadas.

### Por que Argon2, Joi e Prisma?

Os três foram escolhidos intencionalmente para sair da zona de conforto e experimentar alternativas ao que já era familiar:

- **Argon2** — Em vez do bcrypt tradicional, optei pelo Argon2 por ser o vencedor do Password Hashing Competition (2015) e o recomendado pela OWASP. Ele é memory-hard, o que dificulta ataques com GPUs e ASICs especializados, oferecendo uma margem de segurança maior que o bcrypt.
- **Joi** — Em vez de usar `class-validator` sozinho para validar variáveis de ambiente, usei Joi integrado ao `ConfigModule` do NestJS. Ele permite validar e tipar as variáveis de ambiente no bootstrap da aplicação, falhando cedo se algo estiver faltando — ao contrário de descobrir em runtime que uma variável não existe.
- **Prisma** — Em vez de TypeORM (mais comum no ecossistema NestJS), escolhi o Prisma pela DX superior: schema declarativo, migrations automáticas, client 100% tipado gerado a partir do schema, e queries que retornam tipos exatos sem casting manual. A curva de aprendizado valeu pela produtividade e segurança de tipos.

### Por que oklch no tema de cores?

A paleta de cores do projeto é definida usando `oklch` (Oklab Lightness Chroma Hue) no `@theme` do Tailwind CSS 4, em vez de hex ou hsl tradicionais. As razões:

- **Uniformidade perceptual** — No oklch, valores iguais de lightness produzem cores que o olho humano percebe com o mesmo brilho. Em hsl, um amarelo e um azul com o mesmo `L` parecem ter brilhos completamente diferentes. Isso torna muito mais fácil criar paletas consistentes.
- **Facilidade de gerar variações** — Para criar uma escala de 50 a 950, basta variar o componente L (lightness) mantendo C (chroma) e H (hue) relativamente estáveis. O resultado é uma rampa de cores previsível e harmoniosa.
- **Troca de tema simplificada** — Para mudar a paleta inteira (ex: de pink-violet para azul), basta alterar o hue (330 → 250) e ajustar levemente o chroma. Todas as variações de claro/escuro se mantêm proporcionais.

### Outras decisões

- **JWT em localStorage** — Mais simples que cookies httpOnly para SPA; mitigado pela prevenção de XSS
- **Open Library API** — Gratuita, sem necessidade de API key, boa cobertura de livros
- **Angular Signals** — Gerenciamento de estado reativo moderno, substituindo o padrão BehaviorSubject/Observable para estado local de componentes
- **Tailwind dark mode** — Estratégia por classe para controle explícito do tema
- **RLS em nível de aplicação** — Queries Prisma sempre filtradas pelo contexto do usuário

