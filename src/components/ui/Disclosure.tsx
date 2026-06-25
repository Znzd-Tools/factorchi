'use client';

import { ChevronDown } from 'lucide-react';
import { type ReactNode, useState } from 'react';

import { cn } from '@/lib/utils/cn';

interface IDisclosureProps {
	id?: string;
	title: string;
	description?: string;
	children: ReactNode;
	defaultOpen?: boolean;
	className?: string;
}

export function Disclosure({
	id,
	title,
	description,
	children,
	defaultOpen = false,
	className,
}: IDisclosureProps) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<div id={id} className={cn('rounded-xl border border-border bg-card', className)}>
			<button
				type='button'
				onClick={() => setOpen((prev) => !prev)}
				className='flex w-full items-center justify-between gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/50'
				aria-expanded={open}
			>
				<div className='min-w-0 flex-1'>
					<p className='text-sm font-bold text-foreground'>{title}</p>
					{description && (
						<p className='mt-0.5 text-xs text-muted-foreground'>{description}</p>
					)}
				</div>
				<ChevronDown
					size={18}
					className={cn(
						'shrink-0 text-muted-foreground transition-transform',
						open && 'rotate-180',
					)}
					aria-hidden
				/>
			</button>
			{open && <div className='border-t border-border px-4 py-4'>{children}</div>}
		</div>
	);
}
