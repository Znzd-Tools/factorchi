import { normalizePomodoroMinutes, pomodoroMinutesToMs } from '@/features/focus-timer/constants';
import { toPersianDigits } from '@/lib/locale/persian-digits';

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

export function formatPomodoroBlockRemaining(elapsedMs: number, pomodoroMinutes: number): string {
	const blockMs = pomodoroMinutesToMs(normalizePomodoroMinutes(pomodoroMinutes));
	const totalSeconds = Math.floor((elapsedMs % blockMs) / 1000);
	const blockSeconds = Math.floor(blockMs / 1000);
	const remainingSeconds = Math.max(0, blockSeconds - totalSeconds);
	const minutes = Math.floor(remainingSeconds / 60);
	const seconds = remainingSeconds % 60;

	return toPersianDigits(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
}
