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
			<div className='space-y-1'>
				{label && (
					<label htmlFor={selectId} className='block text-sm text-muted-foreground'>
						{label}
					</label>
				)}
				<select
					ref={ref}
					id={selectId}
					className={cn(
						'w-full rounded-lg border border-border bg-input p-2.5 outline-none transition-all focus:ring-2 focus:ring-blue-500',
						error && 'border-red-400 focus:ring-red-400',
						className,
					)}
					{...props}
				>
					{children}
				</select>
				{error && <p className='text-xs text-red-500'>{error}</p>}
			</div>
		);
	},
);

Select.displayName = 'Select';
