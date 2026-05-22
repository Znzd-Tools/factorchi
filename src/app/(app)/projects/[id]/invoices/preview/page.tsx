import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ROUTES } from '@/config/routes';
import { InvoiceApp } from '@/features/invoice/components/InvoiceApp';
import { createClient } from '@/lib/supabase/server';

interface IInvoicePreviewPageProps {
	params: Promise<{ id: string }>;
}

export default async function InvoicePreviewPage({ params }: IInvoicePreviewPageProps) {
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
		.select('id, name')
		.eq('id', id)
		.eq('user_id', user.id)
		.single();

	if (!project) {
		notFound();
	}

	return (
		<div className='-mx-4 -my-8'>
			<div className='no-print border-b border-slate-200 bg-white px-4 py-3'>
				<Link href={ROUTES.projectInvoices(project.id)} className='text-sm text-blue-600 hover:underline'>
					← بازگشت به فاکتورها
				</Link>
				<p className='mt-1 text-xs text-slate-500'>
					نسخه دمو بدون دیتابیس — {project.name}
				</p>
			</div>
			<InvoiceApp />
		</div>
	);
}
