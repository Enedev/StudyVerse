drop policy if exists "whiteboards_select_accessible" on public.whiteboards;

create policy "whiteboards_select_accessible"
on public.whiteboards for select
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.whiteboard_members
    where whiteboard_id = whiteboards.id
      and user_id = auth.uid()
  )
);
