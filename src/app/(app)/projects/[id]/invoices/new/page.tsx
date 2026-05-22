import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Card } from '@/components/atoms/Card';
import { ROUTES } from '@/config/routes';
import {
	getUserPaymentMethods,
} from '@/features/invoice/actions/invoice.actions';
import { InvoiceGeneratorForm } from '@/features/invoice/components/InvoiceGeneratorForm';
import { createClient } from '@/lib/supabase/server';

interface INewInvoicePageProps {
	params: Promise<{ id: string }>;
}

export default async function NewInvoicePage({ params }: INewInvoicePageProps) {
	const { id } = await params;
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		notFound();
	}

	const { data: project } = await supabase
		.from('projects')
		.select('*')
		.eq('id', id)
		.eq('user_id', user.id)
		.single();

	if (!project) {
		notFound();
	}

	const paymentMethods = await getUserPaymentMethods();

	let timeEntries: { hours: number; rate_at_entry: number; work_date: string }[] = [];

	if (project.type === 'hourly') {
		const { data } = await supabase
			.from('time_entries')
			.select('hours, rate_at_entry, work_date')
			.eq('project_id', project.id)
			.order('work_date', { ascending: true });

		timeEntries = data ?? [];
	}

	return (
		<div className='space-y-6'>
			<div>
				<Link
					href={ROUTES.projectInvoices(project.id)}
					className='text-sm text-blue-600 hover:underline'
				>
					← بازگشت به فاکتورها
				</Link>
				<h1 className='mt-2 text-2xl font-black text-slate-900'>
					صدور فاکتور جدید — {project.name}
				</h1>
				<p className='mt-1 text-sm text-slate-500'>
					{project.type === 'hourly'
						? 'بر اساس ساعات ثبت‌شده در بازه زمانی'
						: 'بر اساس درصد از مبلغ کل پروژه'}
				</p>
			</div>

			<Card title='اطلاعات فاکتور'>
				<InvoiceGeneratorForm
					project={project}
					paymentMethods={paymentMethods}
					timeEntries={timeEntries}
				/>
			</Card>
		</div>
	);
}
