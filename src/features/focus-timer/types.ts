export type FocusTimerStatus = 'idle' | 'running' | 'paused';

export interface IFocusTimerProject {
	id: string;
	name: string;
	pomodoroMinutes: number;
}

export interface IPersistedFocusTimer {
	projectId: string;
	projectName: string;
	pomodoroMinutes: number;
	status: Exclude<FocusTimerStatus, 'idle'>;
	accumulatedMs: number;
	segmentStartedAt: number | null;
}

export interface IFocusTimerStopDraft {
	projectId: string;
	projectName: string;
	elapsedMs: number;
	workDate: string;
	hours: number;
}
