import { type SelectHTMLAttributes, forwardRef } from 'react';

import { cn } from '@/lib/utils/cn';

interface ISelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	error?: string;
}

export const Select = forwardRef<HTMLSelectElement, ISelectProps>(
	({ className, label, error, id, children, ...props }, ref) => {
		const selectId = id ?? label;

		return (
			<div className='space-y-1.5'>
				{label && (
					<label htmlFor={selectId} className='block text-sm font-bold text-muted-foreground'>
						{label}
					</label>
				)}
				<select
					ref={ref}
					id={selectId}
					className={cn(
						'min-h-12 w-full rounded-xl border border-border bg-input px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/30',
						error && 'border-destructive focus:ring-destructive/30',
						className,
					)}
					{...props}
				>
					{children}
				</select>
				{error && <p className='text-xs font-medium text-destructive'>{error}</p>}
			</div>
		);
	},
);

Select.displayName = 'Select';
