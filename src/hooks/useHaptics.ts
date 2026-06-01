'use client';

import { useCallback } from 'react';

import { type HapticPattern, triggerHaptic } from '@/lib/haptics';

export function useHaptics() {
	const trigger = useCallback((pattern: HapticPattern = 'light') => {
		triggerHaptic(pattern);
	}, []);

	return { trigger };
}
