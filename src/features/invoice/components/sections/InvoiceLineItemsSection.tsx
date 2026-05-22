import { Briefcase, Plus, Trash2 } from 'lucide-react';

import { CURRENCIES } from '@/features/invoice/constants/currencies';
import type { CurrencyCode, IInvoiceItem } from '@/features/invoice/interface/invoice.types';
import { toFa } from '@/features/invoice/utils/format';

interface IInvoiceLineItemsSectionProps {
	items: IInvoiceItem[];
	currency: CurrencyCode;
	onAddItem: () => void;
	onRemoveItem: (id: number) => void;
	onItemChange: (
		id: number,
		field: keyof Pick<IInvoiceItem, 'title' | 'type' | 'value'>,
		value: string,
	) => void;
}

export function InvoiceLineItemsSection({
	items,
	currency,
	onAddItem,
	onRemoveItem,
	onItemChange,
}: IInvoiceLineItemsSectionProps) {
	return (
		<section className='space-y-4'>
			<div className='flex justify-between items-center border-b pb-2'>
				<h3 className='font-bold text-slate-800 flex items-center gap-2'>
					<Briefcase size={18} /> خدمات / اقلام
				</h3>
			</div>

			<div className='space-y-3'>
				{items.map((item) => (
					<div
						key={item.id}
						className='p-3 bg-slate-50 border border-slate-100 rounded-xl relative group'
					>
						<button
							type='button'
							onClick={() => onRemoveItem(item.id)}
							className='absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
						>
							<Trash2 size={14} />
						</button>
						<div className='mb-2'>
							<input
								type='text'
								placeholder='عنوان خدمت...'
								value={item.title}
								onChange={(event) => onItemChange(item.id, 'title', event.target.value)}
								className='w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold'
							/>
						</div>
						<div className='flex gap-2'>
							<select
								value={item.type}
								onChange={(event) => onItemChange(item.id, 'type', event.target.value)}
								className='w-1/3 p-2 bg-white border border-slate-200 rounded-lg text-sm'
							>
								<option value='hourly'>ساعتی</option>
								<option value='fixed'>مبلغ ثابت</option>
							</select>

							<div className='w-2/3 relative'>
								<input
									type='text'
									placeholder={item.type === 'hourly' ? 'تعداد ساعت' : 'مبلغ کل'}
									value={toFa(item.value)}
									onChange={(event) => onItemChange(item.id, 'value', event.target.value)}
									className='w-full p-2 bg-white border border-slate-200 rounded-lg text-sm tabular-nums ps-8'
								/>
								<span className='absolute start-3 top-2.5 text-xs text-slate-400'>
									{item.type === 'hourly' ? 'ساعت' : CURRENCIES[currency].symbol}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>

			<button
				type='button'
				onClick={onAddItem}
				className='w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl font-bold flex justify-center items-center gap-1 hover:bg-blue-50 transition-colors'
			>
				<Plus size={18} /> افزودن ردیف جدید
			</button>
		</section>
	);
}
