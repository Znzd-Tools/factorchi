import {
	computePrepaidSettlement,
	type IPrepaidSettlementInvoice,
} from '@/features/projects/utils/apply-advance-payments';
import type { Invoice, Project, ProjectPayment, TimeEntry } from '@/lib/supabase/database.types';

export interface ProjectDashboardStats {
	totalContract: number;
	paid: number;
	pending: number;
	remaining: number;
	prepaid: number;
	prepaidUnapplied: number;
	/** Remaining prepaid credit after eligible paid invoices. */
	balance: number;
}

type InvoiceSlice = Pick<Invoice, 'status' | 'total'> & { issue_date?: string };
type TimeEntrySlice = Pick<TimeEntry, 'hours' | 'rate_at_entry'>;
type ProjectSlice = Pick<Project, 'type' | 'total_amount'>;
type PaymentSlice = Pick<ProjectPayment, 'id' | 'amount' | 'paid_at'>;

const PENDING_STATUSES = new Set(['draft', 'sent', 'overdue']);

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

	const settlement = computePrepaidSettlement(
		payments.map((payment) => ({
			id: payment.id,
			amount: Number(payment.amount),
			paid_at: payment.paid_at,
		})),
		activeInvoices.map(
			(invoice): IPrepaidSettlementInvoice => ({
				status: invoice.status,
				total: Number(invoice.total),
				issue_date: invoice.issue_date ?? '',
			}),
		),
	);

	const totalContract =
		project.type === 'total'
			? Number(project.total_amount ?? 0)
			: timeEntries.reduce(
					(sum, entry) => sum + Number(entry.hours) * Number(entry.rate_at_entry),
					0,
				);

	const remaining = Math.max(totalContract - invoicedTotal, 0);
	const balance = settlement.prepaidUnapplied;

	return {
		totalContract,
		paid,
		pending,
		remaining,
		prepaid: settlement.prepaidTotal,
		prepaidUnapplied: settlement.prepaidUnapplied,
		balance,
	};
}

export function getBalanceDescription(balance: number): string {
	if (balance <= 0) {
		return 'پیش‌پرداخت کاملاً تسویه شده';
	}

	return 'پیش‌پرداخت باقی‌مانده پس از کسر فاکتورهای واجد شرایط';
}
