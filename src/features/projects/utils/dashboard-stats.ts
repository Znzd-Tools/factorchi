import { getUnappliedPaymentAmount } from '@/features/projects/utils/apply-advance-payments';
import type { Invoice, Project, ProjectPayment, TimeEntry } from '@/lib/supabase/database.types';

export interface ProjectDashboardStats {
	totalContract: number;
	paid: number;
	pending: number;
	remaining: number;
	prepaid: number;
	prepaidUnapplied: number;
	/** Work value minus paid invoices, with prepaid credit applied. */
	balance: number;
}

type InvoiceSlice = Pick<Invoice, 'status' | 'total'>;
type TimeEntrySlice = Pick<TimeEntry, 'hours' | 'rate_at_entry'>;
type ProjectSlice = Pick<Project, 'type' | 'total_amount'>;
type PaymentSlice = Pick<ProjectPayment, 'amount' | 'applied_amount'>;

const PENDING_STATUSES = new Set(['draft', 'sent', 'overdue']);

export function computePrepaidCredit(prepaidTotal: number, invoicePaid: number): number {
	if (invoicePaid <= 0 || prepaidTotal <= 0) {
		return 0;
	}

	return Math.min(prepaidTotal, invoicePaid);
}

export function computeDashboardStats(
	project: ProjectSlice,
	invoices: InvoiceSlice[],
	timeEntries: TimeEntrySlice[] = [],
	payments: PaymentSlice[] = [],
): ProjectDashboardStats {
	const activeInvoices = invoices.filter((invoice) => invoice.status !== 'canceled');

	const paid = activeInvoices
		.filter((invoice) => invoice.status === 'paid')
		.reduce((sum, invoice) => sum + Number(invoice.total), 0);

	const pending = activeInvoices
		.filter((invoice) => PENDING_STATUSES.has(invoice.status))
		.reduce((sum, invoice) => sum + Number(invoice.total), 0);

	const invoicedTotal = activeInvoices.reduce(
		(sum, invoice) => sum + Number(invoice.total),
		0,
	);

	const prepaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
	const prepaidUnapplied = payments.reduce(
		(sum, payment) => sum + getUnappliedPaymentAmount(payment),
		0,
	);

	const totalContract =
		project.type === 'total'
			? Number(project.total_amount ?? 0)
			: timeEntries.reduce(
					(sum, entry) => sum + Number(entry.hours) * Number(entry.rate_at_entry),
					0,
				);

	const remaining = Math.max(totalContract - invoicedTotal, 0);
	const prepaidCredit = computePrepaidCredit(prepaid, paid);
	const balance = totalContract - paid + prepaidCredit;

	return { totalContract, paid, pending, remaining, prepaid, prepaidUnapplied, balance };
}

export function getBalanceDescription(balance: number): string {
	if (balance <= 0) {
		return 'کل ارزش کار تسویه شده';
	}

	return 'ارزش کار منهای فاکتور پرداخت‌شده (با احتساب پیش‌پرداخت)';
}
