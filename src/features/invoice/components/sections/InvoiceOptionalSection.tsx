import { Settings } from 'lucide-react';

import { CURRENCIES } from '@/features/invoice/constants/currencies';
import type {
	CurrencyCode,
	ExchangeMethod,
	IBankInfo,
	ICryptoInfo,
	PaymentType,
} from '@/features/invoice/interface/invoice.types';
import { toFa } from '@/features/invoice/utils/format';

interface IInvoiceOptionalSectionProps {
	currency: CurrencyCode;
	taxEnabled: boolean;
	taxRate: number | '';
	altCurrencyEnabled: boolean;
	altCurrency: CurrencyCode;
	exchangeMethod: ExchangeMethod;
	exchangeRate: number | '';
	paymentEnabled: boolean;
	paymentType: PaymentType;
	bankInfo: IBankInfo;
	cryptoInfo: ICryptoInfo;
	onTaxEnabledChange: (enabled: boolean) => void;
	onTaxRateChange: (value: string) => void;
	onAltCurrencyEnabledChange: (enabled: boolean) => void;
	onAltCurrencyChange: (value: CurrencyCode) => void;
	onExchangeMethodChange: (value: ExchangeMethod) => void;
	onExchangeRateChange: (value: string) => void;
	onPaymentEnabledChange: (enabled: boolean) => void;
	onPaymentTypeChange: (value: PaymentType) => void;
	onBankInfoChange: (field: keyof IBankInfo, value: string) => void;
	onCryptoInfoChange: (field: keyof ICryptoInfo, value: string) => void;
}

