import { notFound } from 'next/navigation';

import { InvoiceDetailPanel } from '@/features/invoice/components/InvoiceDetailPanel';
import { ProjectInvoicePreview } from '@/features/invoice/components/ProjectInvoicePreview';
import { getInvoiceDetail } from '@/features/invoice/actions/invoice.actions';

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
		<div className='space-y-5'>
			<InvoiceDetailPanel
				projectId={id}
				invoiceId={invoice.id}
				invoiceNo={invoice.invoice_no}
				issueDate={invoice.issue_date}
				total={Number(invoice.total)}
				currency={invoice.project.currency}
				status={invoice.status}
			/>

			<ProjectInvoicePreview invoice={invoice} />
		</div>
	);
}
