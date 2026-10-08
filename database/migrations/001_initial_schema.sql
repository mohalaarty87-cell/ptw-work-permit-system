-- Initial shared-storage schema for the PTW system.
-- Target: PostgreSQL (e.g. a Vercel Marketplace Neon or Supabase project).
-- Apply only after a managed database is provisioned and reviewed for the site's policies.

create extension if not exists pgcrypto;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_no text,
  contact jsonb not null default '{}'::jsonb,
  approval_status text not null default 'Pending',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_no)
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete restrict,
  name text not null,
  timezone text not null default 'Asia/Baghdad',
  active boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (company_id, name)
);

-- Profiles are provisioned by a trusted administrator; users cannot select their own role.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in (
    'Administrator', 'HSE / Safety Officer', 'Permit Controller',
    'Certificate Officer', 'Auditor', 'Personnel Officer', 'Viewer / Read Only'
  )),
  company_id uuid references public.companies(id) on delete restrict,
  site_id uuid references public.sites(id) on delete restrict,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keeps the existing IndexedDB store names and record IDs during migration.
create table if not exists public.system_records (
  store_name text not null check (store_name in (
    'ptw', 'audits', 'certificates', 'personnel', 'companies',
    'findings', 'attachments', 'trail', 'users', 'formRecords'
  )),
  record_id text not null,
  company_id uuid references public.companies(id) on delete restrict,
  site_id uuid references public.sites(id) on delete restrict,
  data jsonb not null,
  version integer not null default 1 check (version > 0),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (store_name, record_id)
);

create index if not exists system_records_scope_idx
  on public.system_records (company_id, site_id, store_name, updated_at desc);
create index if not exists system_records_data_gin_idx
  on public.system_records using gin (data);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  company_id uuid references public.companies(id) on delete restrict,
  site_id uuid references public.sites(id) on delete restrict,
  action text not null,
  store_name text not null,
  record_id text,
  reason text,
  before_data jsonb,
  after_data jsonb,
  request_id text,
  occurred_at timestamptz not null default now()
);
create index if not exists audit_events_scope_time_idx
  on public.audit_events (company_id, site_id, occurred_at desc);
create index if not exists audit_events_record_idx
  on public.audit_events (store_name, record_id, occurred_at desc);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  store_name text not null,
  record_id text not null,
  company_id uuid references public.companies(id) on delete restrict,
  site_id uuid references public.sites(id) on delete restrict,
  storage_path text not null unique,
  original_name text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  sha256 text,
  uploaded_by uuid references auth.users(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  version integer not null default 1 check (version > 0)
);

-- Server-side identity and scope helpers. The browser cannot choose a role.
create or replace function public.current_profile()
returns public.profiles
language sql stable security definer
set search_path = ''
as $$
  select p from public.profiles p
  where p.user_id = (select auth.uid()) and p.active = true
$$;

create or replace function public.current_role()
returns text
language sql stable security definer
set search_path = ''
as $$
  select p.role from public.profiles p
  where p.user_id = (select auth.uid()) and p.active = true
$$;

create or replace function public.can_read_store(p_store text)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select case public.current_role()
    when 'Administrator' then true
    when 'Viewer / Read Only' then true
    when 'HSE / Safety Officer' then p_store in ('ptw','audits','certificates','personnel','companies','findings','attachments','formRecords')
    when 'Permit Controller' then p_store in ('ptw','certificates','personnel','companies','attachments','formRecords')
    when 'Certificate Officer' then p_store in ('certificates','personnel','companies','attachments')
    when 'Auditor' then p_store in ('ptw','audits','certificates','personnel','companies','findings','attachments','formRecords','trail')
    when 'Personnel Officer' then p_store in ('personnel','companies','certificates','attachments')
    else false
  end
$$;

