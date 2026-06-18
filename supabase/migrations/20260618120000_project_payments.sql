create table if not exists public.project_payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  payment_method_id uuid references public.payment_methods (id) on delete set null,
  amount bigint not null check (amount > 0),
  paid_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_payments_project_id_idx
  on public.project_payments (project_id, paid_at desc);

alter table public.project_payments enable row level security;

drop policy if exists "project_payments_all_own" on public.project_payments;
create policy "project_payments_all_own" on public.project_payments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists project_payments_updated_at on public.project_payments;
create trigger project_payments_updated_at before update on public.project_payments
  for each row execute function public.set_updated_at();
