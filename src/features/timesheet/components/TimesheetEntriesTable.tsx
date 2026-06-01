import { Card } from '@/components/atoms/Card';
import { TimesheetCreateEntry } from '@/features/timesheet/components/TimesheetCreateEntry';
import { TimesheetRowActions } from '@/features/timesheet/components/TimesheetRowActions';
import { aggregateMonthly, entryAmount } from '@/features/timesheet/utils/aggregate';
import { formatHoursAsDurationFa } from '@/lib/duration';
import { formatJalaliDate } from '@/lib/jalali';
import { getCurrencyLabel } from '@/features/invoice/constants/currencies';
import { toFaNumber } from '@/lib/locale/persian-digits';
import { formatMoney } from '@/lib/money';
import type { TimeEntry } from '@/lib/supabase/database.types';

interface ITimesheetEntriesTableProps {
	projectId: string;
	currency: string;
	year: number;
	month: number;
	entries: TimeEntry[];
}

export function TimesheetEntriesTable({
	projectId,
	currency,
	year,
	month,
	entries,
}: ITimesheetEntriesTableProps) {
	const totals = aggregateMonthly(
		entries.map((entry) => ({
			hours: Number(entry.hours),
			rate_at_entry: Number(entry.rate_at_entry),
		})),
	);
	const currencyLabel = getCurrencyLabel(currency);

	return (
		<Card
			title='ردیف‌های ماه'
			description={`${toFaNumber(totals.entryCount)} ردیف — ${formatHoursAsDurationFa(totals.totalHours)} — ${formatMoney(totals.totalAmount)} ${currencyLabel}`}
		>
			<TimesheetCreateEntry projectId={projectId} year={year} month={month} />

			{entries.length === 0 ? (
				<p className='py-8 text-center text-sm text-muted-foreground'>
					برای این ماه ساعتی ثبت نشده است.
				</p>
			) : (
				<>
					<div className='space-y-3 md:hidden'>
						{entries.map((entry) => {
							const hours = Number(entry.hours);
							const rate = Number(entry.rate_at_entry);
							const amount = entryAmount({ hours, rate_at_entry: rate });

							return (
								<div
									key={entry.id}
									className='rounded-xl border border-border bg-muted/30 p-4'
								>
									<div className='flex items-start justify-between gap-3'>
										<div>
											<p className='font-bold tabular-nums text-foreground'>
												{formatJalaliDate(entry.work_date)}
											</p>
											<p className='mt-1 text-sm text-muted-foreground' dir='ltr'>
												{formatHoursAsDurationFa(hours)} · {formatMoney(rate)}
											</p>
										</div>
										<p className='font-black tabular-nums text-foreground'>
											{formatMoney(amount)}
										</p>
									</div>
									{entry.description && (
										<p className='mt-2 text-sm text-muted-foreground'>{entry.description}</p>
									)}
									<div className='mt-3 flex justify-end border-t border-border pt-3'>
										<TimesheetRowActions projectId={projectId} entry={entry} />
									</div>
								</div>
							);
						})}
					</div>

					<div className='hidden overflow-x-auto md:block'>
						<table className='w-full min-w-[640px] text-sm'>
							<thead>
								<tr className='border-b border-border text-muted-foreground'>
									<th className='px-3 py-2 text-right font-medium'>تاریخ</th>
									<th className='px-3 py-2 text-right font-medium'>ساعات</th>
									<th className='px-3 py-2 text-right font-medium'>نرخ</th>
									<th className='px-3 py-2 text-right font-medium'>مبلغ</th>
									<th className='px-3 py-2 text-right font-medium'>توضیحات</th>
									<th className='px-3 py-2 text-left font-medium'>عملیات</th>
								</tr>
							</thead>
							<tbody>
								{entries.map((entry) => {
									const hours = Number(entry.hours);
									const rate = Number(entry.rate_at_entry);

									return (
										<tr key={entry.id} className='border-b border-border last:border-0'>
											<td className='px-3 py-3 tabular-nums'>
												{formatJalaliDate(entry.work_date)}
											</td>
											<td className='px-3 py-3 tabular-nums' dir='ltr'>
												{formatHoursAsDurationFa(hours)}
											</td>
											<td className='px-3 py-3 tabular-nums'>{formatMoney(rate)}</td>
											<td className='px-3 py-3 tabular-nums'>
												{formatMoney(entryAmount({ hours, rate_at_entry: rate }))}
											</td>
											<td className='max-w-xs truncate px-3 py-3 text-muted-foreground'>
												{entry.description || '—'}
											</td>
											<td className='px-3 py-3'>
												<TimesheetRowActions projectId={projectId} entry={entry} />
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</>
			)}
		</Card>
	);
}
