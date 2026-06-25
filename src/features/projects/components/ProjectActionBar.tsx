import Link from 'next/link';
import { Clock, FilePlus2, FileText } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { ActionBar } from '@/components/ui/ActionBar';
import { ROUTES } from '@/config/routes';
import type { ProjectType } from '@/lib/supabase/database.types';

export type ProjectActionContext = 'overview' | 'work' | 'billing' | 'settings';

interface IProjectActionBarProps {
	projectId: string;
	projectType: ProjectType;
	context: ProjectActionContext;
}

export function ProjectActionBar({ projectId, projectType, context }: IProjectActionBarProps) {
	if (context === 'settings') {
		return null;
	}

	if (context === 'work' && projectType === 'hourly') {
		return (
			<ActionBar>
				<Link href={ROUTES.quickLog} className='w-full'>
					<Button fullWidth haptic='success'>
						<Clock size={18} />
						ثبت سریع
					</Button>
				</Link>
			</ActionBar>
		);
	}

	if (context === 'overview') {
		return (
			<ActionBar>
				<Link href={ROUTES.projectInvoiceNew(projectId)} className='min-w-0 flex-1'>
					<Button fullWidth haptic='medium'>
						<FilePlus2 size={18} />
						صدور فاکتور
					</Button>
				</Link>
				{projectType === 'hourly' && (
					<Link href={ROUTES.projectTimesheet(projectId)} className='shrink-0'>
						<Button variant='secondary' size='sm' haptic='light' className='px-3'>
							<Clock size={18} />
							<span className='sr-only'>ثبت ساعت</span>
						</Button>
					</Link>
				)}
				<Link href={ROUTES.projectInvoices(projectId)} className='shrink-0'>
					<Button variant='secondary' size='sm' haptic='light' className='px-3'>
						<FileText size={18} />
						<span className='sr-only'>فاکتورها</span>
					</Button>
				</Link>
			</ActionBar>
		);
	}

	if (context === 'billing') {
		return (
			<ActionBar>
				<Link href={ROUTES.projectInvoiceNew(projectId)} className='w-full'>
					<Button fullWidth haptic='medium'>
						<FilePlus2 size={18} />
						فاکتور جدید
					</Button>
				</Link>
			</ActionBar>
		);
	}

	return null;
}
