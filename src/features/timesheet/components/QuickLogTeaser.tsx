import { Timer } from 'lucide-react';

import { HapticLink } from '@/components/ui/HapticLink';
import { ROUTES } from '@/config/routes';

export function QuickLogTeaser() {
	return (
		<HapticLink
			href={ROUTES.quickLog}
			haptic='medium'
			className='flex items-center gap-3 rounded-2xl border border-accent/25 bg-gradient-to-l from-accent/10 to-card p-4 shadow-[var(--shadow-soft)] transition-transform active:scale-[0.99]'
		>
			<div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground'>
				<Timer size={22} aria-hidden />
			</div>
			<div className='min-w-0 flex-1'>
				<p className='text-xs font-bold text-accent'>ثبت سریع</p>
				<p className='mt-0.5 font-black text-foreground'>یک ضربه، ساعت امروز</p>
				<p className='mt-1 text-sm text-muted-foreground'>
					میان‌بر PWA · نصب از منوی مرورگر
				</p>
			</div>
		</HapticLink>
	);
}
