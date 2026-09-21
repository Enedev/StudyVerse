create or replace function public.find_user_id_by_email(target_email text)
returns uuid
language sql
security definer
set search_path = ''
as $$
  select users.id
  from auth.users as users
  where lower(users.email) = lower(trim(target_email))
  limit 1;
$$;

revoke all on function public.find_user_id_by_email(text)
from public, anon, authenticated;
grant execute on function public.find_user_id_by_email(text) to service_role;

create or replace function private.whiteboard_owner_id(target_board_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select owner_id
  from public.whiteboards
  where id = target_board_id;
$$;

revoke all on function private.whiteboard_owner_id(uuid) from public;
grant execute on function private.whiteboard_owner_id(uuid) to authenticated;

drop policy if exists "whiteboards_update_owned" on public.whiteboards;

create policy "whiteboards_update_editors"
on public.whiteboards for update
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.whiteboard_members
    where whiteboard_id = whiteboards.id
      and user_id = auth.uid()
      and role = 'editor'
  )
)
with check (
  owner_id = private.whiteboard_owner_id(id)
);
