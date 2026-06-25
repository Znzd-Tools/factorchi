import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface IMasterDetailProps {
	master: ReactNode;
	detail: ReactNode;
	className?: string;
}

export function MasterDetail({ master, detail, className }: IMasterDetailProps) {
	return (
		<div className={cn('flex flex-col gap-4 lg:flex-row-reverse lg:items-start lg:gap-6', className)}>
			<aside className='w-full shrink-0 lg:w-80 xl:w-96'>{master}</aside>
			<div className='min-w-0 flex-1'>{detail}</div>
		</div>
	);
}
