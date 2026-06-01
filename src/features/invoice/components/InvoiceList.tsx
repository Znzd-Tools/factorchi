'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { Select } from '@/components/atoms/Select';
import { ROUTES } from '@/config/routes';
import { updateInvoiceStatus } from '@/features/invoice/actions/invoice.actions';
import {
	INVOICE_STATUS_LABELS,
	INVOICE_STATUS_TRANSITIONS,
} from '@/features/invoice/constants/invoice-status';
import { getCurrencySymbol } from '@/features/invoice/constants/currencies';
import type { InvoiceWithLineItems } from '@/features/invoice/interface/invoice-db.types';
import { formatJalaliDate } from '@/lib/jalali';
import type { InvoiceStatus } from '@/lib/supabase/database.types';
import { formatMoney } from '@/lib/money';

interface IInvoiceListProps {
	projectId: string;
	invoices: InvoiceWithLineItems[];
	currency: string;
}

const ALL_STATUS_FILTER = 'all' as const;

export function InvoiceList({ projectId, invoices, currency }: IInvoiceListProps) {
	const [statusFilter, setStatusFilter] = useState<InvoiceStatus | typeof ALL_STATUS_FILTER>(
		ALL_STATUS_FILTER,
	);
	const [isPending, startTransition] = useTransition();

	const currencySymbol = getCurrencySymbol(currency);

	const filteredInvoices = useMemo(() => {
		if (statusFilter === ALL_STATUS_FILTER) {
			return invoices;
		}

		return invoices.filter((invoice) => invoice.status === statusFilter);
	}, [invoices, statusFilter]);

	const handleStatusChange = (invoiceId: string, currentStatus: InvoiceStatus, nextStatus: string) => {
		if (!nextStatus || nextStatus === currentStatus) {
			return;
		}

		startTransition(async () => {
			const result = await updateInvoiceStatus(
				projectId,
				invoiceId,
				nextStatus as InvoiceStatus,
			);

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success(result.success ?? 'وضعیت به‌روزرسانی شد.');
		});
	};

	return (
		<div className='space-y-4'>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<Select
					label='فیلتر وضعیت'
					value={statusFilter}
					onChange={(event) =>
						setStatusFilter(event.target.value as InvoiceStatus | typeof ALL_STATUS_FILTER)
					}
					className='max-w-xs'
				>
					<option value={ALL_STATUS_FILTER}>همه</option>
					{Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</Select>

				<Link href={ROUTES.projectInvoiceNew(projectId)}>
					<Button>فاکتور جدید</Button>
				</Link>
			</div>

			{filteredInvoices.length === 0 ? (
				<div className='rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground'>
					فاکتوری یافت نشد.
				</div>
			) : (
				<div className='overflow-x-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]'>
					<table className='w-full min-w-[720px] text-right text-sm'>
						<thead className='bg-muted text-muted-foreground'>
							<tr>
								<th className='px-4 py-3 font-bold'>شماره</th>
								<th className='px-4 py-3 font-bold'>تاریخ</th>
								<th className='px-4 py-3 font-bold'>بازه / درصد</th>
								<th className='px-4 py-3 font-bold'>مبلغ</th>
								<th className='px-4 py-3 font-bold'>وضعیت</th>
								<th className='px-4 py-3 font-bold'>عملیات</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-border'>
							{filteredInvoices.map((invoice) => {
								const transitions = INVOICE_STATUS_TRANSITIONS[invoice.status];

								return (
									<tr key={invoice.id} className='transition-colors hover:bg-muted/50'>
										<td className='px-4 py-3 font-bold tabular-nums' dir='ltr'>
											{invoice.invoice_no}
										</td>
										<td className='px-4 py-3 tabular-nums'>
											{formatJalaliDate(invoice.issue_date)}
										</td>
										<td className='px-4 py-3 text-muted-foreground'>
											{invoice.period_start && invoice.period_end
												? `${formatJalaliDate(invoice.period_start)} — ${formatJalaliDate(invoice.period_end)}`
												: invoice.percentage
													? `${invoice.percentage}٪`
													: '—'}
										</td>
										<td className='px-4 py-3 font-bold tabular-nums'>
											{formatMoney(invoice.total)} {currencySymbol}
										</td>
										<td className='px-4 py-3'>
											<span className='rounded-lg bg-muted px-2 py-1 text-xs font-bold text-foreground'>
												{INVOICE_STATUS_LABELS[invoice.status]}
											</span>
										</td>
										<td className='px-4 py-3'>
											<div className='flex flex-wrap items-center gap-2'>
												<Link href={ROUTES.projectInvoice(projectId, invoice.id)}>
													<Button size='sm' variant='secondary'>
														مشاهده
													</Button>
												</Link>
												{transitions.length > 0 && (
													<Select
														defaultValue=''
														disabled={isPending}
														onChange={(event) =>
															handleStatusChange(
																invoice.id,
																invoice.status,
																event.target.value,
															)
														}
														className='min-w-[140px]'
													>
														<option value='' disabled>
															تغییر وضعیت
														</option>
														{transitions.map((status) => (
															<option key={status} value={status}>
																{INVOICE_STATUS_LABELS[status]}
															</option>
														))}
													</Select>
												)}
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
