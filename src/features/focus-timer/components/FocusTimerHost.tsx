'use client';

import { FocusTimerFloatingBar } from '@/features/focus-timer/components/FocusTimerFloatingBar';
import { FocusTimerStopModal } from '@/features/focus-timer/components/FocusTimerStopModal';
import { FocusTimerProvider } from '@/features/focus-timer/context/FocusTimerContext';

export function FocusTimerHost({ children }: { children: React.ReactNode }) {
	return (
		<FocusTimerProvider>
			{children}
			<FocusTimerFloatingBar />
			<FocusTimerStopModal />
		</FocusTimerProvider>
	);
}
