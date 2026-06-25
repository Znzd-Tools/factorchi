'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { Select } from '@/components/atoms/Select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Surface } from '@/components/ui/Surface';
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

const STATUS_ORDER: InvoiceStatus[] = ['overdue', 'sent', 'draft', 'paid', 'canceled'];

export function InvoiceList({ projectId, invoices, currency }: IInvoiceListProps) {
	const [statusFilter, setStatusFilter] = useState<InvoiceStatus | typeof ALL_STATUS_FILTER>(
		ALL_STATUS_FILTER,
	);
	const [selectedId, setSelectedId] = useState<string | null>(invoices[0]?.id ?? null);
	const [isPending, startTransition] = useTransition();
	const { trigger: triggerCelebration } = useCelebration();

	const currencySymbol = getCurrencySymbol(currency);

	const filteredInvoices = useMemo(() => {
		if (statusFilter === ALL_STATUS_FILTER) {
			return invoices;
		}

		return invoices.filter((invoice) => invoice.status === statusFilter);
	}, [invoices, statusFilter]);

	const groupedInvoices = useMemo(() => {
		const groups = new Map<InvoiceStatus, InvoiceWithLineItems[]>();

		for (const status of STATUS_ORDER) {
			const items = filteredInvoices.filter((invoice) => invoice.status === status);
			if (items.length > 0) {
				groups.set(status, items);
			}
		}

		return groups;
	}, [filteredInvoices]);

	const selectedInvoice = filteredInvoices.find((invoice) => invoice.id === selectedId) ?? null;

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
				<div className='rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground'>
					فاکتوری یافت نشد.
				</div>
			) : (
				<div className='grid gap-4 lg:grid-cols-[1fr_20rem] lg:items-start'>
					<div className='space-y-4 md:hidden'>
						{filteredInvoices.map((invoice) => (
							<InvoiceCard
								key={invoice.id}
								projectId={projectId}
								invoice={invoice}
								currency={currency}
							/>
						))}
					</div>

					<div className='hidden space-y-4 md:block'>
						{[...groupedInvoices.entries()].map(([status, items]) => (
							<div key={status} className='space-y-2'>
								<div className='flex items-center gap-2'>
									<StatusBadge label={INVOICE_STATUS_LABELS[status]} tone='neutral' />
									<span className='text-xs text-muted-foreground'>{items.length} مورد</span>
								</div>
								<ul className='space-y-1'>
									{items.map((invoice) => (
										<li key={invoice.id}>
											<button
												type='button'
												onClick={() => setSelectedId(invoice.id)}
												className={`w-full rounded-lg border px-3 py-3 text-start transition-colors ${
													selectedId === invoice.id
														? 'border-primary bg-primary/5'
														: 'border-border bg-card hover:bg-muted/50'
												}`}
											>
												<div className='flex items-center justify-between gap-2'>
													<span className='font-bold tabular-nums text-primary' dir='ltr'>
														{invoice.invoice_no}
													</span>
													<span className='font-black tabular-nums'>
														{formatMoney(invoice.total)} {currencySymbol}
													</span>
												</div>
												<p className='mt-1 text-xs text-muted-foreground'>
													{formatJalaliDate(invoice.issue_date)}
												</p>
											</button>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>

					{selectedInvoice && (
						<Surface title='جزئیات فاکتور' className='hidden md:block'>
							<div className='space-y-3 text-sm'>
								<div className='flex flex-wrap items-center justify-between gap-2'>
									<Link
										href={ROUTES.projectInvoice(projectId, selectedInvoice.id)}
										className='font-bold tabular-nums text-primary hover:underline'
										dir='ltr'
									>
										{selectedInvoice.invoice_no}
									</Link>
									<StatusBadge
										label={INVOICE_STATUS_LABELS[selectedInvoice.status]}
										tone='info'
									/>
								</div>
								<p className='text-muted-foreground'>
									{formatJalaliDate(selectedInvoice.issue_date)}
								</p>
								<p className='text-lg font-black tabular-nums'>
									{formatMoney(selectedInvoice.total)} {currencySymbol}
								</p>
								<InvoiceStatusTimeline
									status={selectedInvoice.status}
									onAdvance={(next) => handleAdvance(selectedInvoice.id, next)}
									pending={isPending}
								/>
								<Link href={ROUTES.projectInvoice(projectId, selectedInvoice.id)}>
									<Button variant='secondary' fullWidth>
										مشاهده و چاپ
									</Button>
								</Link>
							</div>
						</Surface>
					)}
				</div>
			)}
		</div>
	);
}
