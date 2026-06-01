'use client';

import { Download, FileUp, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { JalaliDatePicker } from '@/components/atoms/JalaliDatePicker';
import {
	exportTimesheetCsv,
	importTimesheetCsv,
} from '@/features/timesheet/actions/timesheet-csv.actions';
import { downloadCsvFile, buildTimesheetTemplateCsv } from '@/features/timesheet/csv/timesheet-csv.utils';
import { TIMESHEET_CSV_TEMPLATE_FILENAME } from '@/features/timesheet/csv/timesheet-csv.constants';
import { toFaNumber } from '@/lib/locale/persian-digits';

interface ITimesheetCsvPanelProps {
	projectId: string;
	defaultStartDate: string;
	defaultEndDate: string;
}

export function TimesheetCsvPanel({
	projectId,
	defaultStartDate,
	defaultEndDate,
}: ITimesheetCsvPanelProps) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [pending, startTransition] = useTransition();
	const [startDate, setStartDate] = useState(defaultStartDate);
	const [endDate, setEndDate] = useState(defaultEndDate);
	const [importErrors, setImportErrors] = useState<string[]>([]);

	const rangeLabel = useMemo(
		() => `${startDate} — ${endDate}`,
		[startDate, endDate],
	);

	const handleDownloadTemplate = () => {
		downloadCsvFile(buildTimesheetTemplateCsv(), TIMESHEET_CSV_TEMPLATE_FILENAME);
		toast.success('قالب CSV دانلود شد.');
	};

	const handleExport = () => {
		if (startDate > endDate) {
			toast.error('تاریخ شروع باید قبل از پایان باشد.');
			return;
		}

		startTransition(async () => {
			const result = await exportTimesheetCsv({ projectId, startDate, endDate });

			if (result.error) {
				toast.error(result.error);
				return;
			}

			if (result.csv && result.filename) {
				downloadCsvFile(result.csv, result.filename);
			}

			if (result.success) {
				toast.success(result.success);
			}
		});
	};

	const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (!file) {
			return;
		}

		const reader = new FileReader();

		reader.onload = () => {
			const content = typeof reader.result === 'string' ? reader.result : '';

			startTransition(async () => {
				const result = await importTimesheetCsv({ projectId, csvContent: content });

				if (result.error) {
					toast.error(result.error);
					setImportErrors(result.errors ?? []);
					return;
				}

				setImportErrors(result.errors ?? []);

				if (result.success) {
					toast.success(result.success);
				}

				if (result.errors && result.errors.length > 0) {
					toast.warning(
						`${toFaNumber(result.skippedCount ?? result.errors.length)} ردیف رد شد — جزئیات پایین.`,
					);
				}

				router.refresh();
			});
		};

		reader.readAsText(file, 'UTF-8');
		event.target.value = '';
	};

	return (
		<Card
			title='ورود و خروج CSV'
			description='بازه دلخواه برای خروجی و بارگذاری با همان قالب'
			className='no-print'
		>
			<div className='space-y-5'>
				<div className='grid gap-3 sm:grid-cols-2'>
					<JalaliDatePicker label='از تاریخ' value={startDate} onChange={setStartDate} />
					<JalaliDatePicker label='تا تاریخ' value={endDate} onChange={setEndDate} />
				</div>

				<p className='text-xs text-muted-foreground'>بازه انتخابی: {rangeLabel}</p>

				<div className='flex flex-col gap-2 sm:flex-row sm:flex-wrap'>
					<Button
						type='button'
						variant='secondary'
						haptic='light'
						disabled={pending}
						onClick={handleDownloadTemplate}
					>
						<Download size={16} aria-hidden />
						دانلود قالب
					</Button>
					<Button
						type='button'
						haptic='medium'
						disabled={pending}
						onClick={handleExport}
					>
						<Upload size={16} aria-hidden />
						{pending ? 'در حال آماده‌سازی…' : 'خروجی CSV'}
					</Button>
					<Button
						type='button'
						variant='secondary'
						haptic='medium'
						disabled={pending}
						onClick={() => fileInputRef.current?.click()}
					>
						<FileUp size={16} aria-hidden />
						ورود CSV
					</Button>
					<input
						ref={fileInputRef}
						type='file'
						accept='.csv,text/csv'
						className='hidden'
						onChange={handleImportFile}
					/>
				</div>

				<div className='rounded-xl bg-muted/50 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground'>
					<p>
						ستون‌ها: <span dir='ltr'>work_date, hours, description</span> — تاریخ میلادی{' '}
						<span dir='ltr'>YYYY-MM-DD</span> · ساعات به صورت <span dir='ltr'>2:30</span> یا{' '}
						<span dir='ltr'>1.5</span>
					</p>
				</div>

				{importErrors.length > 0 && (
					<div className='rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5'>
						<p className='text-xs font-bold text-amber-700 dark:text-amber-300'>ردیف‌های ردشده</p>
						<ul className='mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-muted-foreground'>
							{importErrors.map((error) => (
								<li key={error}>{error}</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</Card>
	);
}
