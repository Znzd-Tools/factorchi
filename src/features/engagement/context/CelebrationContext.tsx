'use client';

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from 'react';

import type { CelebrationId } from '@/features/engagement/types/celebration';

interface ICelebrationContextValue {
	activeId: CelebrationId | null;
	trigger: (id: CelebrationId) => void;
	dismiss: () => void;
}

const CelebrationContext = createContext<ICelebrationContextValue | null>(null);

export function CelebrationProvider({ children }: { children: ReactNode }) {
	const [activeId, setActiveId] = useState<CelebrationId | null>(null);

	const dismiss = useCallback(() => {
		setActiveId(null);
	}, []);

	const trigger = useCallback((id: CelebrationId) => {
		setActiveId(id);
	}, []);

	const value = useMemo(
		() => ({
			activeId,
			trigger,
			dismiss,
		}),
		[activeId, trigger, dismiss],
	);

	return <CelebrationContext.Provider value={value}>{children}</CelebrationContext.Provider>;
}

export function useCelebration(): ICelebrationContextValue {
	const context = useContext(CelebrationContext);

	if (!context) {
		throw new Error('useCelebration must be used within CelebrationProvider');
	}

	return context;
}
