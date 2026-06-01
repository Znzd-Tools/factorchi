import { ROUTES } from '@/config/routes';

export function buildMonthlyWrappedHref(year: number, month: number): string {
	const params = new URLSearchParams({
		year: String(year),
		month: String(month),
	});

	return `${ROUTES.monthlyWrapped}?${params.toString()}`;
}
