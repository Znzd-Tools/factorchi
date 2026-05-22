'use client';

import { useCallback, useMemo, useState } from 'react';

import type {
	CurrencyCode,
	ExchangeMethod,
	IBankInfo,
	ICryptoInfo,
	IInvoiceItem,
	ItemType,
	PaymentType,
	Profession,
} from '@/features/invoice/interface/invoice.types';
import { calculateInvoiceTotals } from '@/features/invoice/utils/calculations';
import { cleanNumber } from '@/features/invoice/utils/number';

const createInitialItems = (): IInvoiceItem[] => [
	{ id: 1, title: 'شرح خدمت', type: 'hourly', value: '' },
];

export const useInvoiceBuilder = () => {
	const [step, setStep] = useState(1);
	const [profession, setProfession] = useState<Profession>('freelancer');
	const [clientName, setClientName] = useState('شرکت / شخص نمونه');
	const [invoiceNo, setInvoiceNo] = useState('INV-1001');
	const [invoiceDate, setInvoiceDate] = useState(new Date().toLocaleDateString('fa-IR'));
	const [period, setPeriod] = useState('');
	const [currency, setCurrency] = useState<CurrencyCode>('toman');
	const [hourlyRate, setHourlyRate] = useState<number | ''>(500000);
	const [items, setItems] = useState<IInvoiceItem[]>(createInitialItems);
	const [taxEnabled, setTaxEnabled] = useState(false);
	const [taxRate, setTaxRate] = useState<number | ''>(9);
	const [paymentEnabled, setPaymentEnabled] = useState(true);
	const [paymentType, setPaymentType] = useState<PaymentType>('bank');
	const [bankInfo, setBankInfo] = useState<IBankInfo>({
		bankName: '',
		accountName: '',
		cardNumber: '',
		accountNumber: '',
	});
	const [cryptoInfo, setCryptoInfo] = useState<ICryptoInfo>({
		coin: 'USDT',
		network: 'TRC20',
		address: '',
	});
	const [altCurrencyEnabled, setAltCurrencyEnabled] = useState(false);
	const [altCurrency, setAltCurrency] = useState<CurrencyCode>('usd');
	const [exchangeRate, setExchangeRate] = useState<number | ''>(60000);
	const [exchangeMethod, setExchangeMethod] = useState<ExchangeMethod>('divide');

	const calculations = useMemo(
		() =>
			calculateInvoiceTotals({
				items,
				hourlyRate,
				taxEnabled,
				taxRate,
				exchangeMethod,
				exchangeRate,
			}),
		[items, hourlyRate, taxEnabled, taxRate, exchangeMethod, exchangeRate],
	);

	const selectFreelancerProfession = useCallback(() => {
		setProfession('freelancer');
		setStep(2);
	}, []);

	const resetToProfessionStep = useCallback(() => {
		setStep(1);
	}, []);

	const handleAddItem = useCallback(() => {
		setItems((currentItems) => [
			...currentItems,
			{ id: Date.now(), title: '', type: 'hourly', value: 0 },
		]);
	}, []);

	const handleRemoveItem = useCallback((id: number) => {
		setItems((currentItems) => currentItems.filter((item) => item.id !== id));
	}, []);

	const handleItemChange = useCallback(
		(id: number, field: keyof Pick<IInvoiceItem, 'title' | 'type' | 'value'>, val: string) => {
			setItems((currentItems) =>
				currentItems.map((item) => {
					if (item.id !== id) {
						return item;
					}

					let processedVal: string | number | ItemType = val;

					if (field === 'value') {
						processedVal = cleanNumber(val);
					}

					if (field === 'type') {
						processedVal = val as ItemType;
					}

					return { ...item, [field]: processedVal };
				}),
			);
		},
		[],
	);

	const handleHourlyRateChange = useCallback((value: string) => {
		setHourlyRate(cleanNumber(value));
	}, []);

	const handleTaxRateChange = useCallback((value: string) => {
		setTaxRate(cleanNumber(value));
	}, []);

	const handleExchangeRateChange = useCallback((value: string) => {
		setExchangeRate(cleanNumber(value));
	}, []);

	const updateBankInfo = useCallback((field: keyof IBankInfo, value: string) => {
		setBankInfo((currentInfo) => ({ ...currentInfo, [field]: value }));
	}, []);

	const updateCryptoInfo = useCallback((field: keyof ICryptoInfo, value: string) => {
		setCryptoInfo((currentInfo) => ({ ...currentInfo, [field]: value }));
	}, []);

	const handlePrint = useCallback(() => {
		window.print();
	}, []);

	return {
		step,
		profession,
		clientName,
		invoiceNo,
		invoiceDate,
		period,
		currency,
		hourlyRate,
		items,
		taxEnabled,
		taxRate,
		paymentEnabled,
		paymentType,
		bankInfo,
		cryptoInfo,
		altCurrencyEnabled,
		altCurrency,
		exchangeRate,
		exchangeMethod,
		calculations,
		setClientName,
		setInvoiceNo,
		setInvoiceDate,
		setPeriod,
		setCurrency,
		setTaxEnabled,
		setPaymentEnabled,
		setPaymentType,
		setAltCurrencyEnabled,
		setAltCurrency,
		setExchangeMethod,
		selectFreelancerProfession,
		resetToProfessionStep,
		handleAddItem,
		handleRemoveItem,
		handleItemChange,
		handleHourlyRateChange,
		handleTaxRateChange,
		handleExchangeRateChange,
		updateBankInfo,
		updateCryptoInfo,
		handlePrint,
	};
};

export type InvoiceBuilderState = ReturnType<typeof useInvoiceBuilder>;
