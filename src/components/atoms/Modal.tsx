'use client';

import type { ReactNode } from 'react';

import { X } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

interface IModalProps {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	className?: string;
}

export function Modal({ open, onClose, title, children, className }: IModalProps) {
	if (!open) {
		return null;
	}

	return (
		<div className='fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4'>
			<button
				type='button'
				className='absolute inset-0 bg-slate-900/50'
				onClick={onClose}
				aria-label='بستن'
			/>
			<div
				className={cn(
					'relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-card p-6 shadow-2xl sm:max-w-lg sm:rounded-2xl',
					className,
				)}
			>
				<div className='mb-4 flex items-center justify-between'>
					<h2 className='text-lg font-bold text-foreground'>{title}</h2>
					<button
						type='button'
						onClick={onClose}
						className='rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground'
					>
						<X size={18} />
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}
