import { type InputHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils/cn';

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

export const Input = forwardRef<HTMLInputElement, IInputProps>(
	({ className, label, error, id, ...props }, ref) => {
		const inputId = id ?? label;

		return (
			<div className='space-y-1.5'>
				{label && (
					<label htmlFor={inputId} className='block text-sm font-bold text-muted-foreground'>
						{label}
					</label>
				)}
				<input
					ref={ref}
					id={inputId}
					className={cn(
						'min-h-12 w-full rounded-xl border border-border bg-input px-4 py-3 tabular-nums outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/30',
						error && 'border-destructive focus:ring-destructive/30',
						className,
					)}
					{...props}
				/>
				{error && <p className='text-xs font-medium text-destructive'>{error}</p>}
			</div>
		);
	},
);

Input.displayName = 'Input';
