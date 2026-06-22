export interface IAdvancePaymentSlice {
	id: string;
	amount: number;
	applied_amount: number;
}

export interface IAdvanceAllocation {
	id: string;
	applyAmount: number;
	nextAppliedAmount: number;
}

export function getUnappliedAmount(payment: Pick<IAdvancePaymentSlice, 'amount' | 'applied_amount'>): number {
	return Math.max(Number(payment.amount) - Number(payment.applied_amount), 0);
}

export function computeAdvanceAllocations(
	payments: IAdvancePaymentSlice[],
	invoiceTotal: number,
): IAdvanceAllocation[] {
	let remaining = Math.max(invoiceTotal, 0);
	const allocations: IAdvanceAllocation[] = [];

	for (const payment of payments) {
		if (remaining <= 0) {
			break;
		}

		const unapplied = getUnappliedAmount(payment);

		if (unapplied <= 0) {
			continue;
		}

		const applyAmount = Math.min(unapplied, remaining);

		allocations.push({
			id: payment.id,
			applyAmount,
			nextAppliedAmount: Number(payment.applied_amount) + applyAmount,
		});

		remaining -= applyAmount;
	}

	return allocations;
}

export function sumUnappliedPayments(
	payments: Pick<IAdvancePaymentSlice, 'amount' | 'applied_amount'>[],
): number {
	return payments.reduce((sum, payment) => sum + getUnappliedAmount(payment), 0);
}
