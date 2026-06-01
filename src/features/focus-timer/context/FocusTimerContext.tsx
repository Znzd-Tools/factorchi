'use client';

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import { toast } from 'sonner';

import { POMODORO_FOCUS_MS } from '@/features/focus-timer/constants';
import {
	readPersistedTimer,
	subscribePersistedTimer,
	writePersistedTimer,
} from '@/features/focus-timer/storage/focus-timer-storage';
import type {
	IFocusTimerProject,
	IFocusTimerStopDraft,
	IPersistedFocusTimer,
} from '@/features/focus-timer/types';
import {
	elapsedMsToHours,
	getCompletedPomodoros,
	getElapsedMs,
} from '@/features/focus-timer/utils/timer-math';
import { getTodayIso } from '@/lib/jalali/picker';
import { triggerHaptic } from '@/lib/haptics';

interface IFocusTimerContextValue {
	timer: IPersistedFocusTimer | null;
	elapsedMs: number;
	pomodoroProgress: number;
	completedPomodoros: number;
	stopDraft: IFocusTimerStopDraft | null;
	isActive: boolean;
	start: (project: IFocusTimerProject) => void;
	pause: () => void;
	resume: () => void;
	requestStop: () => void;
	dismissStop: () => void;
	discardSession: () => void;
	updateStopHours: (hours: number) => void;
}

const FocusTimerContext = createContext<IFocusTimerContextValue | null>(null);

function hydrateTimer(): IPersistedFocusTimer | null {
	const stored = readPersistedTimer();

	if (!stored) {
		return null;
	}

	if (stored.status === 'running' && stored.segmentStartedAt == null) {
		return { ...stored, status: 'paused' };
	}

	return stored;
}

export function FocusTimerProvider({ children }: { children: ReactNode }) {
	const [timer, setTimer] = useState<IPersistedFocusTimer | null>(() =>
		typeof window !== 'undefined' ? hydrateTimer() : null,
	);
	const [now, setNow] = useState(() => Date.now());
	const [stopDraft, setStopDraft] = useState<IFocusTimerStopDraft | null>(null);
	const [lastPomodoroCount, setLastPomodoroCount] = useState(0);

	const persist = useCallback((next: IPersistedFocusTimer | null) => {
		setTimer(next);
		writePersistedTimer(next);
	}, []);

	useEffect(() => subscribePersistedTimer(() => setTimer(hydrateTimer())), []);

	useEffect(() => {
		if (timer?.status !== 'running') {
			return;
		}

		const id = window.setInterval(() => setNow(Date.now()), 250);

		return () => window.clearInterval(id);
	}, [timer?.status]);

	const elapsedMs = getElapsedMs(timer, now);
	const completedPomodoros = timer ? getCompletedPomodoros(elapsedMs) : 0;
	const pomodoroProgress = timer ? (elapsedMs % POMODORO_FOCUS_MS) / POMODORO_FOCUS_MS : 0;

	useEffect(() => {
		if (!timer) {
			setLastPomodoroCount(0);
			return;
		}

		const baseline = getCompletedPomodoros(getElapsedMs(timer, Date.now()));
		setLastPomodoroCount(baseline);
	}, [timer?.projectId]);

	useEffect(() => {
		if (!timer || completedPomodoros <= lastPomodoroCount) {
			return;
		}

		setLastPomodoroCount(completedPomodoros);
		triggerHaptic('success');
	}, [completedPomodoros, lastPomodoroCount, timer]);

	useEffect(() => {
		if (timer?.status !== 'running') {
			return;
		}

		let wakeLock: WakeLockSentinel | null = null;

		const requestWakeLock = async () => {
			try {
				if ('wakeLock' in navigator) {
					wakeLock = await navigator.wakeLock.request('screen');
				}
			} catch {
				// Ignore — optional enhancement
			}
		};

		void requestWakeLock();

		return () => {
			void wakeLock?.release();
		};
	}, [timer?.status, timer?.projectId]);

	const start = useCallback(
		(project: IFocusTimerProject) => {
			const next: IPersistedFocusTimer = {
				projectId: project.id,
				projectName: project.name,
				status: 'running',
				accumulatedMs: 0,
				segmentStartedAt: Date.now(),
				completedPomodoros: 0,
			};

			setStopDraft(null);
			setLastPomodoroCount(0);
			persist(next);
			triggerHaptic('medium');
		},
		[persist],
	);

	const pause = useCallback(() => {
		setTimer((current) => {
			if (!current || current.status !== 'running' || current.segmentStartedAt == null) {
				return current;
			}

			const next: IPersistedFocusTimer = {
				...current,
				status: 'paused',
				accumulatedMs: current.accumulatedMs + (Date.now() - current.segmentStartedAt),
				segmentStartedAt: null,
			};

			writePersistedTimer(next);
			triggerHaptic('light');
			return next;
		});
	}, []);

	const resume = useCallback(() => {
		setTimer((current) => {
			if (!current || current.status !== 'paused') {
				return current;
			}

			const next: IPersistedFocusTimer = {
				...current,
				status: 'running',
				segmentStartedAt: Date.now(),
			};

			writePersistedTimer(next);
			triggerHaptic('selection');
			return next;
		});
	}, []);

	const requestStop = useCallback(() => {
		setTimer((current) => {
			if (!current) {
				return current;
			}

			const frozenMs = getElapsedMs(current, Date.now());
			const hours = elapsedMsToHours(frozenMs);

			if (hours <= 0) {
				toast.error('حداقل یک دقیقه برای پایان جلسه لازم است.');
				triggerHaptic('warning');
				return current;
			}

			const paused: IPersistedFocusTimer = {
				...current,
				status: 'paused',
				accumulatedMs: frozenMs,
				segmentStartedAt: null,
			};

			writePersistedTimer(paused);

			setStopDraft({
				projectId: current.projectId,
				projectName: current.projectName,
				elapsedMs: frozenMs,
				workDate: getTodayIso(),
				hours,
			});

			triggerHaptic('light');
			return paused;
		});
	}, []);

	const dismissStop = useCallback(() => {
		setStopDraft(null);
	}, []);

	const discardSession = useCallback(() => {
		setStopDraft(null);
		persist(null);
		triggerHaptic('light');
	}, [persist]);

	const updateStopHours = useCallback((hours: number) => {
		setStopDraft((draft) => (draft ? { ...draft, hours } : draft));
	}, []);

	const value = useMemo(
		() => ({
			timer,
			elapsedMs,
			pomodoroProgress,
			completedPomodoros,
			stopDraft,
			isActive: timer != null,
			start,
			pause,
			resume,
			requestStop,
			dismissStop,
			discardSession,
			updateStopHours,
		}),
		[
			timer,
			elapsedMs,
			pomodoroProgress,
			completedPomodoros,
			stopDraft,
			start,
			pause,
			resume,
			requestStop,
			dismissStop,
			discardSession,
			updateStopHours,
		],
	);

	return <FocusTimerContext.Provider value={value}>{children}</FocusTimerContext.Provider>;
}

export function useFocusTimer(): IFocusTimerContextValue {
	const context = useContext(FocusTimerContext);

	if (!context) {
		throw new Error('useFocusTimer must be used within FocusTimerProvider');
	}

	return context;
}
