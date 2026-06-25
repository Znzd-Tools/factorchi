import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface IActionBarProps {
	children: ReactNode;
	className?: string;
	sticky?: boolean;
}

export function ActionBar({ children, className, sticky = true }: IActionBarProps) {
	return (
		<div
			className={cn(
				'no-print',
				sticky &&
					'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-xl',
				className,
			)}
		>
			<div
				className={cn(
					'mx-auto flex max-w-lg items-center gap-2 px-4 py-3',
					sticky && 'pb-[calc(var(--safe-bottom)+0.75rem)]',
				)}
			>
				{children}
			</div>
		</div>
	);
}
