import type { ExchangeMethod } from '@/lib/supabase/database.types';
import type { TimeEntry } from '@/lib/supabase/database.types';

export interface GeneratedLineItem {
	title: string;
	type: 'hourly' | 'fixed';
	hours: number | null;
	rate: number | null;
	total: number;
}

export interface InvoiceTotalsResult {
	subtotal: number;
	taxAmount: number;
	total: number;
	altTotal: number | null;
}

type TimeEntrySlice = Pick<TimeEntry, 'hours' | 'rate_at_entry'>;

export function generateHourlyLines(entries: TimeEntrySlice[]): GeneratedLineItem[] {
	const grouped = new Map<number, number>();

	for (const entry of entries) {
		const hours = Number(entry.hours);
		const rate = Number(entry.rate_at_entry);
		grouped.set(rate, (grouped.get(rate) ?? 0) + hours);
	}

	return Array.from(grouped.entries())
		.sort(([rateA], [rateB]) => rateA - rateB)
		.map(([rate, hours]) => ({
			title: 'خدمات ساعتی',
			type: 'hourly' as const,
			hours,
			rate,
			total: Math.round(hours * rate),
		}));
}

export function generateTotalLine(totalAmount: number, percentage: number): GeneratedLineItem {
	const lineTotal = Math.round(totalAmount * (percentage / 100));

	return {
		title: `بخشی از مبلغ کل پروژه (${percentage}٪)`,
		type: 'fixed',
		hours: null,
		rate: null,
		total: lineTotal,
	};
}

export function calculateInvoiceTotals(
	lines: GeneratedLineItem[],
	taxRate: number,
	altCurrency?: {
		exchangeRate: number;
		exchangeMethod: ExchangeMethod;
	},
): InvoiceTotalsResult {
	const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
	const taxAmount = Math.round(subtotal * (taxRate / 100));
	const total = subtotal + taxAmount;

	let altTotal: number | null = null;

	if (altCurrency && altCurrency.exchangeRate > 0) {
		altTotal =
			altCurrency.exchangeMethod === 'divide'
				? total / altCurrency.exchangeRate
				: total * altCurrency.exchangeRate;
	}

	return { subtotal, taxAmount, total, altTotal };
}
