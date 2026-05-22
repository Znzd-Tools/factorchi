'use client';

import { InvoiceEditor } from '@/features/invoice/components/InvoiceEditor';
import { ProfessionStep } from '@/features/invoice/components/ProfessionStep';
import { useInvoiceBuilder } from '@/features/invoice/hooks/useInvoiceBuilder';

export function InvoiceApp() {
	const invoice = useInvoiceBuilder();

	if (invoice.step === 1) {
		return <ProfessionStep onSelectFreelancer={invoice.selectFreelancerProfession} />;
	}

	return <InvoiceEditor invoice={invoice} />;
}
