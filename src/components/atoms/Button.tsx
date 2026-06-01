'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';

import { type HapticPattern, triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	haptic?: HapticPattern | false;
}

const variantClasses: Record<ButtonVariant, string> = {
	primary:
		'bg-primary text-primary-foreground shadow-[var(--shadow-soft)] hover:opacity-95 active:opacity-90',
	secondary: 'bg-muted text-foreground border border-border hover:bg-border/60',
	ghost: 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
	danger: 'bg-destructive text-white hover:opacity-95',
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: 'min-h-9 px-3 py-2 text-sm rounded-xl',
	md: 'min-h-11 px-4 py-2.5 text-sm rounded-xl',
	lg: 'min-h-12 px-5 py-3 text-base rounded-2xl',
};

export const Button = forwardRef<HTMLButtonElement, IButtonProps>(
	(
		{ className, variant = 'primary', size = 'md', type = 'button', haptic = 'light', onClick, ...props },
		ref,
	) => (
		<button
			ref={ref}
			type={type}
			className={cn(
				'inline-flex touch-target items-center justify-center gap-2 font-bold transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
				variantClasses[variant],
				sizeClasses[size],
				className,
			)}
			onClick={(event) => {
				if (haptic !== false) {
					triggerHaptic(haptic);
				}

				onClick?.(event);
			}}
			{...props}
		/>
	),
);

Button.displayName = 'Button';
