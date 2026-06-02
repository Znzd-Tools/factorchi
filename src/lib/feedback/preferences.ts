export type FeedbackPreferences = {
	hapticsEnabled: boolean;
	soundsEnabled: boolean;
};

const HAPTICS_KEY = 'factorchi-feedback-haptics';
const SOUNDS_KEY = 'factorchi-feedback-sounds';
const CHANGE_EVENT = 'factorchi-feedback-change';

export const DEFAULT_FEEDBACK_PREFERENCES: FeedbackPreferences = {
	hapticsEnabled: true,
	soundsEnabled: true,
};

let cachedSnapshot: FeedbackPreferences = DEFAULT_FEEDBACK_PREFERENCES;

function readBoolean(key: string, fallback: boolean): boolean {
	const stored = localStorage.getItem(key);

	if (stored === '0') {
		return false;
	}

	if (stored === '1') {
		return true;
	}

	return fallback;
}

function readSnapshotFromStorage(): FeedbackPreferences {
	return {
		hapticsEnabled: readBoolean(HAPTICS_KEY, true),
		soundsEnabled: readBoolean(SOUNDS_KEY, true),
	};
}

function snapshotsEqual(a: FeedbackPreferences, b: FeedbackPreferences): boolean {
	return a.hapticsEnabled === b.hapticsEnabled && a.soundsEnabled === b.soundsEnabled;
}

function refreshCachedSnapshot(): FeedbackPreferences {
	const next = readSnapshotFromStorage();

	if (snapshotsEqual(next, cachedSnapshot)) {
		return cachedSnapshot;
	}

	cachedSnapshot = next;
	return cachedSnapshot;
}

export function getFeedbackPreferences(): FeedbackPreferences {
	if (typeof window === 'undefined') {
		return DEFAULT_FEEDBACK_PREFERENCES;
	}

	return refreshCachedSnapshot();
}

export function getServerFeedbackPreferences(): FeedbackPreferences {
	return DEFAULT_FEEDBACK_PREFERENCES;
}

export function setFeedbackPreferences(patch: Partial<FeedbackPreferences>): FeedbackPreferences {
	const current = getFeedbackPreferences();
	const next: FeedbackPreferences = {
		hapticsEnabled: patch.hapticsEnabled ?? current.hapticsEnabled,
		soundsEnabled: patch.soundsEnabled ?? current.soundsEnabled,
	};

	localStorage.setItem(HAPTICS_KEY, next.hapticsEnabled ? '1' : '0');
	localStorage.setItem(SOUNDS_KEY, next.soundsEnabled ? '1' : '0');
	cachedSnapshot = next;
	window.dispatchEvent(new Event(CHANGE_EVENT));

	return next;
}

export function subscribeFeedbackPreferences(onStoreChange: () => void): () => void {
	const handler = () => {
		refreshCachedSnapshot();
		onStoreChange();
	};

	window.addEventListener(CHANGE_EVENT, handler);
	window.addEventListener('storage', handler);

	return () => {
		window.removeEventListener(CHANGE_EVENT, handler);
		window.removeEventListener('storage', handler);
	};
}
