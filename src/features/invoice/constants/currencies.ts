import type { CurrencyCode, ICurrencyConfig } from '@/features/invoice/interface/invoice.types';

export const CURRENCIES: Record<CurrencyCode, ICurrencyConfig> = {
	toman: { label: 'تومان', symbol: 'تومان' },
	rial: { label: 'ریال', symbol: 'ریال' },
	usd: { label: 'دلار', symbol: 'دلار' },
	eur: { label: 'یورو', symbol: 'یورو' },
	try: { label: 'لیر', symbol: 'لیر' },
};

function normalizeCurrencyCode(code: string | null | undefined): CurrencyCode | null {
	if (!code) {
		return null;
	}

	const normalized = code.trim().toLowerCase() as CurrencyCode;

	return normalized in CURRENCIES ? normalized : null;
}

export function getCurrencyLabel(code: string | null | undefined): string {
	const key = normalizeCurrencyCode(code);
	return key ? CURRENCIES[key].label : CURRENCIES.toman.label;
}

export function getCurrencySymbol(code: string | null | undefined): string {
	const key = normalizeCurrencyCode(code);
	return key ? CURRENCIES[key].symbol : CURRENCIES.toman.symbol;
}
