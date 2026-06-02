-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  default_currency text not null default 'toman',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Payment methods
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('bank', 'crypto')),
  label text not null,
  details jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payment_methods enable row level security;

drop policy if exists "payment_methods_all_own" on public.payment_methods;
create policy "payment_methods_all_own" on public.payment_methods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  client_name text not null,
  client_contact text,
  type text not null check (type in ('hourly', 'total')),
  currency text not null default 'toman',
  hourly_rate bigint,
  total_amount bigint,
  status text not null default 'active' check (status in ('active', 'archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_hourly_rate_check check (
    (type = 'hourly' and hourly_rate is not null) or type = 'total'
  ),
  constraint projects_total_amount_check check (
    (type = 'total' and total_amount is not null) or type = 'hourly'
  )
);

alter table public.projects enable row level security;

drop policy if exists "projects_all_own" on public.projects;
create policy "projects_all_own" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Time entries
create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  work_date date not null,
  hours numeric(8, 2) not null check (hours > 0),
  rate_at_entry bigint not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists time_entries_project_date_idx
  on public.time_entries (project_id, work_date);

alter table public.time_entries enable row level security;

drop policy if exists "time_entries_all_own" on public.time_entries;
create policy "time_entries_all_own" on public.time_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Invoices
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  payment_method_id uuid references public.payment_methods (id) on delete set null,
  invoice_no text not null,
  issue_date date not null default current_date,
  period_start date,
  period_end date,
  percentage numeric(5, 2),
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'canceled', 'overdue')),
  subtotal bigint not null default 0,
  tax_rate numeric(5, 2) not null default 0,
  tax_amount bigint not null default 0,
  total bigint not null default 0,
  alt_currency text,
  exchange_rate bigint,
  exchange_method text check (exchange_method in ('divide', 'multiply')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, invoice_no)
);

create index if not exists invoices_project_status_idx
  on public.invoices (project_id, status);

alter table public.invoices enable row level security;

drop policy if exists "invoices_all_own" on public.invoices;
create policy "invoices_all_own" on public.invoices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Invoice line items
create table if not exists public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  title text not null,
  type text not null check (type in ('hourly', 'fixed')),
  hours numeric(8, 2),
  rate bigint,
  total bigint not null,
  created_at timestamptz not null default now()
);

alter table public.invoice_line_items enable row level security;

drop policy if exists "invoice_line_items_all_own" on public.invoice_line_items;
create policy "invoice_line_items_all_own" on public.invoice_line_items
  for all using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and i.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and i.user_id = auth.uid()
    )
  );

-- Updated_at triggers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists payment_methods_updated_at on public.payment_methods;
create trigger payment_methods_updated_at before update on public.payment_methods
  for each row execute function public.set_updated_at();

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists time_entries_updated_at on public.time_entries;
create trigger time_entries_updated_at before update on public.time_entries
  for each row execute function public.set_updated_at();

drop trigger if exists invoices_updated_at on public.invoices;
create trigger invoices_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();
