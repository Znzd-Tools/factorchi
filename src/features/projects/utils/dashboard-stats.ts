import { getUnappliedPaymentAmount } from '@/features/projects/utils/apply-advance-payments';
import type { Invoice, Project, ProjectPayment, TimeEntry } from '@/lib/supabase/database.types';

export interface ProjectDashboardStats {
	totalContract: number;
	paid: number;
	pending: number;
	remaining: number;
	/** Invoiced minus received. Negative = advance/credit from client. */
	balance: number;
}

type InvoiceSlice = Pick<Invoice, 'status' | 'total'>;
type TimeEntrySlice = Pick<TimeEntry, 'hours' | 'rate_at_entry'>;
type ProjectSlice = Pick<Project, 'type' | 'total_amount'>;
type PaymentSlice = Pick<ProjectPayment, 'amount' | 'applied_amount'>;

const PENDING_STATUSES = new Set(['draft', 'sent', 'overdue']);

export function computeDashboardStats(
	project: ProjectSlice,
	invoices: InvoiceSlice[],
	timeEntries: TimeEntrySlice[] = [],
	payments: PaymentSlice[] = [],
): ProjectDashboardStats {
	const activeInvoices = invoices.filter((invoice) => invoice.status !== 'canceled');

	const invoicePaid = activeInvoices
		.filter((invoice) => invoice.status === 'paid')
		.reduce((sum, invoice) => sum + Number(invoice.total), 0);

	const directPaid = payments.reduce(
		(sum, payment) => sum + getUnappliedPaymentAmount(payment),
		0,
	);
	const paid = invoicePaid + directPaid;

	const pending = activeInvoices
		.filter((invoice) => PENDING_STATUSES.has(invoice.status))
		.reduce((sum, invoice) => sum + Number(invoice.total), 0);

	const invoicedTotal = activeInvoices.reduce(
		(sum, invoice) => sum + Number(invoice.total),
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
	const balance = invoicedTotal - paid;

	return { totalContract, paid, pending, remaining, balance };
}

export function getBalanceDescription(balance: number): string {
	if (balance < 0) {
		return 'پیش‌پرداخت — بیش از فاکتور شده';
	}

	if (balance > 0) {
		return 'کارفرما بدهکار است';
	}

	return 'فاکتور و پرداخت برابر است';
}
