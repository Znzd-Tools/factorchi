import { Flame } from 'lucide-react';

import type { ITimeStreakStats } from '@/features/engagement/utils/time-streak';
import { getStreakEncouragement } from '@/features/engagement/utils/time-streak';
import { toFaNumber } from '@/lib/locale/persian-digits';
import { cn } from '@/lib/utils/cn';

interface IStreakCardProps {
	streak: ITimeStreakStats;
}

export function StreakCard({ streak }: IStreakCardProps) {
	const encouragement = getStreakEncouragement(streak);
	const isHot = streak.current >= 3;

	return (
		<section
			className={cn(
				'rounded-2xl border p-4 shadow-[var(--shadow-soft)]',
				isHot
					? 'border-amber-300/60 bg-gradient-to-l from-amber-500/10 via-card to-card'
					: 'border-border bg-card',
			)}
		>
			<div className='flex items-center gap-4'>
				<div
					className={cn(
						'flex size-14 shrink-0 items-center justify-center rounded-2xl',
						isHot ? 'bg-amber-500/15 text-amber-600' : 'bg-primary/10 text-primary',
					)}
				>
					<Flame size={28} aria-hidden />
				</div>
				<div className='min-w-0 flex-1'>
					<p className='text-xs font-bold text-muted-foreground'>زنجیره ثبت ساعت</p>
					<p className='mt-1 text-2xl font-black text-foreground'>
						{streak.current > 0 ? (
							<>
								{toFaNumber(streak.current)} <span className='text-base font-bold'>روز پیاپی</span>
							</>
						) : (
							<span className='text-lg'>هنوز شروع نشده</span>
						)}
					</p>
					<p className='mt-1 text-sm leading-relaxed text-muted-foreground'>{encouragement}</p>
				</div>
			</div>
			{streak.longest > streak.current && streak.longest > 0 && (
				<p className='mt-3 border-t border-border pt-3 text-xs text-muted-foreground'>
					بهترین رکورد: {toFaNumber(streak.longest)} روز · {toFaNumber(streak.activeDates)} روز با ثبت
				</p>
			)}
		</section>
	);
}
