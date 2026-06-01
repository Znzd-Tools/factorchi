import { notFound, redirect } from 'next/navigation';

import { ROUTES } from '@/config/routes';
import { createClient } from '@/lib/supabase/server';

interface IInvoicePreviewPageProps {
	params: Promise<{ id: string }>;
}

/** Legacy URL — redirect to production invoice list. */
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
		.select('id')
		.eq('id', id)
		.eq('user_id', user.id)
		.single();

	if (!project) {
		notFound();
	}

	redirect(ROUTES.projectInvoices(project.id));
}
