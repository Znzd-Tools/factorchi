'use client';

import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils/cn';

export interface ISegmentedItem {
	label: string;
	href: string;
	icon?: LucideIcon;
	active: boolean;
}

interface ISegmentedControlProps {
	items: ISegmentedItem[];
	className?: string;
}

export function SegmentedControl({ items, className }: ISegmentedControlProps) {
	return (
		<nav
			className={cn(
				'no-print scrollbar-hide -mx-1 flex gap-1 overflow-x-auto rounded-2xl bg-muted p-1',
				className,
			)}
			aria-label='زیربخش پروژه'
		>
			{items.map(({ label, href, icon: Icon, active }) => (
				<Link
					key={href}
					href={href}
					onClick={() => triggerHaptic('selection')}
					className={cn(
						'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98]',
						active
							? 'bg-card text-primary shadow-[var(--shadow-soft)]'
							: 'text-muted-foreground hover:text-foreground',
					)}
					aria-current={active ? 'page' : undefined}
				>
					{Icon && <Icon size={16} aria-hidden />}
					{label}
				</Link>
			))}
		</nav>
	);
}
