import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface IPageHeaderProps {
	title: string;
	description?: string;
	action?: ReactNode;
	className?: string;
}

export function PageHeader({ title, description, action, className }: IPageHeaderProps) {
	return (
		<header className={cn('flex items-start justify-between gap-4', className)}>
			<div className='min-w-0 flex-1'>
				<h1 className='text-2xl font-black tracking-tight text-foreground sm:text-3xl'>{title}</h1>
				{description && (
					<p className='mt-1.5 text-sm leading-relaxed text-muted-foreground'>{description}</p>
				)}
			</div>
			{action && <div className='shrink-0'>{action}</div>}
		</header>
	);
}
