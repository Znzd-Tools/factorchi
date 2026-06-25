'use client';

import { FolderKanban, LayoutDashboard, Settings, Timer } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { HapticLink } from '@/components/ui/HapticLink';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/utils/cn';

const TAB_ITEMS = [
	{ href: ROUTES.dashboard, label: 'امروز', icon: LayoutDashboard },
	{ href: ROUTES.projects, label: 'پروژه‌ها', icon: FolderKanban },
	{ href: ROUTES.profile, label: 'تنظیمات', icon: Settings },
] as const;

function isTabActive(pathname: string, href: string): boolean {
	if (href === ROUTES.profile) {
		return pathname === href || pathname.startsWith(`${href}/`);
	}

	if (href === ROUTES.dashboard) {
		return pathname === href || pathname.startsWith(`${ROUTES.dashboard}/`);
	}

	return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
	const pathname = usePathname();

	return (
		<nav
			className='bottom-nav no-print fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl md:hidden'
			aria-label='ناوبری اصلی'
		>
			<HapticLink
				href={ROUTES.quickLog}
				haptic='success'
				className={cn(
					'absolute bottom-full left-4 z-10 mb-3 flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-elevated)] transition-transform active:scale-95',
					pathname === ROUTES.quickLog && 'ring-4 ring-accent/25',
				)}
				aria-label='ثبت سریع'
				aria-current={pathname === ROUTES.quickLog ? 'page' : undefined}
			>
				<Timer size={24} strokeWidth={2.25} aria-hidden />
			</HapticLink>

			<div className='mx-auto grid h-[var(--bottom-nav-height)] max-w-lg grid-cols-3 items-stretch px-2'>
				{TAB_ITEMS.map(({ href, label, icon: Icon }) => {
					const active = isTabActive(pathname, href);

					return (
						<HapticLink
							key={href}
							href={href}
							haptic='selection'
							className={cn(
								'flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 transition-colors active:scale-95',
								active ? 'text-primary' : 'text-muted-foreground',
							)}
							aria-current={active ? 'page' : undefined}
						>
							<span
								className={cn(
									'flex size-9 items-center justify-center rounded-lg transition-colors',
									active && 'bg-primary/10',
								)}
							>
								<Icon size={20} strokeWidth={active ? 2.5 : 2} aria-hidden />
							</span>
							<span className={cn('text-[10px] font-bold', active && 'text-primary')}>
								{label}
							</span>
						</HapticLink>
					);
				})}
			</div>
		</nav>
	);
}
