import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface ICardProps {
	children: ReactNode;
	className?: string;
	title?: string;
	description?: string;
	variant?: 'default' | 'flat';
}

export function Card({ children, className, title, description, variant = 'default' }: ICardProps) {
	return (
		<div
			className={cn(
				'rounded-2xl border border-border bg-card text-card-foreground',
				variant === 'default' && 'p-5 shadow-[var(--shadow-soft)] sm:p-6',
				variant === 'flat' && 'p-0 shadow-none',
				className,
			)}
		>
			{(title || description) && (
				<div className='mb-4'>
					{title && <h3 className='text-base font-bold sm:text-lg'>{title}</h3>}
					{description && (
						<p className='mt-1 text-sm leading-relaxed text-muted-foreground'>{description}</p>
					)}
				</div>
			)}
			{children}
		</div>
	);
}
