'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/utils/cn';

interface IProjectWorkShellProps {
	projectId: string;
	projectType: 'hourly' | 'total';
	timeContent: ReactNode;
	todosContent: ReactNode;
}

export function ProjectWorkShell({
	projectId,
	projectType,
	timeContent,
	todosContent,
}: IProjectWorkShellProps) {
	const pathname = usePathname();
	const onTimesheet = pathname.includes('/timesheet');
	const onTodos = pathname.includes('/todos');

	if (projectType !== 'hourly') {
		return <div className='space-y-4'>{todosContent}</div>;
	}

	return (
		<div className='space-y-4'>
			<div className='flex gap-1 rounded-xl bg-muted p-1'>
				<Link
					href={ROUTES.projectTimesheet(projectId)}
					className={cn(
						'flex-1 rounded-lg px-3 py-2 text-center text-sm font-bold transition-colors',
						onTimesheet
							? 'bg-card text-primary shadow-[var(--shadow-soft)]'
							: 'text-muted-foreground hover:text-foreground',
					)}
					aria-current={onTimesheet ? 'page' : undefined}
				>
					زمان
				</Link>
				<Link
					href={ROUTES.projectTodos(projectId)}
					className={cn(
						'flex-1 rounded-lg px-3 py-2 text-center text-sm font-bold transition-colors',
						onTodos
							? 'bg-card text-primary shadow-[var(--shadow-soft)]'
							: 'text-muted-foreground hover:text-foreground',
					)}
					aria-current={onTodos ? 'page' : undefined}
				>
					کارها
				</Link>
			</div>

			{onTimesheet ? timeContent : todosContent}
		</div>
	);
}
