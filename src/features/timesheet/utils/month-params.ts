import {
	addMonths,
	getMonth as getJalaliMonth,
	getYear as getJalaliYear,
	newDate as newJalaliDate,
	subMonths,
} from 'date-fns-jalali';

import { getCurrentJalaliMonth, getJalaliMonthRange } from '@/lib/jalali';
import { getTodayIso } from '@/lib/jalali/picker';

export interface JalaliMonthParams {
	year: number;
	month: number;
}

export function resolveJalaliMonthParams(
	searchParams: Record<string, string | string[] | undefined>,
): JalaliMonthParams {
	const current = getCurrentJalaliMonth();
	const rawYear = searchParams.year;
	const rawMonth = searchParams.month;
	const year = typeof rawYear === 'string' ? Number(rawYear) : current.year;
	const month = typeof rawMonth === 'string' ? Number(rawMonth) : current.month;

	if (!Number.isFinite(year) || !Number.isFinite(month) || month < 0 || month > 11) {
		return { year: current.year, month: current.month };
	}

	return { year, month };
}

export function buildJalaliMonthHref(
	pathname: string,
	searchParams: URLSearchParams,
	year: number,
	month: number,
): string {
	const params = new URLSearchParams(searchParams.toString());
	params.set('year', String(year));
	params.set('month', String(month));
	return `${pathname}?${params.toString()}`;
}

export function getAdjacentJalaliMonth(
	year: number,
	month: number,
	direction: 'prev' | 'next',
): JalaliMonthParams {
	const current = newJalaliDate(year, month, 1);
	const adjacent = direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1);

	return {
		year: getJalaliYear(adjacent),
		month: getJalaliMonth(adjacent),
	};
}

export function getDefaultWorkDateForMonth(year: number, month: number): string {
	const { startIso, endIso } = getJalaliMonthRange(year, month);
	const today = getTodayIso();

	if (today >= startIso && today <= endIso) {
		return today;
	}

	return startIso;
}
