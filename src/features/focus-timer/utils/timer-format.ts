import { toPersianDigits } from '@/lib/locale/persian-digits';

import { POMODORO_FOCUS_MINUTES } from '@/features/focus-timer/constants';

export function formatElapsedClock(elapsedMs: number): string {
	const totalSeconds = Math.floor(elapsedMs / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) {
		return toPersianDigits(
			`${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
		);
	}

	return toPersianDigits(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
}

export function formatPomodoroBlockRemaining(elapsedMs: number): string {
	const totalSeconds = Math.floor((elapsedMs % (POMODORO_FOCUS_MINUTES * 60_000)) / 1000);
	const remainingSeconds = POMODORO_FOCUS_MINUTES * 60 - totalSeconds;
	const minutes = Math.floor(remainingSeconds / 60);
	const seconds = remainingSeconds % 60;

	return toPersianDigits(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
}
