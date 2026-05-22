'use client';

import {
	Clock,
	FileText,
	LayoutDashboard,
	Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { ROUTES } from '@/config/routes';
import type { ProjectType } from '@/lib/supabase/database.types';
import { cn } from '@/lib/utils/cn';

interface IProjectTabsProps {
	projectId: string;
	projectType: ProjectType;
}

function appendSearchParams(href: string, searchParams: URLSearchParams): string {
	const query = searchParams.toString();
	return query ? `${href}?${query}` : href;
}

export function ProjectTabs({ projectId, projectType }: IProjectTabsProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const tabs = [
		{ label: 'داشبورد', href: ROUTES.project(projectId), icon: LayoutDashboard, show: true },
		{
			label: 'تایم‌شیت',
			href: ROUTES.projectTimesheet(projectId),
			icon: Clock,
			show: projectType === 'hourly',
		},
		{ label: 'فاکتورها', href: ROUTES.projectInvoices(projectId), icon: FileText, show: true },
		{ label: 'تنظیمات', href: ROUTES.projectSettings(projectId), icon: Settings, show: true },
	].filter((tab) => tab.show);

	function isTabActive(href: string): boolean {
		if (href.endsWith('/settings') || href.includes('/timesheet') || href.includes('/invoices')) {
			return pathname === href || pathname.startsWith(`${href}/`);
		}

		return pathname === href;
	}

	return (
		<nav className='-mx-1 flex gap-1 overflow-x-auto border-b border-border pb-px'>
			{tabs.map((tab) => {
				const active = isTabActive(tab.href);
				const Icon = tab.icon;
				const href = appendSearchParams(tab.href, searchParams);

				return (
					<Link
						key={tab.href}
						href={href}
						className={cn(
							'flex shrink-0 items-center gap-2 rounded-t-xl px-3 py-2.5 text-sm font-bold transition-colors sm:px-4',
							active
								? 'border border-b-0 border-border bg-card text-blue-600 dark:text-blue-400'
								: 'text-muted-foreground hover:bg-muted hover:text-foreground',
						)}
					>
						<Icon size={16} />
						{tab.label}
					</Link>
				);
			})}
		</nav>
	);
}
