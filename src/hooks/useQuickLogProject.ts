'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

import {
	getQuickLogProjectId,
	setQuickLogProjectId,
	subscribeQuickLogProject,
} from '@/lib/quick-log/storage';

export function useQuickLogProject(projectIds: string[], defaultProjectId: string | null) {
	const storedId = useSyncExternalStore(
		subscribeQuickLogProject,
		getQuickLogProjectId,
		() => null,
	);

	const projectId = useMemo(() => {
		if (storedId && projectIds.includes(storedId)) {
			return storedId;
		}

		return defaultProjectId;
	}, [storedId, projectIds, defaultProjectId]);

	const setProjectId = useCallback((id: string) => {
		setQuickLogProjectId(id);
	}, []);

	return { projectId, setProjectId };
}
