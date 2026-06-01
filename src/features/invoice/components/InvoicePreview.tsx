import { Calendar, CreditCard } from 'lucide-react';

import { CURRENCIES } from '@/features/invoice/constants/currencies';
import type { InvoiceBuilderState } from '@/features/invoice/hooks/useInvoiceBuilder';
import { calculateItemTotal } from '@/features/invoice/utils/calculations';
import { toFa } from '@/features/invoice/utils/format';

interface IInvoicePreviewProps {
	invoice: InvoiceBuilderState;
}

export function InvoicePreview({ invoice }: IInvoicePreviewProps) {
	const {
		clientName,
		invoiceNo,
		invoiceDate,
		period,
		hourlyRate,
		currency,
		items,
		paymentEnabled,
		paymentType,
		bankInfo,
		cryptoInfo,
		taxEnabled,
		taxRate,
		altCurrencyEnabled,
		altCurrency,
		calculations,
	} = invoice;

	const { subtotal, taxAmount, total, altTotal } = calculations;
	const hasBankInfo =
		bankInfo.bankName || bankInfo.accountName || bankInfo.cardNumber || bankInfo.accountNumber;
	const hasCryptoInfo = cryptoInfo.coin || cryptoInfo.network || cryptoInfo.address;

	return (
		<div className='flex-1 overflow-y-auto bg-slate-200 flex justify-center py-10 print:py-0 print:bg-white p-4'>
			<div
				id='invoice-preview'
				className='print-area bg-white shadow-2xl rounded-sm w-[210mm] min-h-[297mm] p-[15mm] relative box-border'
			>
				<div className='flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8'>
					<div>
						<h1 className='text-4xl font-black text-slate-900 tracking-tight mb-2'>
							صورت‌حساب خدمات
						</h1>
						<p className='text-slate-500 font-medium'>فاکتور خدمات</p>
					</div>
					<div className='text-left space-y-1'>
						<div className='flex items-center justify-end gap-2 text-sm'>
							<span className='text-slate-500'>شماره فاکتور:</span>
							<span className='font-bold text-slate-800 tabular-nums' dir='ltr'>
								{invoiceNo}
							</span>
						</div>
						<div className='flex items-center justify-end gap-2 text-sm'>
							<span className='text-slate-500'>تاریخ:</span>
							<span className='font-bold text-slate-800 tabular-nums'>{invoiceDate}</span>
						</div>
					</div>
				</div>

				<div className='mb-10 bg-slate-50 p-6 rounded-2xl'>
					<div>
						<h4 className='text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider'>
							صورت‌حساب برای
						</h4>
						<p className='text-xl font-bold text-slate-800'>{clientName || '---'}</p>
						{period && (
							<div className='mt-3 flex items-center gap-2 text-sm text-slate-600 bg-white inline-flex px-3 py-1.5 rounded-lg border border-slate-100'>
								<Calendar size={16} className='text-blue-500' />
								<span>بازه کاری:</span>
								<span className='font-bold'>{period}</span>
							</div>
						)}
					</div>
				</div>

				<div className='mb-10 rounded-2xl overflow-hidden border border-slate-200'>
					<table className='w-full text-right border-collapse'>
						<thead>
							<tr className='bg-slate-100'>
								<th className='py-4 px-5 text-slate-600 font-bold w-12 text-center'>ردیف</th>
								<th className='py-4 px-5 text-slate-600 font-bold'>شرح خدمات</th>
								<th className='py-4 px-5 text-slate-600 font-bold text-center w-24'>نوع</th>
								<th className='py-4 px-5 text-slate-600 font-bold text-center w-32'>
									مقدار/ساعت
								</th>
								<th className='py-4 px-5 text-slate-600 font-bold text-left w-48'>
									مبلغ کل ({CURRENCIES[currency].symbol})
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-100'>
							{items.map((item, index) => (
								<tr key={item.id} className='bg-white'>
									<td className='py-4 px-5 text-center text-slate-500 tabular-nums'>
										{toFa(index + 1)}
									</td>
									<td className='py-4 px-5 font-bold text-slate-800'>{item.title || '---'}</td>
									<td className='py-4 px-5 text-center'>
										<span
											className={`text-xs px-2 py-1 rounded-md font-medium ${
												item.type === 'hourly'
													? 'bg-blue-50 text-blue-700'
													: 'bg-purple-50 text-purple-700'
											}`}
										>
											{item.type === 'hourly' ? 'ساعتی' : 'ثابت'}
										</span>
									</td>
									<td className='py-4 px-5 text-center font-bold text-slate-700 tabular-nums'>
										{item.type === 'hourly' ? toFa(item.value) : '-'}
									</td>
									<td className='py-4 px-5 text-left font-bold text-slate-800 tabular-nums'>
										{toFa(calculateItemTotal(item, hourlyRate))}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className='flex flex-col sm:flex-row justify-between items-end gap-10'>
					<div className='w-full sm:w-1/2'>
						{paymentEnabled && (
							<div className='bg-blue-50/50 p-5 rounded-2xl border border-blue-100'>
								<h4 className='flex items-center gap-2 text-blue-800 font-bold mb-3 text-sm'>
									<CreditCard size={18} /> اطلاعات پرداخت
								</h4>

								{paymentType === 'bank' ? (
									<div className='space-y-2 text-sm text-slate-700'>
										{bankInfo.bankName && (
											<div>
												<span className='text-slate-500'>بانک:</span>{' '}
												<span className='font-bold px-1'>{bankInfo.bankName}</span>
											</div>
										)}
										{bankInfo.accountName && (
											<div>
												<span className='text-slate-500'>صاحب حساب:</span>{' '}
												<span className='font-bold px-1'>{bankInfo.accountName}</span>
											</div>
										)}
										{bankInfo.cardNumber && (
											<div className='flex items-center gap-2'>
												<span className='text-slate-500'>شماره کارت:</span>{' '}
												<span className='font-bold tabular-nums' dir='ltr'>
													{bankInfo.cardNumber}
												</span>
											</div>
										)}
										{bankInfo.accountNumber && (
											<div className='flex items-center gap-2'>
												<span className='text-slate-500'>شماره شبا/حساب:</span>{' '}
												<span className='font-bold tabular-nums' dir='ltr'>
													{bankInfo.accountNumber}
												</span>
											</div>
										)}
										{!hasBankInfo && (
											<span className='text-slate-400 text-xs'>
												اطلاعات بانکی وارد نشده است
											</span>
										)}
									</div>
								) : (
									<div className='space-y-2 text-sm text-slate-700'>
										{cryptoInfo.coin && (
											<div>
												<span className='text-slate-500'>ارز:</span>{' '}
												<span className='font-bold uppercase px-1'>{cryptoInfo.coin}</span>
											</div>
										)}
										{cryptoInfo.network && (
											<div>
												<span className='text-slate-500'>شبکه:</span>{' '}
												<span className='font-bold px-1'>{cryptoInfo.network}</span>
											</div>
										)}
										{cryptoInfo.address && (
											<div className='mt-2'>
												<div className='text-slate-500 mb-1 text-xs'>آدرس کیف پول:</div>
												<div
													className='font-bold text-xs bg-white p-2 rounded-lg border border-blue-100 break-all tabular-nums'
													dir='ltr'
												>
													{cryptoInfo.address}
												</div>
											</div>
										)}
										{!hasCryptoInfo && (
											<span className='text-slate-400 text-xs'>اطلاعات کیف پول وارد نشده است</span>
										)}
									</div>
								)}
							</div>
						)}
					</div>

					<div className='w-full sm:w-1/2 max-w-sm space-y-3'>
						<div className='flex justify-between items-center text-slate-600 px-4'>
							<span>جمع کل:</span>
							<span className='font-bold tabular-nums'>
								{toFa(subtotal)} {CURRENCIES[currency].symbol}
							</span>
						</div>

						{taxEnabled && (
							<div className='flex justify-between items-center text-slate-600 px-4'>
								<span className='flex items-center gap-1'>
									مالیات{' '}
									<span className='text-xs bg-slate-200 px-1.5 rounded text-slate-600'>
										{toFa(taxRate)}%
									</span>
									:
								</span>
								<span className='font-bold tabular-nums'>
									{toFa(taxAmount)} {CURRENCIES[currency].symbol}
								</span>
							</div>
						)}

						<div className='flex justify-between items-center bg-slate-900 text-white p-5 rounded-2xl mt-4 shadow-lg'>
							<span className='font-bold text-lg'>مبلغ نهایی:</span>
							<span className='font-black text-2xl tabular-nums text-left'>
								{toFa(total)}{' '}
								<span className='text-sm font-normal opacity-70'>
									{CURRENCIES[currency].symbol}
								</span>
							</span>
						</div>

						{altCurrencyEnabled && (
							<div className='flex justify-between items-center bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 mt-2'>
								<span className='font-bold text-sm'>معادل ارزی:</span>
								<span className='font-black text-lg tabular-nums text-left'>
									{toFa(altTotal.toFixed(2))}{' '}
									<span className='text-xs font-normal opacity-70'>
										{CURRENCIES[altCurrency].symbol}
									</span>
								</span>
							</div>
						)}
					</div>
				</div>

				<div className='absolute bottom-8 left-[15mm] right-[15mm] text-center border-t border-slate-200 pt-6 text-sm text-slate-400'>
					ایجاد شده توسط سیستم فاکتورساز - بدون نیاز به دیتابیس
				</div>
			</div>
		</div>
	);
}
