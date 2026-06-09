import { CalendarDays, Crown, Flame, Sparkles, Wallet, Zap } from 'lucide-react';

import type { IMonthlyWrappedStats } from '@/features/engagement/utils/monthly-wrapped';
import { formatHoursAsDurationFa } from '@/lib/duration';
import { toFaNumber } from '@/lib/locale/persian-digits';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils/cn';

interface IDashboardMonthSnapshotProps {
	stats: IMonthlyWrappedStats;
}

export function DashboardMonthSnapshot({ stats }: IDashboardMonthSnapshotProps) {
	if (!stats.hasActivity) {
		return (
			<section className='rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-card to-violet-500/5 p-5 text-center shadow-[var(--shadow-soft)]'>
				<div className='mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
					<Sparkles size={26} aria-hidden />
				</div>
				<p className='mt-4 text-lg font-black text-foreground'>ماه تازه‌ست، بزن بریم!</p>
				<p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
					اولین ساعت این ماه رو ثبت کن — بقیه آمار خودش جمع می‌شه.
				</p>
			</section>
		);
	}

	const highlights = [
		{
			label: 'روزهای کار',
			value: `${toFaNumber(stats.timeEntryDays)} روز`,
			icon: CalendarDays,
			tone: 'sky' as const,
		},
		{
			label: 'درآمد کار',
			value: formatMoney(stats.incomeTotal),
			icon: Wallet,
			tone: 'emerald' as const,
		},
		{
			label: 'دریافت‌شده',
			value: formatMoney(stats.paidTotal),
			icon: Zap,
			tone: 'amber' as const,
		},
		{
			label: 'در انتظار',
			value: formatMoney(stats.pendingTotal),
			icon: Flame,
			tone: 'rose' as const,
		},
	];

	const toneClasses = {
		sky: 'from-sky-500/15 to-card text-sky-700 dark:text-sky-300',
		emerald: 'from-emerald-500/15 to-card text-emerald-700 dark:text-emerald-300',
		amber: 'from-amber-500/15 to-card text-amber-700 dark:text-amber-300',
		rose: 'from-rose-500/15 to-card text-rose-700 dark:text-rose-300',
	};

	return (
		<section className='space-y-4'>
			<div className='rounded-2xl border border-primary/20 bg-gradient-to-l from-primary/10 via-card to-violet-500/10 p-4 shadow-[var(--shadow-soft)]'>
				<p className='text-xs font-bold text-primary'>داستان {stats.monthLabel}</p>
				<p className='mt-1 text-xl font-black text-foreground'>{stats.headline}</p>
				<p className='mt-2 text-sm leading-relaxed text-muted-foreground'>{stats.subline}</p>
			</div>

			<div className='grid grid-cols-2 gap-3'>
				{highlights.map((item) => (
					<div
						key={item.label}
						className={cn(
							'rounded-2xl border border-border/80 bg-gradient-to-br p-4 shadow-[var(--shadow-soft)]',
							toneClasses[item.tone],
						)}
					>
						<item.icon size={18} className='opacity-80' aria-hidden />
						<p className='mt-3 text-xs font-bold text-muted-foreground'>{item.label}</p>
						<p className='mt-1 text-sm font-black tabular-nums text-foreground'>{item.value}</p>
					</div>
				))}
			</div>

			<div className='grid gap-3 sm:grid-cols-2'>
				{stats.topProject && (
					<div className='flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]'>
						<div className='flex size-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600'>
							<Crown size={20} aria-hidden />
						</div>
						<div className='min-w-0'>
							<p className='text-xs font-bold text-muted-foreground'>قهرمان ماه</p>
							<p className='truncate font-black text-foreground'>{stats.topProject.name}</p>
							<p className='text-xs tabular-nums text-muted-foreground' dir='ltr'>
								{formatHoursAsDurationFa(stats.topProject.hours)}
							</p>
						</div>
					</div>
				)}
				{stats.busiestDay && (
					<div className='flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]'>
						<div className='flex size-11 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600'>
							<Flame size={20} aria-hidden />
						</div>
						<div className='min-w-0'>
							<p className='text-xs font-bold text-muted-foreground'>پرانرژی‌ترین روز</p>
							<p className='font-black text-foreground'>{stats.busiestDay.dateLabel}</p>
							<p className='text-xs tabular-nums text-muted-foreground' dir='ltr'>
								{formatHoursAsDurationFa(stats.busiestDay.hours)}
							</p>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
