import { createClient } from '@/lib/supabase/server';
import type { PaymentMethod, ProjectPayment } from '@/lib/supabase/database.types';

export type ProjectPaymentWithMethod = ProjectPayment & {
	payment_method: Pick<PaymentMethod, 'id' | 'label' | 'type'> | null;
};

export async function listProjectPayments(projectId: string): Promise<ProjectPaymentWithMethod[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('project_payments')
		.select('*, payment_method:payment_methods(id, label, type)')
		.eq('project_id', projectId)
		.order('paid_at', { ascending: false })
		.order('created_at', { ascending: false });

	if (error) {
		return [];
	}

	return (data ?? []) as ProjectPaymentWithMethod[];
}
