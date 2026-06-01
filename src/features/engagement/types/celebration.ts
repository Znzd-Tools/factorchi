export type CelebrationId =
	| 'first_time_entry'
	| 'streak_3'
	| 'streak_7'
	| 'streak_14'
	| 'streak_30'
	| 'first_invoice_paid'
	| 'invoice_paid';

export type CelebrationIntensity = 'burst' | 'pulse';

export interface ICelebrationConfig {
	id: CelebrationId;
	title: string;
	message: string;
	intensity: CelebrationIntensity;
}
