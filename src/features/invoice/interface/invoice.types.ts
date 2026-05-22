export type CurrencyCode = 'toman' | 'rial' | 'usd' | 'eur' | 'try';

export type Profession = 'freelancer';

export type ItemType = 'hourly' | 'fixed';

export type PaymentType = 'bank' | 'crypto';

export type ExchangeMethod = 'divide' | 'multiply';

export interface ICurrencyConfig {
	label: string;
	symbol: string;
}

export interface IInvoiceItem {
	id: number;
	title: string;
	type: ItemType;
	value: number | string;
}

export interface IBankInfo {
	bankName: string;
	accountName: string;
	cardNumber: string;
	accountNumber: string;
}

export interface ICryptoInfo {
	coin: string;
	network: string;
	address: string;
}

export interface IInvoiceCalculations {
	subtotal: number;
	taxAmount: number;
	total: number;
	altTotal: number;
}
