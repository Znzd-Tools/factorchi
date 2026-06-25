'use client';

import type { LucideIcon } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils/cn';

interface IFloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	icon: LucideIcon;
	label: string;
}

export function FloatingActionButton({
	icon: Icon,
	label,
	className,
	onClick,
	...props
}: IFloatingActionButtonProps) {
	return (
		<button
			type='button'
			{...props}
			onClick={(event) => {
				triggerHaptic('medium');
				onClick?.(event);
			}}
			className={cn(
				'fixed bottom-[calc(var(--safe-bottom)+5.75rem)] start-4 z-30 flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-elevated)] transition-transform active:scale-95 md:bottom-6',
				className,
			)}
			aria-label={label}
		>
			<Icon size={20} aria-hidden />
			<span>{label}</span>
		</button>
	);
}
