import { allocateAdvancePayments, getUnappliedPaymentAmount } from '@/features/projects/utils/apply-advance-payments';
import { createClient } from '@/lib/supabase/server';

export async function applyAdvancePaymentsToInvoice(
	projectId: string,
	invoiceTotal: number,
): Promise<{ error?: string }> {
	if (invoiceTotal <= 0) {
		return {};
	}

	const supabase = await createClient();

	const { data: payments, error: fetchError } = await supabase
		.from('project_payments')
		.select('id, amount, applied_amount')
		.eq('project_id', projectId)
		.order('paid_at', { ascending: true })
		.order('created_at', { ascending: true });

	if (fetchError) {
		return { error: fetchError.message };
	}

	const unappliedPayments = (payments ?? []).filter(
		(payment) => getUnappliedPaymentAmount(payment) > 0,
	);

	const updates = allocateAdvancePayments(unappliedPayments, invoiceTotal);

	for (const update of updates) {
		const { error } = await supabase
			.from('project_payments')
			.update({ applied_amount: update.applied_amount })
			.eq('id', update.id)
			.eq('project_id', projectId);

		if (error) {
			return { error: error.message };
		}
	}

	return {};
}
