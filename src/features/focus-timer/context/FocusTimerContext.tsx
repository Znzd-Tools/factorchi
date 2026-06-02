'use client';

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import { toast } from 'sonner';

import { normalizePomodoroMinutes } from '@/features/focus-timer/constants';
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
	getPomodoroProgress,
} from '@/features/focus-timer/utils/timer-math';
import { getTodayIso } from '@/lib/jalali/picker';
import { toFaNumber } from '@/lib/locale/persian-digits';
import { triggerHaptic } from '@/lib/haptics';

interface IFocusTimerContextValue {
	timer: IPersistedFocusTimer | null;
	elapsedMs: number;
	pomodoroMinutes: number;
	pomodoroProgress: number;
	completedPomodoros: number;
	onPomodoroBreak: boolean;
	stopDraft: IFocusTimerStopDraft | null;
	isActive: boolean;
	start: (project: IFocusTimerProject) => void;
	pause: () => void;
	resume: () => void;
	requestStop: () => void;
	cancelSession: () => void;
	dismissStop: () => void;
	discardSession: () => void;
	updateStopHours: (hours: number) => void;
	syncPomodoroMinutes: (projectId: string, minutes: number) => void;
}

const FocusTimerContext = createContext<IFocusTimerContextValue | null>(null);

function getInitialLastPomodoroCount(): number {
	if (typeof window === 'undefined') {
		return 0;
	}

	const stored = hydrateTimer();

	if (!stored) {
		return 0;
	}

	return getCompletedPomodoros(
		getElapsedMs(stored, Date.now()),
		normalizePomodoroMinutes(stored.pomodoroMinutes),
	);
}

function hydrateTimer(): IPersistedFocusTimer | null {
	const stored = readPersistedTimer();

	if (!stored) {
		return null;
	}

	const pomodoroMinutes = normalizePomodoroMinutes(stored.pomodoroMinutes);

	if (stored.status === 'running' && stored.segmentStartedAt == null) {
		return { ...stored, pomodoroMinutes, status: 'paused' };
	}

	return { ...stored, pomodoroMinutes };
}

function freezeRunningTimer(current: IPersistedFocusTimer): IPersistedFocusTimer {
	if (current.status !== 'running' || current.segmentStartedAt == null) {
		return current;
	}

	return {
		...current,
		status: 'paused',
		accumulatedMs: current.accumulatedMs + (Date.now() - current.segmentStartedAt),
		segmentStartedAt: null,
	};
}

