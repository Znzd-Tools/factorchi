import type { CelebrationId, ICelebrationConfig } from '@/features/engagement/types/celebration';

export const CELEBRATIONS: Record<CelebrationId, ICelebrationConfig> = {
	first_time_entry: {
		id: 'first_time_entry',
		title: 'شروع قوی!',
		message: 'اولین ساعتت ثبت شد. از همین‌جا همه‌چیز جمع می‌شود.',
		intensity: 'burst',
	},
	streak_3: {
		id: 'streak_3',
		title: 'سه روز پیاپی',
		message: 'عادت داری شکل می‌گیرد — ادامه بده.',
		intensity: 'burst',
	},
	streak_7: {
		id: 'streak_7',
		title: 'یک هفته کامل',
		message: '۷ روز پشت‌سرهم ثبت کردی. خیلی خوبه.',
		intensity: 'burst',
	},
	streak_14: {
		id: 'streak_14',
		title: 'دو هفته طلایی',
		message: '۱۴ روز متوالی! داری حرفه‌ای جلو می‌ری.',
		intensity: 'burst',
	},
	streak_30: {
		id: 'streak_30',
		title: 'قهرمان ثبات',
		message: '۳۰ روز پیاپی — این دیگه عادت شده.',
		intensity: 'burst',
	},
	first_invoice_paid: {
		id: 'first_invoice_paid',
		title: 'پول اومد!',
		message: 'اولین فاکتورت پرداخت شد. جشن کوچیک هم داریم.',
		intensity: 'burst',
	},
	invoice_paid: {
		id: 'invoice_paid',
		title: 'تسویه شد',
		message: 'فاکتور به وضعیت پرداخت‌شده رفت.',
		intensity: 'pulse',
	},
};

const STREAK_MILESTONES: Partial<Record<number, CelebrationId>> = {
	3: 'streak_3',
	7: 'streak_7',
	14: 'streak_14',
	30: 'streak_30',
};

export function getStreakMilestoneCelebration(streakDays: number): CelebrationId | undefined {
	return STREAK_MILESTONES[streakDays];
}
