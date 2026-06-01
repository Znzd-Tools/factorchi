'use client';

import { useState } from 'react';
import {
	CalendarDays,
	Clock,
	FileText,
	FolderKanban,
	Share2,
	Sparkles,
	TrendingUp,
	Wallet,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import {
	buildWrappedShareText,
	type IMonthlyWrappedStats,
} from '@/features/engagement/utils/monthly-wrapped';
import { WrappedBackLink, WrappedMonthNav } from '@/features/engagement/components/WrappedMonthNav';
import { formatHoursAsDurationFa } from '@/lib/duration';
import { toFaNumber } from '@/lib/locale/persian-digits';
import { formatMoney } from '@/lib/money';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils/cn';

interface IMonthlyWrappedViewProps {
	stats: IMonthlyWrappedStats;
	prevHref: string;
	nextHref: string;
	canGoNext: boolean;
}

function WrappedStatCard({
	icon: Icon,
	label,
	value,
	subValue,
	accent = 'default',
}: {
	icon: typeof Clock;
	label: string;
	value: string;
	subValue?: string;
	accent?: 'default' | 'primary' | 'success' | 'warning';
}) {
	const accentClasses = {
		default: 'bg-muted text-foreground',
		primary: 'bg-primary/10 text-primary',
		success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
		warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
	};

	return (
		<div className='rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]'>
			<div className='flex items-start gap-3'>
				<div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', accentClasses[accent])}>
					<Icon size={20} aria-hidden />
				</div>
				<div className='min-w-0 flex-1'>
					<p className='text-xs font-bold text-muted-foreground'>{label}</p>
					<p className='mt-1 text-xl font-black text-foreground' dir='ltr'>
						{value}
					</p>
					{subValue && (
						<p className='mt-1 text-sm text-muted-foreground'>{subValue}</p>
					)}
				</div>
			</div>
		</div>
	);
}

export function MonthlyWrappedView({
	stats,
	prevHref,
	nextHref,
	canGoNext,
}: IMonthlyWrappedViewProps) {
	const [copying, setCopying] = useState(false);

	const handleShare = async () => {
		const text = buildWrappedShareText(stats, formatHoursAsDurationFa, formatMoney);

		setCopying(true);
		triggerHaptic('light');

		try {
			if (navigator.share) {
				await navigator.share({ title: `خلاصه ${stats.monthLabel}`, text });
				toast.success('اشتراک‌گذاری باز شد.');
			} else {
				await navigator.clipboard.writeText(text);
				toast.success('خلاصه ماه در حافظه کپی شد.');
			}
		} catch {
			try {
				await navigator.clipboard.writeText(text);
				toast.success('خلاصه ماه در حافظه کپی شد.');
			} catch {
				toast.error('کپی انجام نشد.');
			}
		} finally {
			setCopying(false);
		}
	};

	return (
		<div className='space-y-5 pb-8'>
			<WrappedBackLink />

			<WrappedMonthNav
				monthLabel={stats.monthLabel}
				prevHref={prevHref}
				nextHref={nextHref}
				canGoNext={canGoNext}
			/>

			<section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-primary to-indigo-800 p-6 text-primary-foreground shadow-[var(--shadow-elevated)]'>
				<div className='relative z-10'>
					<p className='flex items-center gap-2 text-sm opacity-90'>
						<Sparkles size={16} aria-hidden />
						خلاصه ماه
					</p>
					<h1 className='mt-2 text-2xl font-black leading-tight'>{stats.headline}</h1>
					<p className='mt-3 text-sm leading-relaxed opacity-90'>{stats.subline}</p>
				</div>
			</section>

			{!stats.hasActivity ? (
				<div className='rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center'>
					<p className='text-sm text-muted-foreground'>
						برای این ماه هنوز ساعت یا فاکتوری ثبت نشده.
					</p>
				</div>
			) : (
				<div className='space-y-3'>
					<WrappedStatCard
						icon={Clock}
						label='کل ساعات ماه'
						value={formatHoursAsDurationFa(stats.totalHours)}
						subValue={`${toFaNumber(stats.timeEntryDays)} روز با ثبت ساعت`}
						accent='primary'
					/>

					{stats.topProject && (
						<WrappedStatCard
							icon={FolderKanban}
							label='پروژه برتر'
							value={stats.topProject.name}
							subValue={formatHoursAsDurationFa(stats.topProject.hours)}
						/>
					)}

					{stats.busiestDay && (
						<WrappedStatCard
							icon={CalendarDays}
							label='پرکارترین روز'
							value={stats.busiestDay.dateLabel}
							subValue={formatHoursAsDurationFa(stats.busiestDay.hours)}
						/>
					)}

					<div className='grid grid-cols-2 gap-3'>
						<WrappedStatCard
							icon={Wallet}
							label='دریافت‌شده'
							value={formatMoney(stats.paidTotal)}
							accent='success'
						/>
						<WrappedStatCard
							icon={TrendingUp}
							label='در انتظار'
							value={formatMoney(stats.pendingTotal)}
							accent='warning'
						/>
					</div>

					{stats.biggestInvoice && (
						<WrappedStatCard
							icon={FileText}
							label='بزرگ‌ترین فاکتور'
							value={formatMoney(stats.biggestInvoice.total)}
							subValue={stats.biggestInvoice.projectName}
						/>
					)}

					<p className='text-center text-xs text-muted-foreground'>
						{toFaNumber(stats.invoicesCount)} فاکتور · جمع صورتحساب {formatMoney(stats.invoicedTotal)}
					</p>
				</div>
			)}

			<Button
				type='button'
				className='w-full'
				variant='secondary'
				haptic='medium'
				disabled={copying || !stats.hasActivity}
				onClick={handleShare}
			>
				<Share2 size={18} />
				{copying ? 'در حال آماده‌سازی…' : 'اشتراک / کپی خلاصه'}
			</Button>
		</div>
	);
}
