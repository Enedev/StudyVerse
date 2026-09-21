create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 80),
  avatar_url text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 240),
  description text,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'completed', 'archived')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'urgent')),
  due_at timestamptz,
  subject text check (subject is null or char_length(subject) <= 100),
  tags text[] not null default '{}',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 240),
  is_completed boolean not null default false,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 240),
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_all_day boolean not null default false,
  timezone text not null default 'UTC',
  recurrence_rule text,
  subject text check (subject is null or char_length(subject) <= 100),
  color text check (color is null or color ~ '^#[0-9A-Fa-f]{6}$'),
  source_task_id uuid references public.tasks(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint calendar_events_valid_range check (ends_at > starts_at)
);

create table public.whiteboards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 240),
  snapshot jsonb not null default '{}'::jsonb,
  thumbnail_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.whiteboard_members (
  whiteboard_id uuid not null references public.whiteboards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('viewer', 'editor')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (whiteboard_id, user_id)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 240),
  original_filename text not null,
  storage_path text not null unique,
  mime_type text not null default 'application/pdf',
  size_bytes bigint not null check (size_bytes >= 0),
  page_count integer check (page_count is null or page_count > 0),
  last_opened_page integer not null default 1 check (last_opened_page > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_annotations (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  annotation_type text not null
    check (annotation_type in (
      'highlight',
      'underline',
      'text',
      'drawing',
      'note',
      'bookmark'
    )),
  page_number integer not null check (page_number > 0),
  geometry jsonb,
  content text,
  color text check (color is null or color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid unique references public.documents(id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 240),
  author text check (author is null or char_length(author) <= 180),
  cover_path text,
  categories text[] not null default '{}',
  reading_progress numeric(5, 2) not null default 0
    check (reading_progress between 0 and 100),
  last_opened_page integer not null default 1 check (last_opened_page > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid references public.books(id) on delete cascade,
  document_id uuid references public.documents(id) on delete cascade,
  whiteboard_id uuid references public.whiteboards(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint favorites_exactly_one_resource check (
    num_nonnulls(book_id, document_id, whiteboard_id) = 1
  )
);

create index tasks_user_status_idx on public.tasks(user_id, status);
create index tasks_user_due_at_idx on public.tasks(user_id, due_at);
create index task_subtasks_task_position_idx
  on public.task_subtasks(task_id, position);
create index calendar_events_user_starts_at_idx
  on public.calendar_events(user_id, starts_at);
create index whiteboards_owner_updated_at_idx
  on public.whiteboards(owner_id, updated_at desc);
create index whiteboard_members_user_idx
  on public.whiteboard_members(user_id);
create index documents_user_updated_at_idx
  on public.documents(user_id, updated_at desc);
create index document_annotations_document_page_idx
  on public.document_annotations(document_id, page_number);
create index books_user_updated_at_idx
  on public.books(user_id, updated_at desc);
create unique index favorites_user_book_unique
  on public.favorites(user_id, book_id) where book_id is not null;
create unique index favorites_user_document_unique
  on public.favorites(user_id, document_id) where document_id is not null;
create unique index favorites_user_whiteboard_unique
  on public.favorites(user_id, whiteboard_id) where whiteboard_id is not null;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger task_subtasks_set_updated_at
before update on public.task_subtasks
for each row execute function public.set_updated_at();

create trigger calendar_events_set_updated_at
before update on public.calendar_events
for each row execute function public.set_updated_at();

create trigger whiteboards_set_updated_at
before update on public.whiteboards
for each row execute function public.set_updated_at();

create trigger whiteboard_members_set_updated_at
before update on public.whiteboard_members
for each row execute function public.set_updated_at();

create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

create trigger document_annotations_set_updated_at
before update on public.document_annotations
for each row execute function public.set_updated_at();

create trigger books_set_updated_at
before update on public.books
for each row execute function public.set_updated_at();

create trigger favorites_set_updated_at
before update on public.favorites
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
