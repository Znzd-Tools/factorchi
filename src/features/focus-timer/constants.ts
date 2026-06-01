/** Default Pomodoro block length when project has no override. */
export const DEFAULT_POMODORO_MINUTES = 25;

export const MIN_POMODORO_MINUTES = 5;
export const MAX_POMODORO_MINUTES = 120;

export function pomodoroMinutesToMs(minutes: number): number {
	return minutes * 60 * 1000;
}

export function normalizePomodoroMinutes(value: number | null | undefined): number {
	if (value == null || !Number.isFinite(value)) {
		return DEFAULT_POMODORO_MINUTES;
	}

	return Math.min(MAX_POMODORO_MINUTES, Math.max(MIN_POMODORO_MINUTES, Math.round(value)));
}
