'use client';

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { ChevronLeft } from 'lucide-react';

import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils/cn';

interface IListRowProps {
	icon?: LucideIcon;
	title: string;
	subtitle?: string;
	trailing?: ReactNode;
	onClick?: () => void;
	href?: string;
	className?: string;
	children?: ReactNode;
}

export function ListRow({
	icon: Icon,
	title,
	subtitle,
	trailing,
	onClick,
	className,
	children,
}: IListRowProps) {
	const content = (
		<>
			{Icon && (
				<div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
					<Icon size={18} aria-hidden />
				</div>
			)}
			<div className='min-w-0 flex-1 text-start'>
				<p className='font-bold text-foreground'>{title}</p>
				{subtitle && <p className='mt-0.5 text-sm text-muted-foreground'>{subtitle}</p>}
			</div>
			{trailing ?? (onClick && <ChevronLeft size={18} className='shrink-0 text-muted-foreground' />)}
		</>
	);

	if (onClick) {
		return (
			<button
				type='button'
				onClick={() => {
					triggerHaptic('light');
					onClick();
				}}
				className={cn(
					'flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-start transition-colors active:bg-muted',
					className,
				)}
			>
				{content}
				{children}
			</button>
		);
	}

	return (
		<div className={cn('flex items-center gap-3 px-4 py-3.5', className)}>
			{content}
			{children}
		</div>
	);
}

export function ListGroup({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div
			className={cn(
				'overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] divide-y divide-border',
				className,
			)}
		>
			{children}
		</div>
	);
}
