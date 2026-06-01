import { addDays, format, parseISO, subDays } from 'date-fns';

export interface ITimeStreakStats {
	current: number;
	longest: number;
	loggedToday: boolean;
	activeDates: number;
}

function toIsoDate(date: Date): string {
	return format(date, 'yyyy-MM-dd');
}

function uniqueSortedDates(workDatesIso: string[]): string[] {
	return [...new Set(workDatesIso)].sort();
}

function countBackwardsFrom(startIso: string, dateSet: Set<string>): number {
	let count = 0;
	let cursor = startIso;

	while (dateSet.has(cursor)) {
		count += 1;
		cursor = toIsoDate(subDays(parseISO(cursor), 1));
	}

	return count;
}

function longestConsecutiveRun(sortedDates: string[]): number {
	if (sortedDates.length === 0) {
		return 0;
	}

	let longest = 1;
	let run = 1;

	for (let index = 1; index < sortedDates.length; index += 1) {
		const prev = parseISO(sortedDates[index - 1]);
		const expectedNext = toIsoDate(addDays(prev, 1));

		if (sortedDates[index] === expectedNext) {
			run += 1;
			longest = Math.max(longest, run);
		} else {
			run = 1;
		}
	}

	return longest;
}

export function computeTimeStreak(
	workDatesIso: string[],
	todayIso: string = toIsoDate(new Date()),
): ITimeStreakStats {
	const sorted = uniqueSortedDates(workDatesIso);
	const dateSet = new Set(sorted);

	if (sorted.length === 0) {
		return { current: 0, longest: 0, loggedToday: false, activeDates: 0 };
	}

	const loggedToday = dateSet.has(todayIso);
	const yesterdayIso = toIsoDate(subDays(parseISO(todayIso), 1));

	let streakStart: string | null = null;

	if (loggedToday) {
		streakStart = todayIso;
	} else if (dateSet.has(yesterdayIso)) {
		streakStart = yesterdayIso;
	}

	const current = streakStart ? countBackwardsFrom(streakStart, dateSet) : 0;

	return {
		current,
		longest: longestConsecutiveRun(sorted),
		loggedToday,
		activeDates: sorted.length,
	};
}

export function getStreakEncouragement(streak: ITimeStreakStats): string {
	if (streak.current === 0) {
		return streak.loggedToday
			? 'امروز رو شروع کردی — فردا هم یه ردیف بزن.'
			: 'امروز هنوز ساعتی نزدی؛ یه ردیف کوتاه کافیه.';
	}

	if (streak.current >= 30) {
		return 'ثباتت فوق‌العاده‌ست. همین‌طور ادامه بده.';
	}

	if (streak.current >= 7) {
		return 'هفته‌ات عالی پیش می‌ره — رکورد شخصی‌ات رو بشکن.';
	}

	return 'زنجیره‌ات فعاله — فردا هم ثبت کن تا قطع نشه.';
}
