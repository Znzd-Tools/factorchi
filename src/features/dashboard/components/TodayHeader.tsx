import Link from 'next/link';
import { FilePlus2, Timer } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { ROUTES } from '@/config/routes';

interface ITodayHeaderProps {
	greeting: string;
	displayName: string;
	monthLabel: string;
	insight: string;
	invoiceCandidateProjectId: string | null;
}

export function TodayHeader({
	greeting,
	displayName,
	monthLabel,
	insight,
	invoiceCandidateProjectId,
}: ITodayHeaderProps) {
	return (
		<header className='space-y-4'>
			<div>
				<p className='text-sm text-muted-foreground'>{monthLabel}</p>
				<h1 className='mt-1 text-2xl font-black text-foreground sm:text-3xl'>
					{greeting}، {displayName}
				</h1>
				<p className='mt-2 text-sm leading-relaxed text-muted-foreground'>{insight}</p>
			</div>

			<div className='flex flex-wrap gap-2'>
				<Link href={ROUTES.quickLog}>
					<Button haptic='success'>
						<Timer size={16} />
						ثبت سریع
					</Button>
				</Link>
				{invoiceCandidateProjectId && (
					<Link href={ROUTES.projectInvoiceNew(invoiceCandidateProjectId)}>
						<Button variant='secondary' haptic='medium'>
							<FilePlus2 size={16} />
							فاکتور جدید
						</Button>
					</Link>
				)}
			</div>
		</header>
	);
}
