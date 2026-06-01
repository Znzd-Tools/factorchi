export type FeedbackPreferences = {
	hapticsEnabled: boolean;
	soundsEnabled: boolean;
};

const HAPTICS_KEY = 'factorchi-feedback-haptics';
const SOUNDS_KEY = 'factorchi-feedback-sounds';
const CHANGE_EVENT = 'factorchi-feedback-change';

const DEFAULT_PREFERENCES: FeedbackPreferences = {
	hapticsEnabled: true,
	soundsEnabled: true,
};

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

export function getFeedbackPreferences(): FeedbackPreferences {
	if (typeof window === 'undefined') {
		return DEFAULT_PREFERENCES;
	}

	return {
		hapticsEnabled: readBoolean(HAPTICS_KEY, true),
		soundsEnabled: readBoolean(SOUNDS_KEY, true),
	};
}

export function setFeedbackPreferences(patch: Partial<FeedbackPreferences>): FeedbackPreferences {
	const current = getFeedbackPreferences();
	const next: FeedbackPreferences = {
		hapticsEnabled: patch.hapticsEnabled ?? current.hapticsEnabled,
		soundsEnabled: patch.soundsEnabled ?? current.soundsEnabled,
	};

	localStorage.setItem(HAPTICS_KEY, next.hapticsEnabled ? '1' : '0');
	localStorage.setItem(SOUNDS_KEY, next.soundsEnabled ? '1' : '0');
	window.dispatchEvent(new Event(CHANGE_EVENT));

	return next;
}

export function subscribeFeedbackPreferences(onStoreChange: () => void): () => void {
	const handler = () => onStoreChange();

	window.addEventListener(CHANGE_EVENT, handler);
	window.addEventListener('storage', handler);

	return () => {
		window.removeEventListener(CHANGE_EVENT, handler);
		window.removeEventListener('storage', handler);
	};
}
