import type { InvoiceStatus } from '@/lib/supabase/database.types';

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
	draft: 'پیش‌نویس',
	sent: 'ارسال‌شده',
	paid: 'پرداخت‌شده',
	canceled: 'لغو‌شده',
	overdue: 'سررسید گذشته',
};

export const INVOICE_STATUS_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
	draft: ['sent', 'canceled'],
	sent: ['paid', 'overdue', 'canceled'],
	overdue: ['paid', 'canceled'],
	paid: [],
	canceled: [],
};

export const ACTIVE_INVOICE_STATUSES: InvoiceStatus[] = ['draft', 'sent', 'overdue'];

export function canTransitionInvoiceStatus(from: InvoiceStatus, to: InvoiceStatus): boolean {
	return INVOICE_STATUS_TRANSITIONS[from].includes(to);
}
