import type {
	ExchangeMethod,
	IInvoiceCalculations,
	IInvoiceItem,
} from '@/features/invoice/interface/invoice.types';

export const calculateItemTotal = (
	item: IInvoiceItem,
	hourlyRate: number | '',
): number => {
	if (item.type === 'hourly') {
		return (Number(item.value) || 0) * (Number(hourlyRate) || 0);
	}

	return Number(item.value) || 0;
};

export const calculateInvoiceTotals = ({
	items,
	hourlyRate,
	taxEnabled,
	taxRate,
	exchangeMethod,
	exchangeRate,
}: {
	items: IInvoiceItem[];
	hourlyRate: number | '';
	taxEnabled: boolean;
	taxRate: number | '';
	exchangeMethod: ExchangeMethod;
	exchangeRate: number | '';
}): IInvoiceCalculations => {
	const subtotal = items.reduce(
		(sum, item) => sum + calculateItemTotal(item, hourlyRate),
		0,
	);
	const taxAmount = taxEnabled ? subtotal * ((Number(taxRate) || 0) / 100) : 0;
	const total = subtotal + taxAmount;
	const altTotal =
		exchangeMethod === 'divide'
			? total / (Number(exchangeRate) || 1)
			: total * (Number(exchangeRate) || 1);

	return { subtotal, taxAmount, total, altTotal };
};
