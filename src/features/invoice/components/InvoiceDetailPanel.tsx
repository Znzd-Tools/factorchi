'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Card } from '@/components/atoms/Card';
import { InvoiceStatusTimeline } from '@/features/invoice/components/InvoiceStatusTimeline';
import { useCelebration } from '@/features/engagement/context/CelebrationContext';
import { updateInvoiceStatus } from '@/features/invoice/actions/invoice.actions';
import { getCurrencySymbol } from '@/features/invoice/constants/currencies';
import { INVOICE_STATUS_LABELS } from '@/features/invoice/constants/invoice-status';
import { formatJalaliDate } from '@/lib/jalali';
import type { InvoiceStatus } from '@/lib/supabase/database.types';
import { formatMoney } from '@/lib/money';

interface IInvoiceDetailPanelProps {
	projectId: string;
	invoiceId: string;
	invoiceNo: string;
	issueDate: string;
	total: number;
	currency: string;
	status: InvoiceStatus;
}

export function InvoiceDetailPanel({
	projectId,
	invoiceId,
	invoiceNo,
	issueDate,
	total,
	currency,
	status,
}: IInvoiceDetailPanelProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const { trigger: triggerCelebration } = useCelebration();
	const currencySymbol = getCurrencySymbol(currency);

	const handleAdvance = (nextStatus: InvoiceStatus) => {
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

			router.refresh();
		});
	};

	return (
		<Card className='no-print' title='مسیر فاکتور' description='وضعیت را با یک لمس جلو ببر'>
			<div className='mb-4 flex flex-wrap items-center justify-between gap-2 text-sm'>
				<span className='font-bold tabular-nums text-foreground' dir='ltr'>
					{invoiceNo}
				</span>
				<span className='text-muted-foreground'>{formatJalaliDate(issueDate)}</span>
				<span className='font-black tabular-nums text-foreground'>
					{formatMoney(total)} {currencySymbol}
				</span>
				<span className='rounded-full bg-muted px-2 py-0.5 text-xs font-bold'>
					{INVOICE_STATUS_LABELS[status]}
				</span>
			</div>
			<InvoiceStatusTimeline status={status} onAdvance={handleAdvance} pending={isPending} />
		</Card>
	);
}
