/** Default Pomodoro block length when project has no override. */
export const DEFAULT_POMODORO_MINUTES = 25;

export const MIN_POMODORO_MINUTES = 5;
export const MAX_POMODORO_MINUTES = 120;

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

export function pomodoroMinutesToMs(minutes: number): number {
	return minutes * 60 * 1000;
}

function parsePomodoroNumeric(value: number | string): number | null {
	if (typeof value === 'number') {
		return Number.isFinite(value) ? value : null;
	}

	const normalized = value
		.trim()
		.replace(/[۰-۹]/g, (digit) => String(FA_DIGITS.indexOf(digit)))
		.replace(/[٠-٩]/g, (digit) => String(AR_DIGITS.indexOf(digit)))
		.replace(/[^\d]/g, '');

	if (!normalized) {
		return null;
	}

	const parsed = Number.parseInt(normalized, 10);

	return Number.isFinite(parsed) ? parsed : null;
}

export function parsePomodoroMinutesInput(value: string): number | null {
	return parsePomodoroNumeric(value);
}

export function normalizePomodoroMinutes(
	value: number | string | null | undefined,
): number {
	if (value == null) {
		return DEFAULT_POMODORO_MINUTES;
	}

	const parsed = parsePomodoroNumeric(value);

	if (parsed == null) {
		return DEFAULT_POMODORO_MINUTES;
	}

	return Math.min(
		MAX_POMODORO_MINUTES,
		Math.max(MIN_POMODORO_MINUTES, Math.round(parsed)),
	);
}
