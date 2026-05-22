import { type ButtonHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
	primary: 'bg-blue-600 text-white hover:bg-blue-500',
	secondary:
		'bg-muted text-foreground hover:bg-slate-200 dark:hover:bg-slate-700 border border-border',
	ghost: 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
	danger: 'bg-red-600 text-white hover:bg-red-500',
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: 'px-3 py-1.5 text-sm',
	md: 'px-4 py-2 text-sm',
	lg: 'px-5 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, IButtonProps>(
	({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
		<button
			ref={ref}
			type={type}
			className={cn(
				'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
				variantClasses[variant],
				sizeClasses[size],
				className,
			)}
			{...props}
		/>
	),
);

Button.displayName = 'Button';