create or replace function public.can_write_store(p_store text)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select case public.current_role()
    when 'Administrator' then true
    when 'HSE / Safety Officer' then p_store in ('ptw','audits','findings','attachments','formRecords')
    when 'Permit Controller' then p_store in ('ptw','attachments','formRecords')
    when 'Certificate Officer' then p_store in ('certificates','attachments')
    when 'Auditor' then p_store in ('audits','findings','attachments')
    when 'Personnel Officer' then p_store in ('personnel','attachments')
    else false
  end
$$;

alter table public.companies enable row level security;
alter table public.sites enable row level security;
alter table public.profiles enable row level security;
alter table public.system_records enable row level security;
alter table public.audit_events enable row level security;
alter table public.attachments enable row level security;

create policy profiles_self_read on public.profiles for select to authenticated
  using (user_id = (select auth.uid()) or public.current_role() = 'Administrator');
create policy companies_scoped_read on public.companies for select to authenticated
  using (public.current_role() in ('Administrator','HSE / Safety Officer','Permit Controller','Auditor','Viewer / Read Only')
    and exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.active
      and (p.role = 'Administrator' or p.company_id = companies.id)));
create policy sites_scoped_read on public.sites for select to authenticated
  using (exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.active
      and (p.role = 'Administrator' or p.site_id = sites.id)));
create policy records_scoped_read on public.system_records for select to authenticated
  using (public.can_read_store(store_name) and exists (
    select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.active
      and (p.role = 'Administrator'
        or (p.company_id is not distinct from system_records.company_id
          and (p.site_id is null or p.site_id is not distinct from system_records.site_id)))
  ));
create policy records_scoped_insert on public.system_records for insert to authenticated
  with check (public.can_write_store(store_name) and exists (
    select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.active
      and (p.role = 'Administrator'
        or (p.company_id is not distinct from system_records.company_id
          and (p.site_id is null or p.site_id is not distinct from system_records.site_id)))
  ));
create policy records_scoped_update on public.system_records for update to authenticated
  using (public.can_write_store(store_name) and exists (
    select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.active
      and (p.role = 'Administrator'
        or (p.company_id is not distinct from system_records.company_id
          and (p.site_id is null or p.site_id is not distinct from system_records.site_id)))
  ))
  with check (public.can_write_store(store_name) and exists (
    select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.active
      and (p.role = 'Administrator'
        or (p.company_id is not distinct from system_records.company_id
          and (p.site_id is null or p.site_id is not distinct from system_records.site_id)))
  ));
create policy audit_events_scoped_read on public.audit_events for select to authenticated
  using (public.current_role() in ('Administrator','Auditor') and exists (
    select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.active
      and (p.role = 'Administrator' or
        (p.company_id is not distinct from audit_events.company_id
          and (p.site_id is null or p.site_id is not distinct from audit_events.site_id)))
  ));
create policy attachments_scoped_read on public.attachments for select to authenticated
  using (exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.active
    and public.can_read_store(attachments.store_name)
    and (p.role = 'Administrator' or
      (p.company_id is not distinct from attachments.company_id
        and (p.site_id is null or p.site_id is not distinct from attachments.site_id)))));
create policy attachments_scoped_insert on public.attachments for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.user_id = (select auth.uid()) and p.active
    and public.can_write_store(attachments.store_name)
    and (p.role = 'Administrator' or
      (p.company_id is not distinct from attachments.company_id
        and (p.site_id is null or p.site_id is not distinct from attachments.site_id)))));

-- Audit history is intentionally read-only to clients. A trusted server function
-- will append events after its transaction is accepted.
revoke insert, update, delete, truncate on public.audit_events from anon, authenticated;
grant select on public.audit_events to authenticated;
grant select, insert, update on public.system_records to authenticated;
grant select on public.profiles, public.companies, public.sites to authenticated;
grant select, insert on public.attachments to authenticated;

comment on table public.system_records is 'Data migrated from existing IndexedDB stores; clients retain their record IDs.';
comment on table public.audit_events is 'Append-only audit events written by trusted server-side operations.';

