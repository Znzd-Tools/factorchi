'use client';

import type { ReactNode } from 'react';

import { X } from 'lucide-react';

import { triggerHaptic } from '@/lib/haptics';
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
		<div className='fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4'>
			<button
				type='button'
				className='absolute inset-0 bg-foreground/40 backdrop-blur-sm'
				onClick={() => {
					triggerHaptic('light');
					onClose();
				}}
				aria-label='بستن'
			/>
			<div
				className={cn(
					'relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-card px-5 pb-[calc(1.5rem+var(--safe-bottom))] pt-3 shadow-[var(--shadow-elevated)] sm:max-w-lg sm:rounded-2xl sm:p-6 sm:pb-6',
					className,
				)}
				role='dialog'
				aria-modal='true'
				aria-labelledby='modal-title'
			>
				<div className='mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden' aria-hidden />
				<div className='mb-5 flex items-center justify-between gap-3'>
					<h2 id='modal-title' className='text-lg font-black text-foreground'>
						{title}
					</h2>
					<button
						type='button'
						onClick={() => {
							triggerHaptic('light');
							onClose();
						}}
						className='touch-target flex items-center justify-center rounded-xl text-muted-foreground transition-colors active:bg-muted'
						aria-label='بستن'
					>
						<X size={20} />
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}
