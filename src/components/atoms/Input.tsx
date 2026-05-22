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
			<div className='space-y-1'>
				{label && (
					<label htmlFor={inputId} className='block text-sm text-muted-foreground'>
						{label}
					</label>
				)}
				<input
					ref={ref}
					id={inputId}
					className={cn(
						'w-full rounded-lg border border-border bg-input p-2.5 tabular-nums outline-none transition-all focus:ring-2 focus:ring-blue-500',
						error && 'border-red-400 focus:ring-red-400',
						className,
					)}
					{...props}
				/>
				{error && <p className='text-xs text-red-500'>{error}</p>}
			</div>
		);
	},
);

Input.displayName = 'Input';
