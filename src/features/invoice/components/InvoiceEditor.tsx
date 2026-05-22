'use client';

import type { InvoiceBuilderState } from '@/features/invoice/hooks/useInvoiceBuilder';
import { InvoiceForm } from '@/features/invoice/components/InvoiceForm';
import { InvoicePreview } from '@/features/invoice/components/InvoicePreview';

interface IInvoiceEditorProps {
	invoice: InvoiceBuilderState;
}

export function InvoiceEditor({ invoice }: IInvoiceEditorProps) {
	return (
		<div className='min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans print:bg-white'>
			<InvoiceForm invoice={invoice} />
			<InvoicePreview invoice={invoice} />
		</div>
	);
}
