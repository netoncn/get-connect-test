# GetConnect — Frontend

Interface web do GetConnect, construída com Angular 21 e Tailwind CSS 4.

## Stack

- **Angular 21** — Framework web com standalone components e signals
- **Tailwind CSS 4** — Estilização com design tokens customizados (oklch)
- **TypeScript 5.9** — Tipagem estática
- **RxJS** — Programação reativa
- **Vitest** — Testes unitários

## Estrutura

```
src/
├── app/
│   ├── core/
│   │   ├── services/       # API, Auth, Theme, i18n, Lists, Items, Catalog
│   │   ├── models/         # Interfaces TypeScript (User, List, Item, Invite, Catalog)
│   │   ├── guards/         # authGuard e publicGuard
│   │   └── interceptors/   # Token JWT e tratamento de erros 401
│   ├── features/
│   │   ├── auth/           # Login e registro
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── home/           # Página inicial (redirecionamento)
│   │   ├── lists/          # Gerenciamento de listas
│   │   │   ├── list-index/ # Listagem de listas
│   │   │   ├── list-detail/ # Detalhe da lista (itens, membros)
│   │   │   └── components/ # Cards, formulários, modais (edit-item, invite)
│   │   └── invite/         # Aceitar convite
│   ├── layout/
│   │   ├── header/         # Header principal (tema, idioma, logout)
│   │   ├── auth-header/    # Header das páginas de auth
│   │   └── main-layout/    # Layout com header + router-outlet
│   └── shared/
│       └── pipes/          # TranslatePipe (i18n)
├── assets/
│   └── i18n/
│       ├── en.json         # Traduções em inglês
│       └── pt-BR.json      # Traduções em português
├── environments/
│   ├── environment.ts      # Configuração de desenvolvimento
│   └── environment.prod.ts # Configuração de produção
├── styles.css              # Tema (paleta pink-violet) + estilos globais
└── index.html              # HTML base com Google Fonts (Inter)
```

## Instalação

```bash
pnpm install
```

## Executar

```bash
# Desenvolvimento (com proxy para API em localhost:3333)
pnpm start

# Ou diretamente
pnpm exec ng serve
```

Acesse http://localhost:4200

## Build

```bash
# Build de produção
pnpm build

# Build de desenvolvimento
pnpm build:dev
```

Os artefatos são gerados em `dist/frontend/browser/`.

## Testes

```bash
pnpm test
```

## Funcionalidades

### Autenticação
- Login e registro com validação de formulários
- JWT armazenado em localStorage
- Interceptor automático para injetar token nas requisições
- Logout automático em caso de token expirado (401)

### Listas
- Criar, visualizar e excluir listas
- Detalhes da lista com itens e membros
- Convidar membros por e-mail com papel (Editor / Viewer) — somente emails cadastrados
- Convites pendentes exibidos na tela de listas com botões de aceitar/recusar

### Itens
- Adicionar itens personalizados ou livros
- Autocomplete com busca na Open Library
- Editar título e notas de itens personalizados (OTHER) via modal
- Marcar item como concluído
- Metadados de livros (autores, capa, ISBN)

### Tema
- Claro/escuro com detecção de preferência do sistema
- Toggle persistente em localStorage
- Paleta pink-violet customizada via `@theme` (oklch)

### Internacionalização (i18n)
- Português (pt-BR) e Inglês (en)
- Troca de idioma em tempo real sem recarregar
- TranslatePipe compatível com signals (`string | null | undefined`)

## Proxy de API

Em desenvolvimento, o Angular Dev Server faz proxy das chamadas `/api` para o backend:

- **Local**: `proxy.conf.json` → `http://localhost:3333`
- **Docker**: `proxy.conf.docker.json` → `http://api:3333`

## Design Tokens

A paleta de cores é definida em `styles.css` via `@theme` do Tailwind CSS 4:

```css
@theme {
  /* Pink-violet palette - based on #C054A0 */
  --color-primary-50: oklch(96.5% 0.015 330);
  /* ... */
  --color-primary-950: oklch(25.0% 0.075 330);
}
```

Todos os componentes usam classes `primary-*` (nunca `blue-*`), facilitando a troca de tema alterando apenas o hue.

## Docker

O Dockerfile possui 3 estágios:

- **base** — Instala dependências
- **dev** — Roda `ng serve` com `--poll 2000` para hot-reload via Docker volumes
- **prod** — Build de produção servido com Nginx

```bash
# Via docker-compose na raiz do projeto
docker compose up web --build
```

## Componentes

Todos os componentes usam arquivos separados para lógica (`.component.ts`) e template (`.component.html`). Não há inline templates.
