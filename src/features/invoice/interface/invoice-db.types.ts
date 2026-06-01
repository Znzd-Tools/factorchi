import type { CelebrationId } from '@/features/engagement/types/celebration';
import type {
	ExchangeMethod,
	Invoice,
	InvoiceLineItem,
	InvoiceStatus,
	PaymentMethod,
	Project,
} from '@/lib/supabase/database.types';

export interface InvoiceWithLineItems extends Invoice {
	line_items: InvoiceLineItem[];
}

export interface InvoiceDetail extends InvoiceWithLineItems {
	project: Pick<Project, 'id' | 'name' | 'client_name' | 'client_contact' | 'currency' | 'type'>;
	payment_method: PaymentMethod | null;
}

export interface CreateInvoicePayload {
	projectId: string;
	paymentMethodId?: string | null;
	periodStart?: string;
	periodEnd?: string;
	percentage?: number;
	taxRate: number;
	showProjectName: boolean;
	showOwnerName: boolean;
	notes?: string;
	altCurrency?: string | null;
	exchangeRate?: number | null;
	exchangeMethod?: ExchangeMethod | null;
}

export interface IInvoiceActionState {
	error?: string;
	success?: string;
	invoiceId?: string;
	celebration?: CelebrationId;
}

export type { InvoiceStatus };
