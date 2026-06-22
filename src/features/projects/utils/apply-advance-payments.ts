import type { ProjectPayment } from '@/lib/supabase/database.types';

export interface IAdvancePaymentSlice {
	id: string;
	amount: number;
	applied_amount: number;
}

export interface IAdvancePaymentAllocationUpdate {
	id: string;
	applied_amount: number;
}

export function getUnappliedPaymentAmount(
	payment: Pick<ProjectPayment, 'amount' | 'applied_amount'>,
): number {
	return Math.max(Number(payment.amount) - Number(payment.applied_amount ?? 0), 0);
}

export function allocateAdvancePayments(
	payments: IAdvancePaymentSlice[],
	invoiceTotal: number,
): IAdvancePaymentAllocationUpdate[] {
	if (invoiceTotal <= 0) {
		return [];
	}

	let remaining = invoiceTotal;
	const updates: IAdvancePaymentAllocationUpdate[] = [];

	for (const payment of payments) {
		if (remaining <= 0) {
			break;
		}

		const available = getUnappliedPaymentAmount(payment);

		if (available <= 0) {
			continue;
		}

		const appliedNow = Math.min(available, remaining);

		updates.push({
			id: payment.id,
			applied_amount: Number(payment.applied_amount) + appliedNow,
		});
		remaining -= appliedNow;
	}

	return updates;
}
