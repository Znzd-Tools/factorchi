import { normalizePomodoroMinutes, pomodoroMinutesToMs } from '@/features/focus-timer/constants';
import type { IPersistedFocusTimer } from '@/features/focus-timer/types';

export function getElapsedMs(timer: IPersistedFocusTimer | null, now = Date.now()): number {
	if (!timer) {
		return 0;
	}

	if (timer.status === 'running' && timer.segmentStartedAt != null) {
		return timer.accumulatedMs + (now - timer.segmentStartedAt);
	}

	return timer.accumulatedMs;
}

export function getPomodoroBlockMs(timer: IPersistedFocusTimer | null): number {
	return pomodoroMinutesToMs(normalizePomodoroMinutes(timer?.pomodoroMinutes));
}

export function getPomodoroProgress(elapsedMs: number, pomodoroMinutes: number): number {
	const blockMs = pomodoroMinutesToMs(normalizePomodoroMinutes(pomodoroMinutes));
	const inBlock = elapsedMs % blockMs;

	return Math.min(1, inBlock / blockMs);
}

export function getCompletedPomodoros(elapsedMs: number, pomodoroMinutes: number): number {
	const blockMs = pomodoroMinutesToMs(normalizePomodoroMinutes(pomodoroMinutes));

	return Math.floor(elapsedMs / blockMs);
}

/** 1-based index of the current focus block (wraps after each full pomodoro). */
export function getCurrentPomodoroIndex(elapsedMs: number, pomodoroMinutes: number): number {
	return getCompletedPomodoros(elapsedMs, pomodoroMinutes) + 1;
}

export function elapsedMsToHours(elapsedMs: number): number {
	const minutes = Math.round(elapsedMs / 60_000);

	if (minutes < 1) {
		return 0;
	}

	return Math.min(24, minutes / 60);
}
