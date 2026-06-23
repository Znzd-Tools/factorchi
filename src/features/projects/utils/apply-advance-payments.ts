import type { ProjectPayment } from '@/lib/supabase/database.types';

export interface IAdvancePaymentSlice {
	id: string;
	amount: number;
	applied_amount: number;
	paid_at?: string;
}

export interface IAdvancePaymentAllocationUpdate {
	id: string;
	applied_amount: number;
}

export interface IPrepaidSettlementPayment {
	id: string;
	amount: number;
	paid_at: string;
}

export interface IPrepaidSettlementInvoice {
	status: string;
	total: number;
	issue_date: string;
}

export interface IPrepaidSettlement {
	prepaidTotal: number;
	prepaidApplied: number;
	prepaidUnapplied: number;
	appliedByPaymentId: Map<string, number>;
}

export function isPrepaidEligibleForInvoice(
	paymentPaidAt: string,
	invoiceIssueDate: string,
): boolean {
	return paymentPaidAt <= invoiceIssueDate;
}

export function getUnappliedPaymentAmount(
	payment: Pick<ProjectPayment, 'amount' | 'applied_amount'>,
): number {
	return Math.max(Number(payment.amount) - Number(payment.applied_amount ?? 0), 0);
}

export function computePrepaidSettlement(
	payments: IPrepaidSettlementPayment[],
	invoices: IPrepaidSettlementInvoice[],
): IPrepaidSettlement {
	const buckets = [...payments]
		.sort((left, right) => left.paid_at.localeCompare(right.paid_at) || left.id.localeCompare(right.id))
		.map((payment) => ({
			id: payment.id,
			amount: Number(payment.amount),
			paid_at: payment.paid_at,
			applied: 0,
			remaining: Number(payment.amount),
		}));

	const paidInvoices = invoices
		.filter((invoice) => invoice.status === 'paid')
		.sort((left, right) => left.issue_date.localeCompare(right.issue_date));

	for (const invoice of paidInvoices) {
		let invoiceRemaining = Number(invoice.total);

		for (const bucket of buckets) {
			if (invoiceRemaining <= 0) {
				break;
			}

			if (!isPrepaidEligibleForInvoice(bucket.paid_at, invoice.issue_date)) {
				continue;
			}

			const appliedNow = Math.min(bucket.remaining, invoiceRemaining);

			bucket.remaining -= appliedNow;
			bucket.applied += appliedNow;
			invoiceRemaining -= appliedNow;
		}
	}

	const prepaidTotal = buckets.reduce((sum, bucket) => sum + bucket.amount, 0);
	const prepaidApplied = buckets.reduce((sum, bucket) => sum + bucket.applied, 0);
	const appliedByPaymentId = new Map(buckets.map((bucket) => [bucket.id, bucket.applied]));

	return {
		prepaidTotal,
		prepaidApplied,
		prepaidUnapplied: prepaidTotal - prepaidApplied,
		appliedByPaymentId,
	};
}

export function allocateAdvancePayments(
	payments: IAdvancePaymentSlice[],
	invoiceTotal: number,
	invoiceIssueDate?: string,
): IAdvancePaymentAllocationUpdate[] {
	if (invoiceTotal <= 0) {
		return [];
	}

	const eligiblePayments = invoiceIssueDate
		? payments.filter(
				(payment) =>
					payment.paid_at != null &&
					isPrepaidEligibleForInvoice(payment.paid_at, invoiceIssueDate),
			)
		: payments;

	let remaining = invoiceTotal;
	const updates: IAdvancePaymentAllocationUpdate[] = [];

	for (const payment of eligiblePayments) {
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