export function FocusTimerProvider({ children }: { children: ReactNode }) {
	const [timer, setTimer] = useState<IPersistedFocusTimer | null>(() =>
		typeof window !== 'undefined' ? hydrateTimer() : null,
	);
	const [now, setNow] = useState(() => Date.now());
	const [stopDraft, setStopDraft] = useState<IFocusTimerStopDraft | null>(null);
	const [onPomodoroBreak, setOnPomodoroBreak] = useState(false);
	const lastPomodoroRef = useRef(getInitialLastPomodoroCount());
	const prevPomodoroMinutesRef = useRef<number | null>(null);
	const timerRef = useRef<IPersistedFocusTimer | null>(timer);

	useEffect(() => {
		timerRef.current = timer;
	}, [timer]);

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

	const pomodoroMinutes = normalizePomodoroMinutes(timer?.pomodoroMinutes);
	const elapsedMs = getElapsedMs(timer, now);
	const completedPomodoros = timer ? getCompletedPomodoros(elapsedMs, pomodoroMinutes) : 0;
	const pomodoroProgress = timer ? getPomodoroProgress(elapsedMs, pomodoroMinutes) : 0;

	const pauseForBreak = useCallback(() => {
		setTimer((current) => {
			if (!current) {
				return current;
			}

			const next = freezeRunningTimer(current);
			writePersistedTimer(next);
			return next;
		});
		setOnPomodoroBreak(true);
	}, []);

	useEffect(() => {
		if (!timer) {
			lastPomodoroRef.current = 0;
			prevPomodoroMinutesRef.current = null;
			return;
		}

		if (prevPomodoroMinutesRef.current !== pomodoroMinutes) {
			prevPomodoroMinutesRef.current = pomodoroMinutes;
			lastPomodoroRef.current = completedPomodoros;
		}
	}, [timer, pomodoroMinutes, completedPomodoros]);

	useEffect(() => {
		if (!timer) {
			lastPomodoroRef.current = 0;
			return;
		}

		if (timer.status !== 'running') {
			return;
		}

		if (completedPomodoros > lastPomodoroRef.current) {
			lastPomodoroRef.current = completedPomodoros;
			triggerHaptic('success');
			toast.success(
				`پومودورو ${toFaNumber(completedPomodoros)} تمام شد. وقت استراحت — «ادامه» برای راند بعدی.`,
			);
			pauseForBreak();
		}
	}, [completedPomodoros, timer, pauseForBreak]);

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
				// Optional
			}
		};

		void requestWakeLock();

		return () => {
			void wakeLock?.release();
		};
	}, [timer?.status, timer?.projectId]);

	const start = useCallback(
		(project: IFocusTimerProject) => {
			const minutes = normalizePomodoroMinutes(project.pomodoroMinutes);
			const next: IPersistedFocusTimer = {
				projectId: project.id,
				projectName: project.name,
				pomodoroMinutes: minutes,
				status: 'running',
				accumulatedMs: 0,
				segmentStartedAt: Date.now(),
			};

			setStopDraft(null);
			setOnPomodoroBreak(false);
			lastPomodoroRef.current = 0;
			persist(next);
			triggerHaptic('medium');
		},
		[persist],
	);

	const pause = useCallback(() => {
		setOnPomodoroBreak(false);
		setTimer((current) => {
			if (!current) {
				return current;
			}

			const next = freezeRunningTimer(current);
			writePersistedTimer(next);
			triggerHaptic('light');
			return next;
		});
	}, []);

	const resume = useCallback(() => {
		setOnPomodoroBreak(false);
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

	const discardSession = useCallback(() => {
		setStopDraft(null);
		setOnPomodoroBreak(false);
		persist(null);
		triggerHaptic('light');
	}, [persist]);

	const cancelSession = useCallback(() => {
		discardSession();
		toast.success('جلسه لغو شد.');
	}, [discardSession]);

	const requestStop = useCallback(() => {
		const current = timerRef.current;

		if (!current) {
			return;
		}

		setOnPomodoroBreak(false);

		const snapshot =
			current.status === 'running' ? freezeRunningTimer(current) : current;
		const frozenMs = getElapsedMs(snapshot, Date.now());
		const hours = elapsedMsToHours(frozenMs);

		if (hours <= 0) {
			cancelSession();
			return;
		}

		const paused: IPersistedFocusTimer = {
			...snapshot,
			status: 'paused',
			accumulatedMs: frozenMs,
			segmentStartedAt: null,
		};

		persist(paused);

		setStopDraft({
			projectId: current.projectId,
			projectName: current.projectName,
			elapsedMs: frozenMs,
			workDate: getTodayIso(),
			hours,
		});

		triggerHaptic('light');
	}, [cancelSession, persist]);

	const dismissStop = useCallback(() => {
		setStopDraft(null);
	}, []);

	const updateStopHours = useCallback((hours: number) => {
		setStopDraft((draft) => (draft ? { ...draft, hours } : draft));
	}, []);

	const syncPomodoroMinutes = useCallback((projectId: string, minutes: number) => {
		const normalized = normalizePomodoroMinutes(minutes);

		setTimer((current) => {
			if (!current || current.projectId !== projectId || current.pomodoroMinutes === normalized) {
				return current;
			}

			const next: IPersistedFocusTimer = {
				...current,
				pomodoroMinutes: normalized,
			};

			writePersistedTimer(next);
			return next;
		});
	}, []);

	const value = useMemo(
		() => ({
			timer,
			elapsedMs,
			pomodoroMinutes,
			pomodoroProgress,
			completedPomodoros,
			onPomodoroBreak,
			stopDraft,
			isActive: timer != null,
			start,
			pause,
			resume,
			requestStop,
			cancelSession,
			dismissStop,
			discardSession,
			updateStopHours,
			syncPomodoroMinutes,
		}),
		[
			timer,
			elapsedMs,
			pomodoroMinutes,
			pomodoroProgress,
			completedPomodoros,
			onPomodoroBreak,
			stopDraft,
			start,
			pause,
			resume,
			requestStop,
			cancelSession,
			dismissStop,
			discardSession,
			updateStopHours,
			syncPomodoroMinutes,
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
