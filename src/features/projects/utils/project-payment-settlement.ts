import type { ProjectPayment } from '@/lib/supabase/database.types';

type PaymentAllocationSlice = Pick<ProjectPayment, 'id' | 'amount' | 'applied_amount'>;

export function getUnappliedAmount(payment: Pick<ProjectPayment, 'amount' | 'applied_amount'>): number {
	return Math.max(Number(payment.amount) - Number(payment.applied_amount), 0);
}

export function isFullyApplied(payment: Pick<ProjectPayment, 'amount' | 'applied_amount'>): boolean {
	return getUnappliedAmount(payment) === 0;
}

export interface IAdvanceAllocationUpdate {
	id: string;
	applied_amount: number;
}

export function allocateAdvancePayments(
	payments: PaymentAllocationSlice[],
	amountToCover: number,
): IAdvanceAllocationUpdate[] {
	let remaining = Math.max(amountToCover, 0);
	const updates: IAdvanceAllocationUpdate[] = [];

	for (const payment of payments) {
		if (remaining <= 0) {
			break;
		}

		const unapplied = getUnappliedAmount(payment);

		if (unapplied <= 0) {
			continue;
		}

		const appliedNow = Math.min(unapplied, remaining);
		updates.push({
			id: payment.id,
			applied_amount: Number(payment.applied_amount) + appliedNow,
		});
		remaining -= appliedNow;
	}

	return updates;
}

export function sumUnappliedPayments(
	payments: Pick<ProjectPayment, 'amount' | 'applied_amount'>[],
): number {
	return payments.reduce((sum, payment) => sum + getUnappliedAmount(payment), 0);
}
