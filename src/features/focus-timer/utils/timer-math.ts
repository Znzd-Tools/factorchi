import { POMODORO_FOCUS_MS } from '@/features/focus-timer/constants';
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

export function getPomodoroProgress(elapsedMs: number): number {
	const inBlock = elapsedMs % POMODORO_FOCUS_MS;

	return Math.min(1, inBlock / POMODORO_FOCUS_MS);
}

export function getCompletedPomodoros(elapsedMs: number): number {
	return Math.floor(elapsedMs / POMODORO_FOCUS_MS);
}

export function elapsedMsToHours(elapsedMs: number): number {
	const minutes = Math.round(elapsedMs / 60_000);

	if (minutes < 1) {
		return 0;
	}

	return Math.min(24, minutes / 60);
}
