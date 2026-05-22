alter table public.invoices
  add column if not exists show_project_name boolean not null default true,
  add column if not exists show_owner_name boolean not null default true;
