import type { IPersistedFocusTimer } from '@/features/focus-timer/types';

const STORAGE_KEY = 'factorchi-focus-timer';
const CHANGE_EVENT = 'factorchi-focus-timer-change';

export function readPersistedTimer(): IPersistedFocusTimer | null {
	if (typeof window === 'undefined') {
		return null;
	}

	try {
		const raw = localStorage.getItem(STORAGE_KEY);

		if (!raw) {
			return null;
		}

		const parsed = JSON.parse(raw) as IPersistedFocusTimer;

		if (
			!parsed?.projectId ||
			(parsed.status !== 'running' && parsed.status !== 'paused') ||
			typeof parsed.accumulatedMs !== 'number'
		) {
			return null;
		}

		return parsed;
	} catch {
		return null;
	}
}

export function writePersistedTimer(timer: IPersistedFocusTimer | null): void {
	if (timer) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(timer));
	} else {
		localStorage.removeItem(STORAGE_KEY);
	}

	window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribePersistedTimer(onStoreChange: () => void): () => void {
	const handler = () => onStoreChange();

	window.addEventListener(CHANGE_EVENT, handler);
	window.addEventListener('storage', handler);

	return () => {
		window.removeEventListener(CHANGE_EVENT, handler);
		window.removeEventListener('storage', handler);
	};
}
