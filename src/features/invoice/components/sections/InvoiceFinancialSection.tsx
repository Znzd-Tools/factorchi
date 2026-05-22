import { DollarSign } from 'lucide-react';

import { CURRENCIES } from '@/features/invoice/constants/currencies';
import type { CurrencyCode } from '@/features/invoice/interface/invoice.types';
import { toFa } from '@/features/invoice/utils/format';

interface IInvoiceFinancialSectionProps {
	currency: CurrencyCode;
	hourlyRate: number | '';
	onCurrencyChange: (value: CurrencyCode) => void;
	onHourlyRateChange: (value: string) => void;
}

export function InvoiceFinancialSection({
	currency,
	hourlyRate,
	onCurrencyChange,
	onHourlyRateChange,
}: IInvoiceFinancialSectionProps) {
	return (
		<section className='space-y-4'>
			<h3 className='font-bold text-slate-800 flex items-center gap-2 border-b pb-2'>
				<DollarSign size={18} /> تنظیمات مالی
			</h3>

			<div className='grid grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm text-slate-500 mb-1'>ارز پایه</label>
					<select
						value={currency}
						onChange={(event) => onCurrencyChange(event.target.value as CurrencyCode)}
						className='w-full p-2.5 border border-slate-200 rounded-lg outline-none'
					>
						{Object.entries(CURRENCIES).map(([key, value]) => (
							<option key={key} value={key}>
								{value.label} ({value.symbol})
							</option>
						))}
					</select>
				</div>
				<div>
					<label className='block text-sm text-slate-500 mb-1'>نرخ پایه هر ساعت</label>
					<input
						type='text'
						value={toFa(hourlyRate)}
						onChange={(event) => onHourlyRateChange(event.target.value)}
						className='w-full p-2.5 border border-slate-200 rounded-lg tabular-nums'
					/>
				</div>
			</div>
		</section>
	);
}
