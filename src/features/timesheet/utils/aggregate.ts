import type { TimeEntry } from '@/lib/supabase/database.types';

export interface MonthlyAggregate {
	totalHours: number;
	totalAmount: number;
	entryCount: number;
}

export function aggregateMonthly(entries: Pick<TimeEntry, 'hours' | 'rate_at_entry'>[]): MonthlyAggregate {
	return entries.reduce(
		(acc, entry) => ({
			totalHours: acc.totalHours + entry.hours,
			totalAmount: acc.totalAmount + entry.hours * entry.rate_at_entry,
			entryCount: acc.entryCount + 1,
		}),
		{ totalHours: 0, totalAmount: 0, entryCount: 0 },
	);
}

export function entryAmount(entry: Pick<TimeEntry, 'hours' | 'rate_at_entry'>): number {
	return entry.hours * entry.rate_at_entry;
}
