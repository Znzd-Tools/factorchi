'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { InvoiceStatusTimeline } from '@/features/invoice/components/InvoiceStatusTimeline';
import { useCelebration } from '@/features/engagement/context/CelebrationContext';
import { updateInvoiceStatus } from '@/features/invoice/actions/invoice.actions';
import { getCurrencySymbol } from '@/features/invoice/constants/currencies';
import type { InvoiceWithLineItems } from '@/features/invoice/interface/invoice-db.types';
import { ROUTES } from '@/config/routes';
import { formatJalaliDate } from '@/lib/jalali';
import type { InvoiceStatus } from '@/lib/supabase/database.types';
import { formatMoney } from '@/lib/money';

interface IInvoiceCardProps {
	projectId: string;
	invoice: InvoiceWithLineItems;
	currency: string;
}

export function InvoiceCard({ projectId, invoice, currency }: IInvoiceCardProps) {
	const [isPending, startTransition] = useTransition();
	const { trigger: triggerCelebration } = useCelebration();
	const currencySymbol = getCurrencySymbol(currency);

	const handleAdvance = (nextStatus: InvoiceStatus) => {
		startTransition(async () => {
			const result = await updateInvoiceStatus(projectId, invoice.id, nextStatus);

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

	const periodLabel =
		invoice.period_start && invoice.period_end
			? `${formatJalaliDate(invoice.period_start)} — ${formatJalaliDate(invoice.period_end)}`
			: invoice.percentage
				? `${invoice.percentage}٪`
				: null;

	return (
		<article className='rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]'>
			<div className='flex items-start justify-between gap-3'>
				<div className='min-w-0'>
					<p className='font-black text-foreground' dir='ltr'>
						{invoice.invoice_no}
					</p>
					<p className='mt-1 text-sm text-muted-foreground'>
						{formatJalaliDate(invoice.issue_date)}
						{periodLabel && ` · ${periodLabel}`}
					</p>
				</div>
				<p className='shrink-0 text-lg font-black tabular-nums text-foreground'>
					{formatMoney(invoice.total)}{' '}
					<span className='text-xs font-bold text-muted-foreground'>{currencySymbol}</span>
				</p>
			</div>

			<div className='mt-4 border-t border-border pt-4'>
				<InvoiceStatusTimeline
					status={invoice.status}
					onAdvance={handleAdvance}
					pending={isPending}
					compact
				/>
			</div>

			<div className='mt-3 flex justify-end'>
				<Link href={ROUTES.projectInvoice(projectId, invoice.id)}>
					<Button size='sm' variant='ghost' haptic='light'>
						مشاهده فاکتور
					</Button>
				</Link>
			</div>
		</article>
	);
}
