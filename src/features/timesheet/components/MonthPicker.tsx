'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { newDate as newJalaliDate } from 'date-fns-jalali';
import { usePathname, useSearchParams } from 'next/navigation';

import { HapticLink } from '@/components/ui/HapticLink';
import { formatJalaliMonthLabel } from '@/lib/jalali';
import {
	buildJalaliMonthHref,
	getAdjacentJalaliMonth,
	resolveJalaliMonthParams,
} from '@/features/timesheet/utils/month-params';
import { cn } from '@/lib/utils/cn';

const navButtonClassName =
	'touch-target inline-flex items-center justify-center rounded-xl text-muted-foreground transition-colors active:bg-muted active:text-foreground';

export function MonthPickerFallback() {
	return (
		<div className='flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-soft)]'>
			<div className='h-10 w-10 animate-pulse rounded-xl bg-muted' />
			<div className='h-5 w-28 animate-pulse rounded bg-muted' />
			<div className='h-10 w-10 animate-pulse rounded-xl bg-muted' />
		</div>
	);
}

export function MonthPicker() {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { year, month } = resolveJalaliMonthParams(Object.fromEntries(searchParams.entries()));
	const current = newJalaliDate(year, month, 1);
	const prev = getAdjacentJalaliMonth(year, month, 'prev');
	const next = getAdjacentJalaliMonth(year, month, 'next');

	return (
		<div className='flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-3 py-2 shadow-[var(--shadow-soft)] sm:px-4 sm:py-3'>
			<HapticLink
				href={buildJalaliMonthHref(pathname, searchParams, prev.year, prev.month)}
				prefetch={false}
				scroll={false}
				haptic='selection'
				className={navButtonClassName}
				aria-label='ماه قبل'
			>
				<ChevronRight size={20} />
			</HapticLink>
			<p className='text-base font-black text-foreground'>{formatJalaliMonthLabel(current)}</p>
			<HapticLink
				href={buildJalaliMonthHref(pathname, searchParams, next.year, next.month)}
				prefetch={false}
				scroll={false}
				haptic='selection'
				className={cn(navButtonClassName)}
				aria-label='ماه بعد'
			>
				<ChevronLeft size={20} />
			</HapticLink>
		</div>
	);
}
