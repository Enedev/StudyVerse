create schema if not exists private;

create or replace function private.owns_whiteboard(target_board_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.whiteboards
    where id = target_board_id and owner_id = auth.uid()
  );
$$;

create or replace function private.can_access_whiteboard(target_board_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.owns_whiteboard(target_board_id)
    or exists (
      select 1
      from public.whiteboard_members
      where whiteboard_id = target_board_id and user_id = auth.uid()
    );
$$;

revoke all on function private.owns_whiteboard(uuid) from public;
revoke all on function private.can_access_whiteboard(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.owns_whiteboard(uuid) to authenticated;
grant execute on function private.can_access_whiteboard(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.task_subtasks enable row level security;
alter table public.calendar_events enable row level security;
alter table public.whiteboards enable row level security;
alter table public.whiteboard_members enable row level security;
alter table public.documents enable row level security;
alter table public.document_annotations enable row level security;
alter table public.books enable row level security;
alter table public.favorites enable row level security;

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "tasks_select_own"
on public.tasks for select
to authenticated
using (user_id = auth.uid());

create policy "tasks_insert_own"
on public.tasks for insert
to authenticated
with check (user_id = auth.uid());

create policy "tasks_update_own"
on public.tasks for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "tasks_delete_own"
on public.tasks for delete
to authenticated
using (user_id = auth.uid());

create policy "task_subtasks_select_through_task"
on public.task_subtasks for select
to authenticated
using (
  exists (
    select 1 from public.tasks
    where tasks.id = task_subtasks.task_id
      and tasks.user_id = auth.uid()
  )
);

create policy "task_subtasks_insert_through_task"
on public.task_subtasks for insert
to authenticated
with check (
  exists (
    select 1 from public.tasks
    where tasks.id = task_subtasks.task_id
      and tasks.user_id = auth.uid()
  )
);

create policy "task_subtasks_update_through_task"
on public.task_subtasks for update
to authenticated
using (
  exists (
    select 1 from public.tasks
    where tasks.id = task_subtasks.task_id
      and tasks.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.tasks
    where tasks.id = task_subtasks.task_id
      and tasks.user_id = auth.uid()
  )
);

create policy "task_subtasks_delete_through_task"
on public.task_subtasks for delete
to authenticated
using (
  exists (
    select 1 from public.tasks
    where tasks.id = task_subtasks.task_id
      and tasks.user_id = auth.uid()
  )
);

create policy "calendar_events_select_own"
on public.calendar_events for select
to authenticated
using (user_id = auth.uid());

create policy "calendar_events_insert_own"
on public.calendar_events for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    source_task_id is null
    or exists (
      select 1 from public.tasks
      where tasks.id = calendar_events.source_task_id
        and tasks.user_id = auth.uid()
    )
  )
);

create policy "calendar_events_update_own"
on public.calendar_events for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and (
    source_task_id is null
    or exists (
      select 1 from public.tasks
      where tasks.id = calendar_events.source_task_id
        and tasks.user_id = auth.uid()
    )
  )
);

create policy "calendar_events_delete_own"
on public.calendar_events for delete
to authenticated
using (user_id = auth.uid());

create policy "whiteboards_select_accessible"
on public.whiteboards for select
to authenticated
using (private.can_access_whiteboard(id));

create policy "whiteboards_insert_owned"
on public.whiteboards for insert
to authenticated
with check (owner_id = auth.uid());

create policy "whiteboards_update_owned"
on public.whiteboards for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "whiteboards_delete_owned"
on public.whiteboards for delete
to authenticated
using (owner_id = auth.uid());

create policy "whiteboard_members_select_accessible"
on public.whiteboard_members for select
to authenticated
using (private.can_access_whiteboard(whiteboard_id));

create policy "whiteboard_members_insert_by_owner"
on public.whiteboard_members for insert
to authenticated
with check (
  private.owns_whiteboard(whiteboard_id)
  and user_id <> auth.uid()
);

create policy "whiteboard_members_update_by_owner"
on public.whiteboard_members for update
to authenticated
using (private.owns_whiteboard(whiteboard_id))
with check (
  private.owns_whiteboard(whiteboard_id)
  and user_id <> auth.uid()
);

create policy "whiteboard_members_delete_by_owner"
on public.whiteboard_members for delete
to authenticated
using (private.owns_whiteboard(whiteboard_id));

create policy "documents_select_own"
on public.documents for select
to authenticated
using (user_id = auth.uid());

create policy "documents_insert_own"
on public.documents for insert
to authenticated
with check (user_id = auth.uid());

create policy "documents_update_own"
on public.documents for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "documents_delete_own"
on public.documents for delete
to authenticated
using (user_id = auth.uid());

create policy "document_annotations_select_own_document"
on public.document_annotations for select
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.documents
    where documents.id = document_annotations.document_id
      and documents.user_id = auth.uid()
  )
);

create policy "document_annotations_insert_own_document"
on public.document_annotations for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.documents
    where documents.id = document_annotations.document_id
      and documents.user_id = auth.uid()
  )
);

create policy "document_annotations_update_own_document"
on public.document_annotations for update
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.documents
    where documents.id = document_annotations.document_id
      and documents.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.documents
    where documents.id = document_annotations.document_id
      and documents.user_id = auth.uid()
  )
);

create policy "document_annotations_delete_own_document"
on public.document_annotations for delete
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.documents
    where documents.id = document_annotations.document_id
      and documents.user_id = auth.uid()
  )
);

create policy "books_select_own"
on public.books for select
to authenticated
using (user_id = auth.uid());

create policy "books_insert_own"
on public.books for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    document_id is null
    or exists (
      select 1 from public.documents
      where documents.id = books.document_id
        and documents.user_id = auth.uid()
    )
  )
);

create policy "books_update_own"
on public.books for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and (
    document_id is null
    or exists (
      select 1 from public.documents
      where documents.id = books.document_id
        and documents.user_id = auth.uid()
    )
  )
);

create policy "books_delete_own"
on public.books for delete
to authenticated
using (user_id = auth.uid());

create policy "favorites_select_own"
on public.favorites for select
to authenticated
using (user_id = auth.uid());

create policy "favorites_insert_accessible"
on public.favorites for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    (
      book_id is not null
      and exists (
        select 1 from public.books
        where books.id = favorites.book_id
          and books.user_id = auth.uid()
      )
    )
    or (
      document_id is not null
      and exists (
        select 1 from public.documents
        where documents.id = favorites.document_id
          and documents.user_id = auth.uid()
      )
    )
    or (
      whiteboard_id is not null
      and private.can_access_whiteboard(whiteboard_id)
    )
  )
);

create policy "favorites_update_accessible"
on public.favorites for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and (
    (
      book_id is not null
      and exists (
        select 1 from public.books
        where books.id = favorites.book_id
          and books.user_id = auth.uid()
      )
    )
    or (
      document_id is not null
      and exists (
        select 1 from public.documents
        where documents.id = favorites.document_id
          and documents.user_id = auth.uid()
      )
    )
    or (
      whiteboard_id is not null
      and private.can_access_whiteboard(whiteboard_id)
    )
  )
);

create policy "favorites_delete_own"
on public.favorites for delete
to authenticated
using (user_id = auth.uid());

revoke all on all tables in schema public from anon;
grant select, insert, update, delete
on public.profiles,
   public.tasks,
   public.task_subtasks,
   public.calendar_events,
   public.whiteboards,
   public.whiteboard_members,
   public.documents,
   public.document_annotations,
   public.books,
   public.favorites
to authenticated;
