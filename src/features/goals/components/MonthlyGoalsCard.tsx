'use client';

import { Target } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Modal } from '@/components/atoms/Modal';
import { ProgressRing } from '@/components/ui/ProgressRing';
import {
	type IGoalsActionState,
	updateMonthlyGoalsAction,
} from '@/features/goals/actions/goals.actions';
import { computeGoalProgress } from '@/features/goals/utils/goal-progress';
import { formatHoursAsDurationFa } from '@/lib/duration';
import { toFaNumber } from '@/lib/locale/persian-digits';
import { formatMoney } from '@/lib/money';
import { triggerHaptic } from '@/lib/haptics';

interface IMonthlyGoalsCardProps {
	monthLabel: string;
	hoursGoal: number | null;
	paidGoal: number | null;
	currentHours: number;
	currentPaid: number;
}

const initialState: IGoalsActionState = {};

export function MonthlyGoalsCard({
	monthLabel,
	hoursGoal,
	paidGoal,
	currentHours,
	currentPaid,
}: IMonthlyGoalsCardProps) {
	const [open, setOpen] = useState(false);
	const [state, formAction, pending] = useActionState(updateMonthlyGoalsAction, initialState);

	const hoursProgress = computeGoalProgress(currentHours, hoursGoal);
	const paidProgress = computeGoalProgress(currentPaid, paidGoal);
	const hasAnyGoal = hoursGoal != null || paidGoal != null;

	useEffect(() => {
		if (state.error) {
			toast.error(state.error);
		}

		if (state.success) {
			toast.success(state.success);
			triggerHaptic('success');
			setOpen(false);
		}
	}, [state.error, state.success]);

	return (
		<>
			<section className='rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]'>
				<div className='flex items-start justify-between gap-3'>
					<div className='flex items-center gap-3'>
						<div className='flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
							<Target size={20} aria-hidden />
						</div>
						<div>
							<p className='text-xs font-bold text-muted-foreground'>هدف {monthLabel}</p>
							<p className='mt-0.5 text-sm font-bold text-foreground'>
								{hasAnyGoal ? 'پیشرفت ماه جاری' : 'هدفی برای این ماه نذاشتی'}
							</p>
						</div>
					</div>
					<Button type='button' variant='secondary' size='sm' haptic='light' onClick={() => setOpen(true)}>
						{hasAnyGoal ? 'ویرایش' : 'تعیین هدف'}
					</Button>
				</div>

				{hasAnyGoal ? (
					<div className='mt-5 flex justify-around gap-4 border-t border-border pt-5'>
						{hoursProgress && (
							<ProgressRing
								percent={hoursProgress.percent}
								complete={hoursProgress.complete}
								label='ساعات'
								subLabel={`${formatHoursAsDurationFa(hoursProgress.current)} / ${formatHoursAsDurationFa(hoursProgress.target)}`}
							/>
						)}
						{paidProgress && (
							<ProgressRing
								percent={paidProgress.percent}
								complete={paidProgress.complete}
								label='دریافتی'
								subLabel={`${formatMoney(paidProgress.current)} / ${formatMoney(paidProgress.target)}`}
							/>
						)}
					</div>
				) : (
					<p className='mt-3 text-sm leading-relaxed text-muted-foreground'>
						مثلاً {toFaNumber(80)} ساعت کار یا {formatMoney(50_000_000)} دریافتی — هر چیزی که برات معنی‌دار باشه.
					</p>
				)}

				{hoursProgress?.complete && paidProgress?.complete && (
					<p className='mt-4 rounded-xl bg-emerald-500/10 px-3 py-2 text-center text-sm font-bold text-emerald-700 dark:text-emerald-300'>
						هر دو هدف ماه رو زدی — فوق‌العاده‌ای!
					</p>
				)}
			</section>

			<Modal open={open} onClose={() => setOpen(false)} title='هدف ماهانه'>
				<form action={formAction} className='space-y-4'>
					<p className='text-sm text-muted-foreground'>
						هدف برای ماه جاری ({monthLabel}). خالی بذار = بدون هدف.
					</p>
					<Input
						label='هدف ساعات (عدد)'
						name='hoursGoal'
						inputMode='decimal'
						dir='ltr'
						placeholder='مثلاً 80'
						defaultValue={hoursGoal != null ? String(hoursGoal) : ''}
					/>
					<Input
						label='هدف دریافتی (تومان)'
						name='paidGoal'
						inputMode='numeric'
						dir='ltr'
						placeholder='مثلاً 50000000'
						defaultValue={paidGoal != null ? String(paidGoal) : ''}
					/>
					<div className='flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end'>
						<Button type='button' variant='secondary' onClick={() => setOpen(false)} disabled={pending}>
							انصراف
						</Button>
						<Button type='submit' disabled={pending} haptic='medium'>
							{pending ? 'در حال ذخیره…' : 'ذخیره'}
						</Button>
					</div>
				</form>
			</Modal>
		</>
	);
}
