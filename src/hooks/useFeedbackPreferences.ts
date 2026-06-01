'use client';

import { useSyncExternalStore } from 'react';

import {
	getFeedbackPreferences,
	setFeedbackPreferences,
	subscribeFeedbackPreferences,
	type FeedbackPreferences,
} from '@/lib/feedback/preferences';

export function useFeedbackPreferences(): FeedbackPreferences & {
	setHapticsEnabled: (enabled: boolean) => void;
	setSoundsEnabled: (enabled: boolean) => void;
} {
	const preferences = useSyncExternalStore(
		subscribeFeedbackPreferences,
		getFeedbackPreferences,
		() => ({ hapticsEnabled: true, soundsEnabled: true }),
	);

	return {
		...preferences,
		setHapticsEnabled: (enabled) => setFeedbackPreferences({ hapticsEnabled: enabled }),
		setSoundsEnabled: (enabled) => setFeedbackPreferences({ soundsEnabled: enabled }),
	};
}
