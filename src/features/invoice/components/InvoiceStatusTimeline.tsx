'use client';

import { Check } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import {
	INVOICE_STATUS_LABELS,
} from '@/features/invoice/constants/invoice-status';
import {
	buildInvoiceTimelineSteps,
	getNextStatusActions,
} from '@/features/invoice/utils/status-timeline';
import type { InvoiceStatus } from '@/lib/supabase/database.types';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils/cn';

interface IInvoiceStatusTimelineProps {
	status: InvoiceStatus;
	onAdvance?: (nextStatus: InvoiceStatus) => void;
	pending?: boolean;
	compact?: boolean;
}

const stateStyles: Record<
	string,
	{ dot: string; line: string; text: string }
> = {
	done: {
		dot: 'bg-primary text-primary-foreground',
		line: 'bg-primary',
		text: 'text-muted-foreground',
	},
	current: {
		dot: 'bg-primary text-primary-foreground ring-4 ring-primary/20',
		line: 'bg-muted',
		text: 'text-foreground font-black',
	},
	upcoming: {
		dot: 'bg-muted text-muted-foreground',
		line: 'bg-muted',
		text: 'text-muted-foreground',
	},
	terminal: {
		dot: 'bg-destructive text-white',
		line: 'bg-destructive/30',
		text: 'text-destructive font-black',
	},
};

export function InvoiceStatusTimeline({
	status,
	onAdvance,
	pending,
	compact,
}: IInvoiceStatusTimelineProps) {
	const steps = buildInvoiceTimelineSteps(status);
	const nextActions = getNextStatusActions(status);

	return (
		<div className={cn('space-y-3', compact && 'space-y-2')}>
			<div className='scrollbar-hide flex items-start gap-0 overflow-x-auto pb-1'>
				{steps.map((step, index) => {
					const styles = stateStyles[step.state];
					const isLast = index === steps.length - 1;

					return (
						<div key={`${step.status}-${index}`} className='flex min-w-[4.5rem] flex-1 flex-col items-center'>
							<div className='flex w-full items-center'>
								<div
									className={cn(
										'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all',
										styles.dot,
										compact && 'size-7',
									)}
								>
									{step.state === 'done' ? (
										<Check size={14} strokeWidth={3} aria-hidden />
									) : (
										<span>{index + 1}</span>
									)}
								</div>
								{!isLast && (
									<div
										className={cn('mx-1 h-1 flex-1 rounded-full', styles.line)}
										aria-hidden
									/>
								)}
							</div>
							<p
								className={cn(
									'mt-2 max-w-[5.5rem] text-center text-[10px] leading-tight sm:text-xs',
									styles.text,
								)}
							>
								{step.label}
							</p>
						</div>
					);
				})}
			</div>

			{onAdvance && nextActions.length > 0 && (
				<div className='flex flex-wrap gap-2'>
					{nextActions.map((nextStatus) => (
						<Button
							key={nextStatus}
							type='button'
							size='sm'
							variant={nextStatus === 'paid' ? 'primary' : nextStatus === 'canceled' ? 'danger' : 'secondary'}
							disabled={pending}
							haptic={nextStatus === 'paid' ? 'success' : 'light'}
							onClick={() => {
								triggerHaptic('selection');
								onAdvance(nextStatus);
							}}
						>
							{nextStatus === 'sent' && 'علامت‌گذاری به ارسال‌شده'}
							{nextStatus === 'paid' && 'پرداخت شد'}
							{nextStatus === 'overdue' && INVOICE_STATUS_LABELS.overdue}
							{nextStatus === 'canceled' && INVOICE_STATUS_LABELS.canceled}
						</Button>
					))}
				</div>
			)}
		</div>
	);
}
