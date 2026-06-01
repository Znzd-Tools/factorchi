export type FocusTimerStatus = 'idle' | 'running' | 'paused';

export interface IFocusTimerProject {
	id: string;
	name: string;
}

export interface IPersistedFocusTimer {
	projectId: string;
	projectName: string;
	status: Exclude<FocusTimerStatus, 'idle'>;
	accumulatedMs: number;
	segmentStartedAt: number | null;
	completedPomodoros: number;
}

export interface IFocusTimerStopDraft {
	projectId: string;
	projectName: string;
	elapsedMs: number;
	workDate: string;
	hours: number;
}
