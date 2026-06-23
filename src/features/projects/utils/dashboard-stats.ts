import type { Invoice, Project, TimeEntry } from '@/lib/supabase/database.types';

export interface ProjectDashboardStats {
	totalContract: number;
	paid: number;
	pending: number;
	remaining: number;
	/** Work value minus paid invoices. */
	balance: number;
}

type InvoiceSlice = Pick<Invoice, 'status' | 'total'>;
type TimeEntrySlice = Pick<TimeEntry, 'hours' | 'rate_at_entry'>;
type ProjectSlice = Pick<Project, 'type' | 'total_amount'>;

const PENDING_STATUSES = new Set(['draft', 'sent', 'overdue']);

export function computeDashboardStats(
	project: ProjectSlice,
	invoices: InvoiceSlice[],
	timeEntries: TimeEntrySlice[] = [],
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

	const totalContract =
		project.type === 'total'
			? Number(project.total_amount ?? 0)
			: timeEntries.reduce(
					(sum, entry) => sum + Number(entry.hours) * Number(entry.rate_at_entry),
					0,
				);

	const remaining = Math.max(totalContract - invoicedTotal, 0);
	const balance = totalContract - paid;

	return { totalContract, paid, pending, remaining, balance };
}

export function getBalanceDescription(balance: number): string {
	if (balance <= 0) {
		return 'کل ارزش کار تسویه شده';
	}

	return 'ارزش کار منهای فاکتورهای پرداخت‌شده';
}
