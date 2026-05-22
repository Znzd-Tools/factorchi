'use client';

import {
	CreditCard,
	FolderKanban,
	LayoutDashboard,
	LogOut,
	Menu,
	User,
	X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ROUTES } from '@/config/routes';
import { signOutAction } from '@/features/auth/actions/auth.actions';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
	{ href: ROUTES.dashboard, label: 'داشبورد', icon: LayoutDashboard },
	{ href: ROUTES.projects, label: 'پروژه‌ها', icon: FolderKanban },
	{ href: ROUTES.profile, label: 'پروفایل', icon: User },
	{ href: ROUTES.paymentMethods, label: 'روش‌های پرداخت', icon: CreditCard },
] as const;

export function AppNav() {
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<header className='sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95'>
			<div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
				<div className='flex items-center gap-3'>
					<button
						type='button'
						className='rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800'
						onClick={() => setMobileOpen((open) => !open)}
						aria-label='منو'
					>
						{mobileOpen ? <X size={20} /> : <Menu size={20} />}
					</button>
					<Link
						href={ROUTES.dashboard}
						className='flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white'
					>
						<LayoutDashboard size={20} className='text-blue-600' />
						فاکتورچی
					</Link>
				</div>

				<nav className='hidden items-center gap-1 md:flex'>
					{NAV_ITEMS.map(({ href, label, icon: Icon }) => {
						const active = pathname === href || pathname.startsWith(`${href}/`);

						return (
							<Link
								key={href}
								href={href}
								className={cn(
									'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-colors',
									active
										? 'bg-blue-600 text-white'
										: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
								)}
							>
								<Icon size={16} />
								{label}
							</Link>
						);
					})}
				</nav>

				<div className='flex items-center gap-1'>
					<ThemeToggle />
					<form action={signOutAction} className='hidden sm:block'>
						<Button type='submit' variant='ghost' size='sm'>
							<LogOut size={16} />
							<span className='hidden lg:inline'>خروج</span>
						</Button>
					</form>
				</div>
			</div>

			{mobileOpen && (
				<nav className='border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800'>
					<div className='flex flex-col gap-1'>
						{NAV_ITEMS.map(({ href, label, icon: Icon }) => {
							const active = pathname === href || pathname.startsWith(`${href}/`);

							return (
								<Link
									key={href}
									href={href}
									onClick={() => setMobileOpen(false)}
									className={cn(
										'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold',
										active
											? 'bg-blue-600 text-white'
											: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
									)}
								>
									<Icon size={18} />
									{label}
								</Link>
							);
						})}
						<form action={signOutAction} className='pt-2'>
							<Button type='submit' variant='ghost' className='w-full justify-start gap-3'>
								<LogOut size={18} />
								خروج
							</Button>
						</form>
					</div>
				</nav>
			)}
		</header>
	);
}
