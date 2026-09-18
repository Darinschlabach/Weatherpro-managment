-- Contact people and date of birth for the contact detail page.

alter table public.contacts
add column if not exists date_of_birth date;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'contact_person_position') then
    create type public.contact_person_position as enum (
      'owner',
      'designer',
      'receptionist',
      'accounting',
      'installation'
    );
  end if;
end
$$;

create table if not exists public.contact_people (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts (id) on delete cascade,
  name text not null,
  phone text,
  email text,
  positions public.contact_person_position[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_people_contact_id_idx on public.contact_people (contact_id);

drop trigger if exists contact_people_set_updated_at on public.contact_people;
create trigger contact_people_set_updated_at
before update on public.contact_people
for each row
execute procedure public.set_updated_at();

alter table public.contact_people enable row level security;

drop policy if exists contact_people_select_authenticated on public.contact_people;
create policy contact_people_select_authenticated
  on public.contact_people
  for select
  to authenticated
  using (true);

drop policy if exists contact_people_insert_authenticated on public.contact_people;
create policy contact_people_insert_authenticated
  on public.contact_people
  for insert
  to authenticated
  with check (true);

drop policy if exists contact_people_update_authenticated on public.contact_people;
create policy contact_people_update_authenticated
  on public.contact_people
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists contact_people_delete_authenticated on public.contact_people;
create policy contact_people_delete_authenticated
  on public.contact_people
  for delete
  to authenticated
  using (true);

grant select, insert, update, delete on table public.contact_people to authenticated;
