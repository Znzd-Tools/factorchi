import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface ICardProps {
	children: ReactNode;
	className?: string;
	title?: string;
	description?: string;
}

export function Card({ children, className, title, description }: ICardProps) {
	return (
		<div
			className={cn(
				'rounded-2xl border border-border bg-card p-6 shadow-sm text-card-foreground',
				className,
			)}
		>
			{(title || description) && (
				<div className='mb-4'>
					{title && <h3 className='text-lg font-bold'>{title}</h3>}
					{description && <p className='mt-1 text-sm text-muted-foreground'>{description}</p>}
				</div>
			)}
			{children}
		</div>
	);
}
