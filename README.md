# StudyVerse

StudyVerse is an elegant, all-in-one digital study workspace. This repository
contains the first product foundation: a responsive React application, a
modular NestJS API, Supabase authentication, and a PostgreSQL schema secured by
Row Level Security.

## Workspace

- `apps/web` — React 19, Vite, Tailwind CSS, shadcn/ui conventions
- `apps/api` — NestJS REST API with Swagger and Supabase JWT verification
- `packages/shared` — framework-neutral shared TypeScript contracts
- `supabase/migrations` — schema, RLS, and private Storage bucket policies
- `docs` — architecture and engineering decisions

## Requirements

- Node.js 22 or newer
- pnpm 10
- A Supabase project

Enable pnpm with Corepack when available:

```bash
corepack enable
corepack prepare pnpm@10.17.1 --activate
```

## Environment

Copy the tracked examples and provide local values:

```bash
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
```

Local `.env` files are ignored by Git. Never expose the API secret key through
a `VITE_` variable.

## Development

```bash
pnpm install
pnpm dev
```

- Web application: `http://localhost:5173`
- REST API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api/docs`

Useful checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Database

The SQL migrations are intentionally versioned in the repository but are not
automatically applied to a hosted database.

After linking the Supabase CLI to the correct project:

```bash
supabase db push
```

Review the target project before running this command. The migrations create
private buckets and enforce ownership through RLS.

## Current scope

Implemented:

- Real login, registration, logout, password-reset request, and session restore
- Public and protected route architecture
- Responsive product shell and initial design system
- Interactive 3D storybook with physical page-turn navigation
- Authenticated task, subtask, and calendar event CRUD through NestJS and RLS
- Persistent tldraw whiteboards with owner, editor, and viewer roles
- Personal library with covers, progress, and favorites
- Private PDF upload, reading, search, notes, and bookmarks
- Secure NestJS foundation, health endpoint, and current-profile endpoint
- Initial relational schema, indexes, triggers, RLS, and Storage policies

Tasks, calendar, whiteboards, library, and documents now persist user-owned
data. Live collaborator cursors remain a later realtime phase.
