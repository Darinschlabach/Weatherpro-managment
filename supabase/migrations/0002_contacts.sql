-- Weatherpro contacts directory
-- Authenticated company users can manage contacts.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'contact_type') then
    create type public.contact_type as enum ('Contractors', 'Customers', 'Employees', 'Vendors');
  end if;
end
$$;

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  fax text,
  address text,
  contact_type public.contact_type not null default 'Customers',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contacts_name_idx on public.contacts (lower(name));
create index if not exists contacts_type_idx on public.contacts (contact_type);

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
before update on public.contacts
for each row
execute procedure public.set_updated_at();

alter table public.contacts enable row level security;

drop policy if exists contacts_select_authenticated on public.contacts;
create policy contacts_select_authenticated
  on public.contacts
  for select
  to authenticated
  using (true);

drop policy if exists contacts_insert_authenticated on public.contacts;
create policy contacts_insert_authenticated
  on public.contacts
  for insert
  to authenticated
  with check (true);

drop policy if exists contacts_update_authenticated on public.contacts;
create policy contacts_update_authenticated
  on public.contacts
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists contacts_delete_authenticated on public.contacts;
create policy contacts_delete_authenticated
  on public.contacts
  for delete
  to authenticated
  using (true);

grant select, insert, update, delete on table public.contacts to authenticated;
