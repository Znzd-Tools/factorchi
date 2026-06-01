'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils/cn';

function shouldHideBottomNav(pathname: string): boolean {
	return /^\/projects\/[^/]+/.test(pathname);
}

interface IAppShellProps {
	children: ReactNode;
}

export function AppShell({ children }: IAppShellProps) {
	const pathname = usePathname();
	const hideBottomNav = shouldHideBottomNav(pathname);

	return (
		<div className='min-h-screen bg-background'>
			<AppHeader />
			<main
				className={cn(
					'mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6 print:mx-0 print:max-w-none print:px-0 print:py-0',
					hideBottomNav ? 'app-shell-main--no-nav' : 'app-shell-main',
				)}
			>
				{children}
			</main>
			{!hideBottomNav && <BottomNav />}
		</div>
	);
}
