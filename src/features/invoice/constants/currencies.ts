import type { CurrencyCode, ICurrencyConfig } from '@/features/invoice/interface/invoice.types';

export const CURRENCIES: Record<CurrencyCode, ICurrencyConfig> = {
	toman: { label: 'تومان', symbol: 'تومان' },
	rial: { label: 'ریال', symbol: 'ریال' },
	usd: { label: 'دلار', symbol: '$' },
	eur: { label: 'یورو', symbol: '€' },
	try: { label: 'لیر', symbol: '₺' },
};
