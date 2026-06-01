import {
	INVOICE_STATUS_LABELS,
	INVOICE_STATUS_TRANSITIONS,
} from '@/features/invoice/constants/invoice-status';
import type { InvoiceStatus } from '@/lib/supabase/database.types';

export type TimelineStepState = 'done' | 'current' | 'upcoming' | 'terminal';

export interface IInvoiceTimelineStep {
	status: InvoiceStatus;
	label: string;
	state: TimelineStepState;
}

const MAIN_FLOW: InvoiceStatus[] = ['draft', 'sent', 'paid'];

const FLOW_INDEX: Record<InvoiceStatus, number> = {
	draft: 0,
	sent: 1,
	overdue: 1.5,
	paid: 2,
	canceled: -1,
};

export function buildInvoiceTimelineSteps(currentStatus: InvoiceStatus): IInvoiceTimelineStep[] {
	if (currentStatus === 'canceled') {
		return [
			{ status: 'draft', label: INVOICE_STATUS_LABELS.draft, state: 'done' },
			{ status: 'canceled', label: INVOICE_STATUS_LABELS.canceled, state: 'terminal' },
		];
	}

	const currentIndex = FLOW_INDEX[currentStatus];
	const steps: InvoiceStatus[] =
		currentStatus === 'overdue' ? ['draft', 'sent', 'overdue', 'paid'] : MAIN_FLOW;

	return steps.map((status) => {
		const index = FLOW_INDEX[status];

		let state: TimelineStepState = 'upcoming';

		if (status === currentStatus) {
			state = 'current';
		} else if (index < currentIndex) {
			state = 'done';
		}

		return {
			status,
			label: INVOICE_STATUS_LABELS[status],
			state,
		};
	});
}

export function getNextStatusActions(currentStatus: InvoiceStatus): InvoiceStatus[] {
	return INVOICE_STATUS_TRANSITIONS[currentStatus];
}
