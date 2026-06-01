const PROJECT_KEY = 'factorchi-quick-log-project';
const CHANGE_EVENT = 'factorchi-quick-log-change';

export function getQuickLogProjectId(): string | null {
	if (typeof window === 'undefined') {
		return null;
	}

	return localStorage.getItem(PROJECT_KEY);
}

export function setQuickLogProjectId(projectId: string): void {
	localStorage.setItem(PROJECT_KEY, projectId);
	window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeQuickLogProject(onStoreChange: () => void): () => void {
	const handler = () => onStoreChange();

	window.addEventListener(CHANGE_EVENT, handler);
	window.addEventListener('storage', handler);

	return () => {
		window.removeEventListener(CHANGE_EVENT, handler);
		window.removeEventListener('storage', handler);
	};
}
