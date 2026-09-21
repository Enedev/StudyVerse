insert into public.profiles (id, display_name)
select
  users.id,
  nullif(trim(users.raw_user_meta_data ->> 'display_name'), '')
from auth.users
as users
on conflict (id) do nothing;
