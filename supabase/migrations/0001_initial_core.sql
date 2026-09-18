-- Weatherpro core user/profile architecture
-- Does not create authentication users or store passwords.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'user');
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  first_name text not null default '',
  last_name text not null default '',
  display_name text not null default '',
  role public.app_role not null default 'user',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_is_active_idx on public.profiles (is_active);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_first text;
  meta_last text;
  meta_display text;
begin
  meta_first := coalesce(new.raw_user_meta_data->>'first_name', '');
  meta_last := coalesce(new.raw_user_meta_data->>'last_name', '');
  meta_display := coalesce(
    nullif(trim(both from new.raw_user_meta_data->>'display_name'), ''),
    nullif(trim(both from meta_first || ' ' || meta_last), ''),
    split_part(coalesce(new.email, ''), '@', 1)
  );

  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    display_name,
    role,
    is_active
  )
  values (
    new.id,
    lower(coalesce(new.email, '')),
    meta_first,
    meta_last,
    meta_display,
    'user',
    true
  )
  on conflict (id) do update
    set
      email = excluded.email,
      first_name = case when public.profiles.first_name = '' then excluded.first_name else public.profiles.first_name end,
      last_name = case when public.profiles.last_name = '' then excluded.last_name else public.profiles.last_name end,
      display_name = case when public.profiles.display_name = '' then excluded.display_name else public.profiles.display_name end,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

create or replace function public.protect_last_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining integer;
begin
  if old.role = 'admin' and old.is_active = true
     and (new.role is distinct from 'admin' or new.is_active is distinct from true) then
    select count(*)
    into remaining
    from public.profiles
    where role = 'admin'
      and is_active = true
      and id <> old.id;

    if remaining = 0 then
      raise exception 'Cannot remove or deactivate the last active administrator';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_last_admin on public.profiles;
create trigger profiles_protect_last_admin
before update on public.profiles
for each row
execute procedure public.protect_last_admin();

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin
  on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant usage on schema public to authenticated;
grant select, update on table public.profiles to authenticated;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
