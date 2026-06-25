import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface ISurfaceProps {
	children: ReactNode;
	className?: string;
	title?: string;
	description?: string;
	padding?: 'none' | 'sm' | 'md';
}

export function Surface({
	children,
	className,
	title,
	description,
	padding = 'md',
}: ISurfaceProps) {
	return (
		<section
			className={cn(
				'rounded-xl border border-border bg-card',
				padding === 'sm' && 'p-3 sm:p-4',
				padding === 'md' && 'p-4 sm:p-5',
				className,
			)}
		>
			{(title || description) && (
				<header className='mb-4'>
					{title && <h2 className='text-base font-bold text-foreground'>{title}</h2>}
					{description && (
						<p className='mt-1 text-sm text-muted-foreground'>{description}</p>
					)}
				</header>
			)}
			{children}
		</section>
	);
}
