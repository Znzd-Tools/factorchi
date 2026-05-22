'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { newDate as newJalaliDate } from 'date-fns-jalali';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { formatJalaliMonthLabel } from '@/lib/jalali';
import {
	buildJalaliMonthHref,
	getAdjacentJalaliMonth,
	resolveJalaliMonthParams,
} from '@/features/timesheet/utils/month-params';

const navButtonClassName =
	'inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

export function MonthPickerFallback() {
	return (
		<div className='flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm'>
			<div className='h-8 w-8 animate-pulse rounded-xl bg-muted' />
			<div className='h-5 w-28 animate-pulse rounded bg-muted' />
			<div className='h-8 w-8 animate-pulse rounded-xl bg-muted' />
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
		<div className='flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm'>
			<Link
				href={buildJalaliMonthHref(pathname, searchParams, prev.year, prev.month)}
				prefetch={false}
				scroll={false}
				className={navButtonClassName}
				aria-label='ماه قبل'
			>
				<ChevronRight size={18} />
			</Link>
			<p className='text-base font-bold text-foreground'>{formatJalaliMonthLabel(current)}</p>
			<Link
				href={buildJalaliMonthHref(pathname, searchParams, next.year, next.month)}
				prefetch={false}
				scroll={false}
				className={navButtonClassName}
				aria-label='ماه بعد'
			>
				<ChevronLeft size={18} />
			</Link>
		</div>
	);
}
