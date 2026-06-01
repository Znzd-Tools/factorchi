import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { FilePlus2 } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { ROUTES } from '@/config/routes';
import { ProjectTabs } from '@/features/projects/components/ProjectTabs';
import { requireUser } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

interface IProjectLayoutProps {
	children: React.ReactNode;
	params: Promise<{ id: string }>;
}

export default async function ProjectLayout({ children, params }: IProjectLayoutProps) {
	const { id } = await params;
	await requireUser();
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { data: project } = await supabase
		.from('projects')
		.select('*')
		.eq('id', id)
		.eq('user_id', user!.id)
		.single();

	if (!project) {
		notFound();
	}

	return (
		<div className='space-y-5 pb-24 md:pb-6'>
			<div className='no-print space-y-1'>
				<h1 className='text-xl font-black text-foreground sm:text-2xl'>{project.name}</h1>
				<p className='text-sm text-muted-foreground'>{project.client_name}</p>
			</div>

			<Suspense fallback={<div className='no-print h-12 animate-pulse rounded-2xl bg-muted' />}>
				<div className='no-print'>
					<ProjectTabs projectId={project.id} projectType={project.type} />
				</div>
			</Suspense>

			{children}

			<div className='no-print fixed inset-x-0 bottom-[calc(var(--safe-bottom)+0.75rem)] z-30 px-4 md:static md:z-auto md:px-0 md:pt-2'>
				<Link href={ROUTES.projectInvoiceNew(project.id)} className='mx-auto block max-w-lg md:max-w-none'>
					<Button className='w-full shadow-[var(--shadow-elevated)]' size='lg' haptic='medium'>
						<FilePlus2 size={18} />
						صدور فاکتور
					</Button>
				</Link>
			</div>
		</div>
	);
}
