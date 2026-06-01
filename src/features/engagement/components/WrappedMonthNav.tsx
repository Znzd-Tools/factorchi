'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { ROUTES } from '@/config/routes';
import { HapticLink } from '@/components/ui/HapticLink';
import { cn } from '@/lib/utils/cn';

interface IWrappedMonthNavProps {
	monthLabel: string;
	prevHref: string;
	nextHref: string;
	canGoNext: boolean;
}

const navButtonClassName =
	'touch-target inline-flex items-center justify-center rounded-xl text-muted-foreground transition-colors active:bg-muted active:text-foreground';

export function WrappedMonthNav({
	monthLabel,
	prevHref,
	nextHref,
	canGoNext,
}: IWrappedMonthNavProps) {
	return (
		<div className='flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-3 py-2 shadow-[var(--shadow-soft)]'>
			<HapticLink href={prevHref} haptic='selection' className={navButtonClassName} aria-label='ماه قبل'>
				<ChevronRight size={20} />
			</HapticLink>
			<p className='text-center text-sm font-black text-foreground'>{monthLabel}</p>
			{canGoNext ? (
				<HapticLink href={nextHref} haptic='selection' className={navButtonClassName} aria-label='ماه بعد'>
					<ChevronLeft size={20} />
				</HapticLink>
			) : (
				<span className={cn(navButtonClassName, 'pointer-events-none opacity-30')} aria-hidden>
					<ChevronLeft size={20} />
				</span>
			)}
		</div>
	);
}

export function WrappedBackLink() {
	return (
		<Link
			href={ROUTES.dashboard}
			className='inline-flex items-center gap-1 text-sm font-bold text-primary transition-colors active:opacity-80'
		>
			<ChevronRight size={16} aria-hidden />
			بازگشت به خانه
		</Link>
	);
}
