'use client';

import { useCallback } from 'react';

import { triggerFeedback } from '@/lib/feedback/trigger-feedback';
import { type HapticPattern } from '@/lib/haptics';

export function useHaptics() {
	const trigger = useCallback((pattern: HapticPattern = 'light') => {
		triggerFeedback(pattern);
	}, []);

	return { trigger };
}
