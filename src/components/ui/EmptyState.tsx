import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface IEmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	action?: ReactNode;
	className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: IEmptyStateProps) {
	return (
		<div
			className={cn(
				'flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center shadow-[var(--shadow-soft)]',
				className,
			)}
		>
			<div className='flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
				<Icon size={28} aria-hidden />
			</div>
			<h2 className='mt-4 text-lg font-bold text-foreground'>{title}</h2>
			<p className='mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground'>{description}</p>
			{action && <div className='mt-6 w-full max-w-xs'>{action}</div>}
		</div>
	);
}
