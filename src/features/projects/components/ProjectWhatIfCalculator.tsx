'use client';

import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';

import { computeWhatIfProjection } from '@/features/projects/utils/what-if';
import { formatHoursAsDurationFa } from '@/lib/duration';
import { toFaNumber } from '@/lib/locale/persian-digits';
import { formatMoney } from '@/lib/money';
import { triggerHaptic } from '@/lib/haptics';

interface IProjectWhatIfCalculatorProps {
	monthlyHours: number;
	monthlyAmount: number;
	hourlyRate: number;
	currencySymbol: string;
	maxExtraHours?: number;
}

const DEFAULT_MAX_EXTRA = 40;

export function ProjectWhatIfCalculator({
	monthlyHours,
	monthlyAmount,
	hourlyRate,
	currencySymbol,
	maxExtraHours = DEFAULT_MAX_EXTRA,
}: IProjectWhatIfCalculatorProps) {
	const [extraHours, setExtraHours] = useState(4);

	const projection = useMemo(
		() => computeWhatIfProjection(monthlyHours, monthlyAmount, hourlyRate, extraHours),
		[monthlyHours, monthlyAmount, hourlyRate, extraHours],
	);

	const step = 0.5;

	return (
		<section className='rounded-2xl border border-border bg-gradient-to-l from-primary/5 via-card to-violet-500/5 p-4 shadow-[var(--shadow-soft)]'>
			<div className='flex items-start gap-3'>
				<div className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
					<Sparkles size={20} aria-hidden />
				</div>
				<div>
					<p className='text-sm font-black text-foreground'>اگر بیشتر کار کنی؟</p>
					<p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
						ساعات اضافه را بکش و ببین درآمد این ماه چقدر می‌شود.
					</p>
				</div>
			</div>

			<div className='mt-5'>
				<div className='flex items-center justify-between text-sm'>
					<span className='font-bold text-muted-foreground'>ساعت اضافه</span>
					<span className='font-black text-primary' dir='ltr'>
						{formatHoursAsDurationFa(extraHours)}
					</span>
				</div>
				<input
					type='range'
					min={0}
					max={maxExtraHours}
					step={step}
					value={extraHours}
					onChange={(event) => {
						const next = Number(event.target.value);
						setExtraHours(next);
						if (next % 4 === 0) {
							triggerHaptic('selection');
						}
					}}
					className='mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary'
					aria-label='ساعات اضافه فرضی'
				/>
				<div className='mt-1 flex justify-between text-[10px] text-muted-foreground'>
					<span>{toFaNumber(0)}</span>
					<span dir='ltr'>{formatHoursAsDurationFa(maxExtraHours)}</span>
				</div>
			</div>

			<div className='mt-5 grid grid-cols-2 gap-3'>
				<div className='rounded-xl bg-muted/60 px-3 py-3 text-center'>
					<p className='text-[10px] font-bold text-muted-foreground'>درآمد اضافه</p>
					<p className='mt-1 text-base font-black text-foreground'>
						{formatMoney(projection.extraAmount)}{' '}
						<span className='text-xs text-muted-foreground'>{currencySymbol}</span>
					</p>
				</div>
				<div className='rounded-xl bg-primary/10 px-3 py-3 text-center'>
					<p className='text-[10px] font-bold text-primary'>جمع ماه با این فرض</p>
					<p className='mt-1 text-base font-black text-foreground'>
						{formatMoney(projection.projectedMonthlyAmount)}{' '}
						<span className='text-xs text-muted-foreground'>{currencySymbol}</span>
					</p>
				</div>
			</div>

			<p className='mt-3 text-center text-xs text-muted-foreground' dir='ltr'>
				{formatHoursAsDurationFa(projection.projectedMonthlyHours)} · نرخ{' '}
				{formatMoney(hourlyRate)} {currencySymbol}
			</p>
		</section>
	);
}
