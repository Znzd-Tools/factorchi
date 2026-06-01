'use client';

import { FolderKanban, LayoutDashboard, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { HapticLink } from '@/components/ui/HapticLink';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/utils/cn';

const TAB_ITEMS = [
	{ href: ROUTES.dashboard, label: 'خانه', icon: LayoutDashboard },
	{ href: ROUTES.projects, label: 'پروژه‌ها', icon: FolderKanban },
	{ href: ROUTES.profile, label: 'پروفایل', icon: User },
] as const;

function isTabActive(pathname: string, href: string): boolean {
	if (href === ROUTES.profile) {
		return pathname === href || pathname.startsWith(`${href}/`);
	}

	return pathname === href || (href !== ROUTES.dashboard && pathname.startsWith(`${href}/`));
}

export function BottomNav() {
	const pathname = usePathname();

	return (
		<nav
			className='bottom-nav no-print fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/90 backdrop-blur-xl md:hidden'
			aria-label='ناوبری اصلی'
		>
			<div className='mx-auto flex h-16 max-w-lg items-stretch justify-around px-2'>
				{TAB_ITEMS.map(({ href, label, icon: Icon }) => {
					const active = isTabActive(pathname, href);

					return (
						<HapticLink
							key={href}
							href={href}
							haptic='selection'
							className={cn(
								'flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 transition-colors active:scale-95',
								active ? 'text-primary' : 'text-muted-foreground',
							)}
							aria-current={active ? 'page' : undefined}
						>
							<span
								className={cn(
									'flex size-9 items-center justify-center rounded-xl transition-colors',
									active && 'bg-primary/15',
								)}
							>
								<Icon size={22} strokeWidth={active ? 2.5 : 2} aria-hidden />
							</span>
							<span className={cn('text-[11px] font-bold', active && 'text-primary')}>
								{label}
							</span>
						</HapticLink>
					);
				})}
			</div>
		</nav>
	);
}
