import { notFound } from 'next/navigation';

import { Card } from '@/components/atoms/Card';
import { getProjectInvoices } from '@/features/invoice/actions/invoice.actions';
import { InvoiceList } from '@/features/invoice/components/InvoiceList';
import { createClient } from '@/lib/supabase/server';

interface IProjectInvoicesPageProps {
	params: Promise<{ id: string }>;
}

export default async function ProjectInvoicesPage({ params }: IProjectInvoicesPageProps) {
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
		.select('id, name, currency')
		.eq('id', id)
		.eq('user_id', user.id)
		.single();

	if (!project) {
		notFound();
	}

	const invoices = await getProjectInvoices(project.id);

	return (
		<div className='space-y-5'>
			<Card>
				<InvoiceList projectId={project.id} invoices={invoices} currency={project.currency} />
			</Card>
		</div>
	);
}
