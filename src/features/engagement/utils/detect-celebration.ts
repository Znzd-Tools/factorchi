import {
	getStreakMilestoneCelebration,
} from '@/features/engagement/constants/celebrations';
import type { CelebrationId } from '@/features/engagement/types/celebration';
import { computeTimeStreak } from '@/features/engagement/utils/time-streak';

export function detectTimeEntryCelebration(workDatesIso: string[]): CelebrationId | undefined {
	const uniqueDays = [...new Set(workDatesIso)];

	if (uniqueDays.length === 1) {
		return 'first_time_entry';
	}

	const { current } = computeTimeStreak(uniqueDays);

	return getStreakMilestoneCelebration(current);
}

export function detectInvoicePaidCelebration(paidInvoiceCount: number): CelebrationId {
	return paidInvoiceCount <= 1 ? 'first_invoice_paid' : 'invoice_paid';
}
