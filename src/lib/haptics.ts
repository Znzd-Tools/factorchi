export type HapticPattern =
	| 'light'
	| 'medium'
	| 'heavy'
	| 'selection'
	| 'success'
	| 'warning'
	| 'error';

const PATTERNS: Record<HapticPattern, number | number[]> = {
	light: 12,
	medium: 24,
	heavy: 48,
	selection: 8,
	success: [12, 40, 12],
	warning: [20, 50, 20],
	error: [30, 60, 30],
};

export function canUseHaptics(): boolean {
	return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

export function triggerHaptic(pattern: HapticPattern): void {
	if (!canUseHaptics()) {
		return;
	}

	navigator.vibrate(PATTERNS[pattern]);
}
