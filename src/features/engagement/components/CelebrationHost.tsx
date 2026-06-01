'use client';

import { CelebrationOverlay } from '@/features/engagement/components/CelebrationOverlay';
import { CelebrationProvider } from '@/features/engagement/context/CelebrationContext';

export function CelebrationHost({ children }: { children: React.ReactNode }) {
	return (
		<CelebrationProvider>
			{children}
			<CelebrationOverlay />
		</CelebrationProvider>
	);
}
