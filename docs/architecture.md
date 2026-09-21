# StudyVerse architecture

## System boundaries

The browser owns presentation, navigation, session persistence, and
user-initiated Supabase authentication. Domain behavior belongs to the NestJS
API. PostgreSQL RLS remains the final data-access boundary.

```text
React web app
  ├─ Supabase Auth (sign in, sign up, session refresh)
  └─ NestJS REST API (Bearer access token)
       ├─ JWKS token verification
       ├─ authorization and business rules
       └─ user-scoped Supabase client
            └─ PostgreSQL + RLS
```

Large file uploads will eventually use short-lived, API-authorized upload
flows so file bytes can travel directly to Supabase Storage without routing
through the NestJS process.

## Frontend

Features own their pages, hooks, request functions, and domain components.
Reusable visual primitives live under `components/ui`; application-wide
composition lives under `app` and `layouts`.

TanStack Query owns remote server state. React context owns the Supabase
session. Zustand is deliberately absent until a genuine cross-feature mutable
client-state use case appears.

## API

Each domain receives a NestJS module. Modules may add controllers, DTOs, and
services only when that product phase is implemented. Empty modules mark stable
boundaries without exposing fake endpoints.

The API secret client is available only to trusted backend services. Normal
user operations use a client carrying the caller's access token, allowing RLS
to evaluate `auth.uid()`.

## Database security

Top-level private resources carry an authenticated owner identifier. Child
records validate access through their parent. Whiteboard membership checks use
small `security definer` helper functions to avoid recursive RLS evaluation;
execute access is limited to authenticated users.

Storage buckets are private. Object names begin with the owner's UUID, and
policies require that first path segment to equal `auth.uid()`.

## Deferred decisions

The following choices should be made in their dedicated phases:

- tldraw snapshot granularity and realtime conflict strategy
- PDF text indexing and annotation geometry format
- recurring-calendar expansion strategy
- signed upload lifecycle and orphan cleanup
- notifications and background jobs
- deployment topology and observability
