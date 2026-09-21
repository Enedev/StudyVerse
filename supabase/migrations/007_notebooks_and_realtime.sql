create table public.notebooks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 240),
  paper_type text not null default 'lined'
    check (paper_type in ('blank', 'lined', 'grid', 'dotted')),
  pages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notebooks_user_updated_at_idx
  on public.notebooks(user_id, updated_at desc);

create trigger notebooks_set_updated_at
before update on public.notebooks
for each row execute function public.set_updated_at();

alter table public.notebooks enable row level security;

create policy "notebooks_manage_own"
on public.notebooks
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, insert, update, delete on public.notebooks to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.whiteboards;
exception
  when duplicate_object then null;
end $$;
