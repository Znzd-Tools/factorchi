'use client';

import { Download, Settings } from 'lucide-react';

import type { InvoiceBuilderState } from '@/features/invoice/hooks/useInvoiceBuilder';
import { InvoiceBasicInfoSection } from '@/features/invoice/components/sections/InvoiceBasicInfoSection';
import { InvoiceFinancialSection } from '@/features/invoice/components/sections/InvoiceFinancialSection';
import { InvoiceLineItemsSection } from '@/features/invoice/components/sections/InvoiceLineItemsSection';
import { InvoiceOptionalSection } from '@/features/invoice/components/sections/InvoiceOptionalSection';

interface IInvoiceFormProps {
	invoice: InvoiceBuilderState;
}

export function InvoiceForm({ invoice }: IInvoiceFormProps) {
	return (
		<div className='no-print w-full md:w-[450px] lg:w-[500px] bg-white border-l border-slate-200 h-screen overflow-y-auto shrink-0 flex flex-col z-10 shadow-2xl'>
			<div className='p-6 bg-slate-900 text-white sticky top-0 z-20 shadow-md'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-xl font-bold flex items-center gap-2'>
						<Settings size={20} className='text-blue-400' /> تنظیمات فاکتور
					</h2>
					<button
						type='button'
						onClick={invoice.resetToProfessionStep}
						className='text-slate-400 hover:text-white text-sm'
					>
						تغییر شغل
					</button>
				</div>
				<button
					type='button'
					onClick={invoice.handlePrint}
					className='w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors'
				>
					<Download size={20} />
					دریافت فایل PDF فاکتور
				</button>
			</div>

			<div className='p-6 space-y-8 pb-32'>
				<InvoiceBasicInfoSection
					clientName={invoice.clientName}
					invoiceNo={invoice.invoiceNo}
					invoiceDate={invoice.invoiceDate}
					period={invoice.period}
					onClientNameChange={invoice.setClientName}
					onInvoiceNoChange={invoice.setInvoiceNo}
					onInvoiceDateChange={invoice.setInvoiceDate}
					onPeriodChange={invoice.setPeriod}
				/>

				<InvoiceFinancialSection
					currency={invoice.currency}
					hourlyRate={invoice.hourlyRate}
					onCurrencyChange={invoice.setCurrency}
					onHourlyRateChange={invoice.handleHourlyRateChange}
				/>

				<InvoiceLineItemsSection
					items={invoice.items}
					currency={invoice.currency}
					onAddItem={invoice.handleAddItem}
					onRemoveItem={invoice.handleRemoveItem}
					onItemChange={invoice.handleItemChange}
				/>

				<InvoiceOptionalSection
					currency={invoice.currency}
					taxEnabled={invoice.taxEnabled}
					taxRate={invoice.taxRate}
					altCurrencyEnabled={invoice.altCurrencyEnabled}
					altCurrency={invoice.altCurrency}
					exchangeMethod={invoice.exchangeMethod}
					exchangeRate={invoice.exchangeRate}
					paymentEnabled={invoice.paymentEnabled}
					paymentType={invoice.paymentType}
					bankInfo={invoice.bankInfo}
					cryptoInfo={invoice.cryptoInfo}
					onTaxEnabledChange={invoice.setTaxEnabled}
					onTaxRateChange={invoice.handleTaxRateChange}
					onAltCurrencyEnabledChange={invoice.setAltCurrencyEnabled}
					onAltCurrencyChange={invoice.setAltCurrency}
					onExchangeMethodChange={invoice.setExchangeMethod}
					onExchangeRateChange={invoice.handleExchangeRateChange}
					onPaymentEnabledChange={invoice.setPaymentEnabled}
					onPaymentTypeChange={invoice.setPaymentType}
					onBankInfoChange={invoice.updateBankInfo}
					onCryptoInfoChange={invoice.updateCryptoInfo}
				/>
			</div>
		</div>
	);
}
