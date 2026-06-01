'use client';

import {
	CheckSquare,
	Clock,
	FileText,
	LayoutDashboard,
	Settings,
} from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ROUTES } from '@/config/routes';
import type { ProjectType } from '@/lib/supabase/database.types';

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
		{ label: 'کارها', href: ROUTES.projectTodos(projectId), icon: CheckSquare, show: true },
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
		if (
			href.endsWith('/settings') ||
			href.includes('/timesheet') ||
			href.includes('/invoices') ||
			href.includes('/todos')
		) {
			return pathname === href || pathname.startsWith(`${href}/`);
		}

		return pathname === href;
	}

	const items = tabs.map((tab) => ({
		label: tab.label,
		href: appendSearchParams(tab.href, searchParams),
		icon: tab.icon,
		active: isTabActive(tab.href),
	}));

	return <SegmentedControl items={items} />;
}
