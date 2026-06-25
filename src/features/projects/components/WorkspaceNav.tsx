'use client';

import {
	CheckSquare,
	Clock,
	FileText,
	LayoutDashboard,
	Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ROUTES } from '@/config/routes';
import type { ProjectType } from '@/lib/supabase/database.types';
import { cn } from '@/lib/utils/cn';

interface IWorkspaceNavProps {
	projectId: string;
	projectType: ProjectType;
}

function appendSearchParams(href: string, searchParams: URLSearchParams): string {
	const query = searchParams.toString();
	return query ? `${href}?${query}` : href;
}

export function WorkspaceNav({ projectId, projectType }: IWorkspaceNavProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const sections = [
		{ label: 'خلاصه', href: ROUTES.project(projectId), icon: LayoutDashboard, show: true },
		{
			label: 'کار',
			href: projectType === 'hourly' ? ROUTES.projectTimesheet(projectId) : ROUTES.projectTodos(projectId),
			icon: projectType === 'hourly' ? Clock : CheckSquare,
			show: true,
			match: (path: string) =>
				path.includes('/timesheet') || path.includes('/todos'),
		},
		{
			label: 'فاکتورها',
			href: ROUTES.projectInvoices(projectId),
			icon: FileText,
			show: true,
			match: (path: string) => path.includes('/invoices'),
		},
		{
			label: 'تنظیمات',
			href: ROUTES.projectSettings(projectId),
			icon: Settings,
			show: true,
			match: (path: string) => path.includes('/settings'),
		},
	].filter((section) => section.show);

	function isActive(href: string, match?: (path: string) => boolean): boolean {
		if (match) {
			return match(pathname);
		}

		return pathname === href;
	}

	const mobileItems = sections.map((section) => ({
		label: section.label,
		href: appendSearchParams(section.href, searchParams),
		icon: section.icon,
		active: isActive(section.href, section.match),
	}));

	return (
		<>
			<div className='no-print md:hidden'>
				<SegmentedControl items={mobileItems} />
			</div>

			<nav
				className='no-print hidden shrink-0 flex-col gap-1 md:flex md:w-44 lg:w-48'
				aria-label='بخش‌های پروژه'
			>
				{sections.map((section) => {
					const Icon = section.icon;
					const active = isActive(section.href, section.match);
					const href = appendSearchParams(section.href, searchParams);

					return (
						<Link
							key={section.href}
							href={href}
							className={cn(
								'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors',
								active
									? 'bg-primary/10 text-primary'
									: 'text-muted-foreground hover:bg-muted hover:text-foreground',
							)}
							aria-current={active ? 'page' : undefined}
						>
							<Icon size={16} aria-hidden />
							{section.label}
						</Link>
					);
				})}
			</nav>
		</>
	);
}
