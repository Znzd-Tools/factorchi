import { FileText } from 'lucide-react';

interface IInvoiceBasicInfoSectionProps {
	clientName: string;
	invoiceNo: string;
	invoiceDate: string;
	period: string;
	onClientNameChange: (value: string) => void;
	onInvoiceNoChange: (value: string) => void;
	onInvoiceDateChange: (value: string) => void;
	onPeriodChange: (value: string) => void;
}

export function InvoiceBasicInfoSection({
	clientName,
	invoiceNo,
	invoiceDate,
	period,
	onClientNameChange,
	onInvoiceNoChange,
	onInvoiceDateChange,
	onPeriodChange,
}: IInvoiceBasicInfoSectionProps) {
	return (
		<section className='space-y-4'>
			<h3 className='font-bold text-slate-800 flex items-center gap-2 border-b pb-2'>
				<FileText size={18} /> اطلاعات پایه
			</h3>

			<div>
				<label className='block text-sm text-slate-500 mb-1'>نام مشتری / کارفرما</label>
				<input
					type='text'
					value={clientName}
					onChange={(event) => onClientNameChange(event.target.value)}
					className='w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all'
				/>
			</div>

			<div className='grid grid-cols-2 gap-4'>
				<div>
					<label className='block text-sm text-slate-500 mb-1'>شماره فاکتور</label>
					<input
						type='text'
						value={invoiceNo}
						onChange={(event) => onInvoiceNoChange(event.target.value)}
						className='w-full p-2.5 border border-slate-200 rounded-lg tabular-nums'
						dir='ltr'
					/>
				</div>
				<div>
					<label className='block text-sm text-slate-500 mb-1'>تاریخ فاکتور</label>
					<input
						type='text'
						value={invoiceDate}
						onChange={(event) => onInvoiceDateChange(event.target.value)}
						className='w-full p-2.5 border border-slate-200 rounded-lg'
					/>
				</div>
			</div>

			<div>
				<label className='block text-sm text-slate-500 mb-1'>بازه زمانی کار (اختیاری)</label>
				<input
					type='text'
					value={period}
					onChange={(event) => onPeriodChange(event.target.value)}
					placeholder='مثلا: مهر ۱۴۰۲ تا آبان ۱۴۰۲'
					className='w-full p-2.5 border border-slate-200 rounded-lg'
				/>
			</div>
		</section>
	);
}
