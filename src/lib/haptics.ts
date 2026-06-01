export type HapticPattern =
	| 'light'
	| 'medium'
	| 'heavy'
	| 'selection'
	| 'success'
	| 'warning'
	| 'error'
	| 'celebration';

const PATTERNS: Record<HapticPattern, number | number[]> = {
	light: 12,
	medium: 24,
	heavy: 48,
	selection: 8,
	success: [12, 40, 12],
	warning: [20, 50, 20],
	error: [30, 60, 30],
	celebration: [12, 30, 12, 30, 48],
};

export function canUseHaptics(): boolean {
	return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

export function triggerHapticOnly(pattern: HapticPattern): void {
	if (!canUseHaptics()) {
		return;
	}

	navigator.vibrate(PATTERNS[pattern]);
}

export { triggerFeedback as triggerHaptic } from '@/lib/feedback/trigger-feedback';
