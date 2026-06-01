'use client';

import { Calendar, CreditCard, Printer } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { getCurrencyLabel, getCurrencySymbol } from '@/features/invoice/constants/currencies';
import type { InvoiceDetail } from '@/features/invoice/interface/invoice-db.types';
import type { CurrencyCode } from '@/features/invoice/interface/invoice.types';
import { formatHoursAsDurationFa } from '@/lib/duration';
import { toFa } from '@/features/invoice/utils/format';
import { normalizeBankDetails } from '@/features/profile/schemas/payment-method.schema';
import { formatJalaliDate } from '@/lib/jalali';
import { formatMoney } from '@/lib/money';

interface IProjectInvoicePreviewProps {
	invoice: InvoiceDetail;
}

interface IBankDetails {
	bankName?: string;
	accountName?: string;
	cardNumber?: string;
	shebaNumber?: string;
	accountNumber?: string;
}

interface ICryptoDetails {
	coin?: string;
	network?: string;
	address?: string;
}

export function ProjectInvoicePreview({ invoice }: IProjectInvoicePreviewProps) {
	const currency = invoice.project.currency as CurrencyCode;
	const currencySymbol = getCurrencySymbol(currency);
	const paymentMethod = invoice.payment_method;
	const bankDetails = normalizeBankDetails(
		(paymentMethod?.details as IBankDetails | undefined) ?? {},
	);
	const cryptoDetails = (paymentMethod?.details as ICryptoDetails | undefined) ?? {};

	const periodLabel =
		invoice.period_start && invoice.period_end
			? `${formatJalaliDate(invoice.period_start)} — ${formatJalaliDate(invoice.period_end)}`
			: invoice.percentage
				? `${invoice.percentage}٪ از مبلغ کل`
				: null;

	const altTotal =
		invoice.alt_currency && invoice.exchange_rate && invoice.exchange_method
			? invoice.exchange_method === 'divide'
				? Number(invoice.total) / Number(invoice.exchange_rate)
				: Number(invoice.total) * Number(invoice.exchange_rate)
			: null;

	const handlePrint = () => {
		window.print();
	};

	return (
		<div className='space-y-4'>
			<div className='no-print flex justify-end'>
				<Button onClick={handlePrint} variant='secondary'>
					<Printer size={18} />
					چاپ فاکتور
				</Button>
			</div>

			<div className='flex justify-center bg-slate-200 py-10 print:bg-white print:py-0'>
				<div
					id='invoice-preview'
					className='print-area relative box-border min-h-[297mm] w-[210mm] rounded-sm bg-white p-[15mm] shadow-2xl'
				>
					<div className='mb-8 flex items-start justify-between border-b-2 border-slate-800 pb-6'>
						<div>
							<h1 className='mb-2 text-4xl font-black tracking-tight text-slate-900'>
								صورت‌حساب خدمات
							</h1>
							{invoice.show_project_name && (
								<p className='font-medium text-slate-500'>{invoice.project.name}</p>
							)}
						</div>
						<div className='space-y-1 text-left'>
							<div className='flex items-center justify-end gap-2 text-sm'>
								<span className='text-slate-500'>شماره فاکتور:</span>
								<span className='font-bold tabular-nums text-slate-800' dir='ltr'>
									{invoice.invoice_no}
								</span>
							</div>
							<div className='flex items-center justify-end gap-2 text-sm'>
								<span className='text-slate-500'>تاریخ:</span>
								<span className='font-bold tabular-nums text-slate-800'>
									{formatJalaliDate(invoice.issue_date)}
								</span>
							</div>
						</div>
					</div>

					<div className='mb-10 rounded-2xl bg-slate-50 p-6'>
						{invoice.show_owner_name && (
							<>
								<h4 className='mb-2 text-xs font-bold uppercase tracking-wider text-slate-400'>
									صورت‌حساب برای
								</h4>
								<p className='text-xl font-bold text-slate-800'>{invoice.project.client_name}</p>
							</>
						)}
						{periodLabel && (
							<div className='mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-1.5 text-sm text-slate-600'>
								<Calendar size={16} className='text-blue-500' />
								<span>بازه کاری:</span>
								<span className='font-bold'>{periodLabel}</span>
							</div>
						)}
					</div>

					<div className='mb-10 overflow-hidden rounded-2xl border border-slate-200'>
						<table className='w-full border-collapse text-right'>
							<thead>
								<tr className='bg-slate-100'>
									<th className='w-12 px-5 py-4 text-center font-bold text-slate-600'>ردیف</th>
									<th className='px-5 py-4 font-bold text-slate-600'>شرح خدمات</th>
									<th className='w-24 px-5 py-4 text-center font-bold text-slate-600'>نوع</th>
									<th className='w-32 px-5 py-4 text-center font-bold text-slate-600'>
										مقدار/ساعت
									</th>
									<th className='w-32 px-5 py-4 text-left font-bold text-slate-600'>
										نرخ ({currencySymbol})
									</th>
									<th className='w-48 px-5 py-4 text-left font-bold text-slate-600'>
										مبلغ کل ({currencySymbol})
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-slate-100'>
								{invoice.line_items.map((item, index) => (
									<tr key={item.id} className='bg-white'>
										<td className='px-5 py-4 text-center tabular-nums text-slate-500'>
											{toFa(index + 1)}
										</td>
										<td className='px-5 py-4 font-bold text-slate-800'>{item.title}</td>
										<td className='px-5 py-4 text-center'>
											<span
												className={`rounded-md px-2 py-1 text-xs font-medium ${
													item.type === 'hourly'
														? 'bg-blue-50 text-blue-700'
														: 'bg-purple-50 text-purple-700'
												}`}
											>
												{item.type === 'hourly' ? 'ساعتی' : 'ثابت'}
											</span>
										</td>
										<td className='px-5 py-4 text-center font-bold tabular-nums text-slate-700' dir='ltr'>
											{item.hours ? formatHoursAsDurationFa(Number(item.hours)) : '—'}
										</td>
										<td className='px-5 py-4 text-left font-bold tabular-nums text-slate-800'>
											{item.rate != null ? formatMoney(item.rate) : '—'}
										</td>
										<td className='px-5 py-4 text-left font-bold tabular-nums text-slate-800'>
											{formatMoney(item.total)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className='flex flex-col items-end justify-between gap-10 sm:flex-row'>
						<div className='w-full sm:w-1/2'>
							{paymentMethod && (
								<div className='rounded-2xl border border-blue-100 bg-blue-50/50 p-5'>
									<h4 className='mb-3 flex items-center gap-2 text-sm font-bold text-blue-800'>
										<CreditCard size={18} /> اطلاعات پرداخت — {paymentMethod.label}
									</h4>

									{paymentMethod.type === 'bank' ? (
										<div className='space-y-2 text-sm text-slate-700'>
											{bankDetails.bankName && (
												<div>
													<span className='text-slate-500'>بانک:</span>{' '}
													<span className='px-1 font-bold'>{bankDetails.bankName}</span>
												</div>
											)}
											{bankDetails.accountName && (
												<div>
													<span className='text-slate-500'>صاحب حساب:</span>{' '}
													<span className='px-1 font-bold'>{bankDetails.accountName}</span>
												</div>
											)}
											{bankDetails.cardNumber && (
												<div className='flex items-center gap-2'>
													<span className='text-slate-500'>شماره کارت:</span>{' '}
													<span className='font-bold tabular-nums' dir='ltr'>
														{bankDetails.cardNumber}
													</span>
												</div>
											)}
											{bankDetails.shebaNumber && (
												<div className='flex items-center gap-2'>
													<span className='text-slate-500'>شماره شبا:</span>{' '}
													<span className='font-bold tabular-nums' dir='ltr'>
														{bankDetails.shebaNumber}
													</span>
												</div>
											)}
											{bankDetails.accountNumber && (
												<div className='flex items-center gap-2'>
													<span className='text-slate-500'>شماره حساب:</span>{' '}
													<span className='font-bold tabular-nums' dir='ltr'>
														{bankDetails.accountNumber}
													</span>
												</div>
											)}
										</div>
									) : (
										<div className='space-y-2 text-sm text-slate-700'>
											{cryptoDetails.coin && (
												<div>
													<span className='text-slate-500'>ارز:</span>{' '}
													<span className='px-1 font-bold uppercase'>{cryptoDetails.coin}</span>
												</div>
											)}
											{cryptoDetails.network && (
												<div>
													<span className='text-slate-500'>شبکه:</span>{' '}
													<span className='px-1 font-bold'>{cryptoDetails.network}</span>
												</div>
											)}
											{cryptoDetails.address && (
												<div className='mt-2'>
													<div className='mb-1 text-xs text-slate-500'>آدرس کیف پول:</div>
													<div
														className='break-all rounded-lg border border-blue-100 bg-white p-2 text-xs font-bold tabular-nums'
														dir='ltr'
													>
														{cryptoDetails.address}
													</div>
												</div>
											)}
										</div>
									)}
								</div>
							)}
						</div>

						<div className='w-full max-w-sm space-y-3 sm:w-1/2'>
							<div className='flex items-center justify-between px-4 text-slate-600'>
								<span>جمع کل:</span>
								<span className='font-bold tabular-nums'>
									{formatMoney(invoice.subtotal)} {currencySymbol}
								</span>
							</div>

							{Number(invoice.tax_rate) > 0 && (
								<div className='flex items-center justify-between px-4 text-slate-600'>
									<span className='flex items-center gap-1'>
										مالیات{' '}
										<span className='rounded bg-slate-200 px-1.5 text-xs text-slate-600'>
											{toFa(invoice.tax_rate)}%
										</span>
										:
									</span>
									<span className='font-bold tabular-nums'>
										{formatMoney(invoice.tax_amount)} {currencySymbol}
									</span>
								</div>
							)}

							<div className='mt-4 flex items-center justify-between rounded-2xl bg-slate-900 p-5 text-white shadow-lg'>
								<span className='text-lg font-bold'>مبلغ نهایی:</span>
								<span className='text-left text-2xl font-black tabular-nums'>
									{formatMoney(invoice.total)}{' '}
									<span className='text-sm font-normal opacity-70'>{currencySymbol}</span>
								</span>
							</div>

							{altTotal !== null && invoice.alt_currency && (
								<div className='mt-2 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800'>
									<span className='text-sm font-bold'>معادل ارزی:</span>
									<span className='text-left text-lg font-black tabular-nums'>
										{toFa(altTotal.toFixed(2))}{' '}
										<span className='text-xs font-normal opacity-70'>
											{getCurrencyLabel(invoice.alt_currency)}
										</span>
									</span>
								</div>
							)}
						</div>
					</div>

					{invoice.notes && (
						<div className='mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600'>
							<span className='font-bold text-slate-800'>یادداشت: </span>
							{invoice.notes}
						</div>
					)}

					<div className='absolute bottom-8 left-[15mm] right-[15mm] border-t border-slate-200 pt-6 text-center text-sm text-slate-400'>
						ایجاد شده توسط فاکتورچی
					</div>
				</div>
			</div>
		</div>
	);
}
