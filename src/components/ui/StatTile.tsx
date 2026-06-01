import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

interface IStatTileProps {
	label: string;
	value: string;
	icon: LucideIcon;
	tone?: 'default' | 'primary' | 'success' | 'warning';
	className?: string;
}

const toneClasses = {
	default: 'from-slate-600 to-slate-800',
	primary: 'from-indigo-500 to-violet-700',
	success: 'from-emerald-500 to-teal-700',
	warning: 'from-amber-500 to-orange-600',
} as const;

export function StatTile({ label, value, icon: Icon, tone = 'default', className }: IStatTileProps) {
	return (
		<div
			className={cn(
				'relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-[var(--shadow-soft)]',
				toneClasses[tone],
				className,
			)}
		>
			<div className='flex items-center justify-between gap-2'>
				<span className='text-xs font-bold opacity-90'>{label}</span>
				<Icon size={18} className='opacity-90' aria-hidden />
			</div>
			<p className='mt-3 text-xl font-black tabular-nums sm:text-2xl' dir='ltr'>
				{value}
			</p>
		</div>
	);
}
