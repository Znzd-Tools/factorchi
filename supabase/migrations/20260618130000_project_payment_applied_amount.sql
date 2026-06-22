alter table public.project_payments
  add column if not exists applied_amount bigint not null default 0;

alter table public.project_payments
  drop constraint if exists project_payments_applied_amount_check;

alter table public.project_payments
  add constraint project_payments_applied_amount_check
  check (applied_amount >= 0 and applied_amount <= amount);

-- Backfill: apply existing advances against already-paid invoices (oldest first).
do $$
declare
  inv record;
  pay record;
  remaining bigint;
  available bigint;
  to_apply bigint;
begin
  for inv in
    select project_id, total
    from public.invoices
    where status = 'paid'
    order by issue_date asc, created_at asc
  loop
    remaining := inv.total;

    for pay in
      select id, amount, applied_amount
      from public.project_payments
      where project_id = inv.project_id
        and applied_amount < amount
      order by paid_at asc, created_at asc
    loop
      exit when remaining <= 0;

      available := pay.amount - pay.applied_amount;
      to_apply := least(available, remaining);

      update public.project_payments
      set applied_amount = applied_amount + to_apply
      where id = pay.id;

      remaining := remaining - to_apply;
    end loop;
  end loop;
end $$;
