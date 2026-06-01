'use client';

import { ArrowRight, LayoutDashboard, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/atoms/Button';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { HapticLink } from '@/components/ui/HapticLink';
import { ROUTES } from '@/config/routes';
import { signOutAction } from '@/features/auth/actions/auth.actions';
import { cn } from '@/lib/utils/cn';

const ROUTE_TITLES: Record<string, string> = {
	[ROUTES.dashboard]: 'داشبورد',
	[ROUTES.monthlyWrapped]: 'خلاصه ماه',
	[ROUTES.projects]: 'پروژه‌ها',
	[ROUTES.projectNew]: 'پروژه جدید',
	[ROUTES.profile]: 'پروفایل',
	[ROUTES.paymentMethods]: 'روش‌های پرداخت',
};

const DESKTOP_NAV = [
	{ href: ROUTES.dashboard, label: 'داشبورد' },
	{ href: ROUTES.projects, label: 'پروژه‌ها' },
	{ href: ROUTES.profile, label: 'پروفایل' },
] as const;

function resolveTitle(pathname: string): string {
	if (ROUTE_TITLES[pathname]) {
		return ROUTE_TITLES[pathname];
	}

	if (pathname.startsWith('/projects/') && pathname.includes('/invoices')) {
		return 'فاکتورها';
	}

	if (pathname.startsWith('/projects/') && pathname.includes('/timesheet')) {
		return 'تایم‌شیت';
	}

	if (pathname.startsWith('/projects/') && pathname.includes('/settings')) {
		return 'تنظیمات';
	}

	return 'فاکتورچی';
}

function getBackHref(pathname: string): string | null {
	if (pathname === ROUTES.paymentMethods) {
		return ROUTES.profile;
	}

	if (pathname === ROUTES.monthlyWrapped) {
		return ROUTES.dashboard;
	}

	if (pathname === ROUTES.projectNew) {
		return ROUTES.projects;
	}

	const projectMatch = pathname.match(/^\/projects\/([^/]+)/);
	if (!projectMatch) {
		return null;
	}

	const projectId = projectMatch[1];
	const segments = pathname.split('/').filter(Boolean);

	if (segments.length <= 2) {
		return ROUTES.projects;
	}

	if (segments.includes('invoices')) {
		return ROUTES.projectInvoices(projectId);
	}

	return ROUTES.project(projectId);
}

function isProjectDetailRoute(pathname: string): boolean {
	return /^\/projects\/[^/]+/.test(pathname);
}

export function AppHeader() {
	const pathname = usePathname();
	const title = resolveTitle(pathname);
	const backHref = getBackHref(pathname);
	const inProject = isProjectDetailRoute(pathname);

	return (
		<header className='app-header no-print sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-xl'>
			<div className='mx-auto flex h-[var(--header-height)] max-w-6xl items-center gap-2 px-4'>
				<div className='flex min-w-0 flex-1 items-center gap-2'>
					{backHref ? (
						<HapticLink
							href={backHref}
							haptic='light'
							className='touch-target flex shrink-0 items-center justify-center rounded-xl text-primary transition-colors active:bg-muted'
							aria-label='بازگشت'
						>
							<ArrowRight size={22} />
						</HapticLink>
					) : (
						<HapticLink
							href={ROUTES.dashboard}
							haptic='selection'
							className='flex shrink-0 items-center gap-2 rounded-xl px-1 py-1'
						>
							<span className='flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)]'>
								<LayoutDashboard size={18} aria-hidden />
							</span>
							<span className='hidden font-black text-foreground sm:inline'>فاکتورچی</span>
						</HapticLink>
					)}

					<div className='min-w-0 flex-1 md:hidden'>
						<p className='truncate text-base font-black text-foreground'>
							{backHref || inProject ? title : 'فاکتورچی'}
						</p>
					</div>
				</div>

				<nav className='hidden items-center gap-1 md:flex' aria-label='ناوبری دسکتاپ'>
					{DESKTOP_NAV.map(({ href, label }) => {
						const active =
							pathname === href ||
							(href === ROUTES.profile && pathname.startsWith(`${ROUTES.profile}/`)) ||
							(href === ROUTES.projects &&
								pathname.startsWith('/projects') &&
								pathname !== ROUTES.projectNew);

						return (
							<Link
								key={href}
								href={href}
								className={cn(
									'rounded-xl px-3 py-2 text-sm font-bold transition-colors',
									active
										? 'bg-primary text-primary-foreground'
										: 'text-muted-foreground hover:bg-muted hover:text-foreground',
								)}
							>
								{label}
							</Link>
						);
					})}
				</nav>

				<div className='flex shrink-0 items-center gap-0.5'>
					<ThemeToggle />
					<form action={signOutAction}>
						<Button type='submit' variant='ghost' size='sm' haptic='light' className='touch-target'>
							<LogOut size={18} aria-hidden />
							<span className='sr-only'>خروج</span>
						</Button>
					</form>
				</div>
			</div>
		</header>
	);
}
