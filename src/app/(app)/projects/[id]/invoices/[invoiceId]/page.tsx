import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ROUTES } from '@/config/routes';
import { getInvoiceDetail } from '@/features/invoice/actions/invoice.actions';
import { ProjectInvoicePreview } from '@/features/invoice/components/ProjectInvoicePreview';

interface IInvoiceDetailPageProps {
	params: Promise<{ id: string; invoiceId: string }>;
}

export default async function InvoiceDetailPage({ params }: IInvoiceDetailPageProps) {
	const { id, invoiceId } = await params;
	const invoice = await getInvoiceDetail(id, invoiceId);

	if (!invoice) {
		notFound();
	}

	return (
		<div className='space-y-4'>
			<div className='no-print'>
				<Link
					href={ROUTES.projectInvoices(id)}
					className='text-sm text-blue-600 hover:underline'
				>
					← بازگشت به فاکتورها
				</Link>
			</div>

			<ProjectInvoicePreview invoice={invoice} />
		</div>
	);
}
