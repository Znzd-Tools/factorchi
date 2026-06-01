'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { Select } from '@/components/atoms/Select';
import { InvoiceCard } from '@/features/invoice/components/InvoiceCard';
import { InvoiceStatusTimeline } from '@/features/invoice/components/InvoiceStatusTimeline';
import { ROUTES } from '@/config/routes';
import { useCelebration } from '@/features/engagement/context/CelebrationContext';
import { updateInvoiceStatus } from '@/features/invoice/actions/invoice.actions';
import { INVOICE_STATUS_LABELS } from '@/features/invoice/constants/invoice-status';
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

function InvoiceTableRow({
	projectId,
	invoice,
	currencySymbol,
	isPending,
	onAdvance,
}: {
	projectId: string;
	invoice: InvoiceWithLineItems;
	currencySymbol: string;
	isPending: boolean;
	onAdvance: (invoiceId: string, nextStatus: InvoiceStatus) => void;
}) {
	return (
		<tr className='align-top'>
			<td className='px-4 py-4'>
				<Link
					href={ROUTES.projectInvoice(projectId, invoice.id)}
					className='font-bold tabular-nums text-primary hover:underline'
					dir='ltr'
				>
					{invoice.invoice_no}
				</Link>
				<p className='mt-1 text-xs text-muted-foreground'>{formatJalaliDate(invoice.issue_date)}</p>
			</td>
			<td className='px-4 py-4 text-muted-foreground'>
				{invoice.period_start && invoice.period_end
					? `${formatJalaliDate(invoice.period_start)} — ${formatJalaliDate(invoice.period_end)}`
					: invoice.percentage
						? `${invoice.percentage}٪`
						: '—'}
			</td>
			<td className='px-4 py-4 font-bold tabular-nums'>
				{formatMoney(invoice.total)} {currencySymbol}
			</td>
			<td className='min-w-[280px] px-4 py-4'>
				<InvoiceStatusTimeline
					status={invoice.status}
					onAdvance={(next) => onAdvance(invoice.id, next)}
					pending={isPending}
					compact
				/>
			</td>
		</tr>
	);
}

export function InvoiceList({ projectId, invoices, currency }: IInvoiceListProps) {
	const [statusFilter, setStatusFilter] = useState<InvoiceStatus | typeof ALL_STATUS_FILTER>(
		ALL_STATUS_FILTER,
	);
	const [isPending, startTransition] = useTransition();
	const { trigger: triggerCelebration } = useCelebration();

	const currencySymbol = getCurrencySymbol(currency);

	const filteredInvoices = useMemo(() => {
		if (statusFilter === ALL_STATUS_FILTER) {
			return invoices;
		}

		return invoices.filter((invoice) => invoice.status === statusFilter);
	}, [invoices, statusFilter]);

	const handleAdvance = (invoiceId: string, nextStatus: InvoiceStatus) => {
		startTransition(async () => {
			const result = await updateInvoiceStatus(projectId, invoiceId, nextStatus);

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success(result.success ?? 'وضعیت به‌روزرسانی شد.');

			if (result.celebration) {
				triggerCelebration(result.celebration);
			}
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
					<Button haptic='medium'>فاکتور جدید</Button>
				</Link>
			</div>

			{filteredInvoices.length === 0 ? (
				<div className='rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground'>
					فاکتوری یافت نشد.
				</div>
			) : (
				<>
					<div className='space-y-3 md:hidden'>
						{filteredInvoices.map((invoice) => (
							<InvoiceCard
								key={invoice.id}
								projectId={projectId}
								invoice={invoice}
								currency={currency}
							/>
						))}
					</div>

					<div className='hidden overflow-x-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] md:block'>
						<table className='w-full min-w-[720px] text-right text-sm'>
							<thead className='bg-muted text-muted-foreground'>
								<tr>
									<th className='px-4 py-3 font-bold'>شماره</th>
									<th className='px-4 py-3 font-bold'>بازه / درصد</th>
									<th className='px-4 py-3 font-bold'>مبلغ</th>
									<th className='px-4 py-3 font-bold'>مسیر وضعیت</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-border'>
								{filteredInvoices.map((invoice) => (
									<InvoiceTableRow
										key={invoice.id}
										projectId={projectId}
										invoice={invoice}
										currencySymbol={currencySymbol}
										isPending={isPending}
										onAdvance={handleAdvance}
									/>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}
		</div>
	);
}
