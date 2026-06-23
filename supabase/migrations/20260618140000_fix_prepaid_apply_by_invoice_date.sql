-- Reset prepaid allocation and re-apply only to invoices issued on/after prepaid date.
update public.project_payments set applied_amount = 0;

do $$
declare
  inv record;
  pay record;
  remaining bigint;
  available bigint;
  to_apply bigint;
begin
  for inv in
    select project_id, total, issue_date
    from public.invoices
    where status = 'paid'
    order by issue_date asc, created_at asc
  loop
    remaining := inv.total;

    for pay in
      select id, amount, applied_amount, paid_at
      from public.project_payments
      where project_id = inv.project_id
        and applied_amount < amount
        and paid_at <= inv.issue_date
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