export function InvoiceOptionalSection({
	currency,
	taxEnabled,
	taxRate,
	altCurrencyEnabled,
	altCurrency,
	exchangeMethod,
	exchangeRate,
	paymentEnabled,
	paymentType,
	bankInfo,
	cryptoInfo,
	onTaxEnabledChange,
	onTaxRateChange,
	onAltCurrencyEnabledChange,
	onAltCurrencyChange,
	onExchangeMethodChange,
	onExchangeRateChange,
	onPaymentEnabledChange,
	onPaymentTypeChange,
	onBankInfoChange,
	onCryptoInfoChange,
}: IInvoiceOptionalSectionProps) {
	return (
		<section className='space-y-4'>
			<h3 className='font-bold text-slate-800 flex items-center gap-2 border-b pb-2'>
				<Settings size={18} /> گزینه‌های اختیاری
			</h3>

			<div className='bg-slate-50 p-4 rounded-xl border border-slate-100'>
				<label className='flex items-center gap-2 cursor-pointer mb-2'>
					<input
						type='checkbox'
						checked={taxEnabled}
						onChange={(event) => onTaxEnabledChange(event.target.checked)}
						className='w-4 h-4 text-blue-600'
					/>
					<span className='font-bold text-sm text-slate-700'>محاسبه مالیات / ارزش افزوده</span>
				</label>
				{taxEnabled && (
					<div className='mt-3 flex items-center gap-2'>
						<span className='text-sm text-slate-500'>درصد مالیات:</span>
						<input
							type='text'
							value={toFa(taxRate)}
							onChange={(event) => onTaxRateChange(event.target.value)}
							className='w-20 p-1.5 border border-slate-200 rounded-lg text-center tabular-nums'
						/>{' '}
						%
					</div>
				)}
			</div>

			<div className='bg-slate-50 p-4 rounded-xl border border-slate-100'>
				<label className='flex items-center gap-2 cursor-pointer mb-2'>
					<input
						type='checkbox'
						checked={altCurrencyEnabled}
						onChange={(event) => onAltCurrencyEnabledChange(event.target.checked)}
						className='w-4 h-4 text-blue-600'
					/>
					<span className='font-bold text-sm text-slate-700'>نمایش معادل ارزی دیگر</span>
				</label>
				{altCurrencyEnabled && (
					<div className='mt-3 space-y-3'>
						<div className='flex gap-2'>
							<select
								value={altCurrency}
								onChange={(event) => onAltCurrencyChange(event.target.value as CurrencyCode)}
								className='w-1/3 p-2 bg-white border border-slate-200 rounded-lg text-sm'
							>
								{Object.entries(CURRENCIES)
									.filter(([key]) => key !== currency)
									.map(([key, value]) => (
										<option key={key} value={key}>
											{value.label}
										</option>
									))}
							</select>
							<select
								value={exchangeMethod}
								onChange={(event) =>
									onExchangeMethodChange(event.target.value as ExchangeMethod)
								}
								className='w-1/3 p-2 bg-white border border-slate-200 rounded-lg text-sm'
							>
								<option value='divide'>تقسیم بر</option>
								<option value='multiply'>ضرب در</option>
							</select>
							<input
								type='text'
								value={toFa(exchangeRate)}
								onChange={(event) => onExchangeRateChange(event.target.value)}
								placeholder='نرخ تبدیل'
								className='w-1/3 p-2 bg-white border border-slate-200 rounded-lg text-sm tabular-nums'
							/>
						</div>
						<p className='text-xs text-slate-400'>
							فرمول: مبلغ کل فاکتور ({CURRENCIES[currency].symbol}){' '}
							{exchangeMethod === 'divide' ? '÷' : '×'} {toFa(exchangeRate)} = مبلغ معادل (
							{CURRENCIES[altCurrency].symbol})
						</p>
					</div>
				)}
			</div>

			<div className='bg-slate-50 p-4 rounded-xl border border-slate-100'>
				<label className='flex items-center gap-2 cursor-pointer mb-2'>
					<input
						type='checkbox'
						checked={paymentEnabled}
						onChange={(event) => onPaymentEnabledChange(event.target.checked)}
						className='w-4 h-4 text-blue-600'
					/>
					<span className='font-bold text-sm text-slate-700'>اطلاعات پرداخت</span>
				</label>
				{paymentEnabled && (
					<div className='mt-3 space-y-4'>
						<div className='flex gap-4 border-b border-slate-200 pb-3'>
							<label className='flex items-center gap-1 cursor-pointer'>
								<input
									type='radio'
									checked={paymentType === 'bank'}
									onChange={() => onPaymentTypeChange('bank')}
									className='text-blue-600'
								/>
								<span className='text-sm text-slate-600'>حساب بانکی</span>
							</label>
							<label className='flex items-center gap-1 cursor-pointer'>
								<input
									type='radio'
									checked={paymentType === 'crypto'}
									onChange={() => onPaymentTypeChange('crypto')}
									className='text-blue-600'
								/>
								<span className='text-sm text-slate-600'>ارز دیجیتال (کریپتو)</span>
							</label>
						</div>

						{paymentType === 'bank' && (
							<div className='space-y-3'>
								<div className='grid grid-cols-2 gap-2'>
									<input
										type='text'
										placeholder='نام بانک (مثلا سامان)'
										value={bankInfo.bankName}
										onChange={(event) => onBankInfoChange('bankName', event.target.value)}
										className='w-full p-2 border border-slate-200 rounded-lg text-sm'
									/>
									<input
										type='text'
										placeholder='نام صاحب حساب'
										value={bankInfo.accountName}
										onChange={(event) => onBankInfoChange('accountName', event.target.value)}
										className='w-full p-2 border border-slate-200 rounded-lg text-sm'
									/>
								</div>
								<input
									type='text'
									placeholder='شماره کارت'
									value={bankInfo.cardNumber}
									onChange={(event) => onBankInfoChange('cardNumber', event.target.value)}
									className='w-full p-2 border border-slate-200 rounded-lg text-sm text-left'
									dir='ltr'
								/>
								<input
									type='text'
									placeholder='شماره شبا / حساب'
									value={bankInfo.accountNumber}
									onChange={(event) => onBankInfoChange('accountNumber', event.target.value)}
									className='w-full p-2 border border-slate-200 rounded-lg text-sm text-left'
									dir='ltr'
								/>
							</div>
						)}

						{paymentType === 'crypto' && (
							<div className='space-y-3'>
								<div className='grid grid-cols-2 gap-2'>
									<input
										type='text'
										placeholder='نوع ارز (مثلاً USDT)'
										value={cryptoInfo.coin}
										onChange={(event) => onCryptoInfoChange('coin', event.target.value)}
										className='w-full p-2 border border-slate-200 rounded-lg text-sm text-left'
										dir='ltr'
									/>
									<input
										type='text'
										placeholder='شبکه (مثلاً TRC20)'
										value={cryptoInfo.network}
										onChange={(event) => onCryptoInfoChange('network', event.target.value)}
										className='w-full p-2 border border-slate-200 rounded-lg text-sm text-left'
										dir='ltr'
									/>
								</div>
								<input
									type='text'
									placeholder='آدرس کیف پول'
									value={cryptoInfo.address}
									onChange={(event) => onCryptoInfoChange('address', event.target.value)}
									className='w-full p-2 border border-slate-200 rounded-lg text-sm text-left'
									dir='ltr'
								/>
							</div>
						)}
					</div>
				)}
			</div>
		</section>
	);
}
