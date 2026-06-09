import { Sparkles } from 'lucide-react';

import { HapticLink } from '@/components/ui/HapticLink';
import { buildMonthlyWrappedHref } from '@/features/engagement/utils/wrapped-month-href';
import { formatHoursAsDurationFa } from '@/lib/duration';
import type { IMonthlyWrappedStats } from '@/features/engagement/utils/monthly-wrapped';
import { formatMoney } from '@/lib/money';

interface IWrappedTeaserProps {
	stats: Pick<
		IMonthlyWrappedStats,
		'year' | 'month' | 'monthLabel' | 'headline' | 'totalHours' | 'incomeTotal' | 'hasActivity'
	>;
}

export function WrappedTeaser({ stats }: IWrappedTeaserProps) {
	const href = buildMonthlyWrappedHref(stats.year, stats.month);

	return (
		<HapticLink
			href={href}
			haptic='light'
			className='block rounded-2xl border border-primary/20 bg-gradient-to-l from-primary/10 via-card to-violet-500/10 p-4 shadow-[var(--shadow-soft)] transition-transform active:scale-[0.99]'
		>
			<div className='flex items-center gap-3'>
				<div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)]'>
					<Sparkles size={22} aria-hidden />
				</div>
				<div className='min-w-0 flex-1'>
					<p className='text-xs font-bold text-primary'>خلاصه ماه</p>
					<p className='mt-0.5 truncate text-base font-black text-foreground'>{stats.monthLabel}</p>
					<p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>{stats.headline}</p>
				</div>
			</div>
			{stats.hasActivity && (
				<div className='mt-3 flex gap-4 border-t border-border/80 pt-3 text-xs font-bold text-muted-foreground'>
					<span dir='ltr'>{formatHoursAsDurationFa(stats.totalHours)}</span>
					<span>·</span>
					<span>{formatMoney(stats.incomeTotal)} درآمد</span>
				</div>
			)}
			<p className='mt-2 text-center text-xs font-bold text-primary'>مشاهده خلاصه کامل ←</p>
		</HapticLink>
	);
}
