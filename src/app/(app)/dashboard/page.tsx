import Link from 'next/link';
import {
	Clock,
	FileText,
	FolderKanban,
	PartyPopper,
	Sparkles,
	TrendingUp,
	Wallet,
	Zap,
} from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { ROUTES } from '@/config/routes';
import {
	computeGlobalDashboardStats,
	getDashboardGreeting,
	getFunInsight,
} from '@/features/dashboard/utils/stats';
import {
	formatJalaliMonthLabel,
	getCurrentJalaliMonth,
	getJalaliMonthRange,
} from '@/lib/jalali';
import { formatHoursAsDurationFa } from '@/lib/duration';
import { formatMoney } from '@/lib/money';
import { requireUser } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
	const user = await requireUser();
	const supabase = await createClient();
	const { year, month } = getCurrentJalaliMonth();
	const monthRange = getJalaliMonthRange(year, month);

	const [{ data: projects }, { data: timeEntries }, { data: invoices }] = await Promise.all([
		supabase.from('projects').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
		supabase.from('time_entries').select('project_id, hours, work_date').eq('user_id', user.id),
		supabase.from('invoices').select('status, total').eq('user_id', user.id),
	]);

	const monthlyTimeEntries = (timeEntries ?? []).filter(
		(entry) => entry.work_date >= monthRange.startIso && entry.work_date <= monthRange.endIso,
	);

	const stats = computeGlobalDashboardStats({
		projects: projects ?? [],
		timeEntries: timeEntries ?? [],
		monthlyTimeEntries,
		invoices: invoices ?? [],
	});

	const greeting = getDashboardGreeting();
	const insight = getFunInsight(stats);
	const profile = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
	const displayName = profile.data?.full_name?.trim() || 'فریلنسر';

	const quickStats = [
		{
			label: 'پروژه فعال',
			value: stats.activeProjectCount.toLocaleString('fa-IR'),
			icon: FolderKanban,
			color: 'from-blue-500 to-blue-700',
		},
		{
			label: 'ساعات این ماه',
			value: formatHoursAsDurationFa(stats.monthlyHours),
			icon: Clock,
			color: 'from-violet-500 to-purple-700',
		},
		{
			label: 'دریافت‌شده',
			value: formatMoney(stats.totalPaid),
			icon: Wallet,
			color: 'from-emerald-500 to-green-700',
		},
		{
			label: 'در انتظار',
			value: formatMoney(stats.totalPending),
			icon: TrendingUp,
			color: 'from-amber-500 to-orange-700',
		},
	];

	return (
		<div className='space-y-8'>
			<section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-xl sm:p-8'>
				<div className='relative z-10 max-w-2xl'>
					<p className='flex items-center gap-2 text-sm text-blue-100'>
						<Sparkles size={16} />
						{formatJalaliMonthLabel(monthRange.start)}
					</p>
					<h1 className='mt-2 text-3xl font-black sm:text-4xl'>
						{greeting}، {displayName}!
					</h1>
					<p className='mt-3 flex items-start gap-2 text-sm text-blue-100 sm:text-base'>
						<PartyPopper size={18} className='mt-0.5 shrink-0' />
						{insight}
					</p>
					<div className='mt-6 flex flex-wrap gap-3'>
						<Link href={ROUTES.projectNew}>
							<Button className='bg-white text-blue-700 hover:bg-blue-50'>
								<FolderKanban size={16} />
								پروژه جدید
							</Button>
						</Link>
						<Link href={ROUTES.projects}>
							<Button variant='secondary' className='border-white/20 bg-white/10 text-white hover:bg-white/20'>
								<FileText size={16} />
								مشاهده پروژه‌ها
							</Button>
						</Link>
					</div>
				</div>
				<Zap size={120} className='absolute -bottom-6 -left-6 opacity-10' />
			</section>

			<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
				{quickStats.map((item) => {
					const Icon = item.icon;

					return (
						<div
							key={item.label}
							className={`rounded-2xl bg-gradient-to-br ${item.color} p-5 text-white shadow-lg`}
						>
							<div className='flex items-center justify-between'>
								<Icon size={22} className='opacity-90' />
								<span className='text-xs font-bold opacity-80'>{item.label}</span>
							</div>
							<p className='mt-4 text-2xl font-black tabular-nums'>{item.value}</p>
						</div>
					);
				})}
			</div>

			<div className='grid gap-6 lg:grid-cols-2'>
				<Card title='خلاصه مالی' description='نمای کلی از فاکتورها'>
					<div className='space-y-4'>
						<div className='flex items-center justify-between rounded-xl bg-muted px-4 py-3'>
							<span className='text-sm text-muted-foreground'>کل صورتحساب‌ها</span>
							<span className='font-bold tabular-nums'>{formatMoney(stats.totalInvoiced)}</span>
						</div>
						<div className='flex items-center justify-between rounded-xl bg-muted px-4 py-3'>
							<span className='text-sm text-muted-foreground'>فاکتورهای پرداخت‌شده</span>
							<span className='font-bold tabular-nums text-emerald-600 dark:text-emerald-400'>
								{stats.paidInvoiceCount.toLocaleString('fa-IR')}
							</span>
						</div>
						<div className='flex items-center justify-between rounded-xl bg-muted px-4 py-3'>
							<span className='text-sm text-muted-foreground'>پیش‌نویس‌ها</span>
							<span className='font-bold tabular-nums text-amber-600 dark:text-amber-400'>
								{stats.draftInvoiceCount.toLocaleString('fa-IR')}
							</span>
						</div>
					</div>
				</Card>

				<Card title='فعالیت' description='آمار کار و پروژه'>
					<div className='space-y-4'>
						<div className='flex items-center gap-3 rounded-xl bg-muted px-4 py-3'>
							<Clock size={18} className='text-blue-600' />
							<div>
								<p className='text-sm text-muted-foreground'>کل ساعات ثبت‌شده</p>
								<p className='font-black tabular-nums' dir='ltr'>
									{formatHoursAsDurationFa(stats.totalHours)}
								</p>
							</div>
						</div>
						{stats.topProjectByHours ? (
							<div className='flex items-center gap-3 rounded-xl bg-muted px-4 py-3'>
								<FolderKanban size={18} className='text-violet-600' />
								<div>
									<p className='text-sm text-muted-foreground'>پرکارترین پروژه</p>
									<p className='font-bold'>{stats.topProjectByHours.name}</p>
									<p className='text-xs tabular-nums text-muted-foreground' dir='ltr'>
										{formatHoursAsDurationFa(stats.topProjectByHours.hours)}
									</p>
								</div>
							</div>
						) : (
							<p className='text-sm text-muted-foreground'>هنوز ساعتی ثبت نشده.</p>
						)}
					</div>
				</Card>
			</div>

			{(projects ?? []).length > 0 && (
				<Card title='پروژه‌های اخیر'>
					<div className='grid gap-3 sm:grid-cols-2'>
						{(projects ?? []).slice(0, 4).map((project) => (
							<Link
								key={project.id}
								href={ROUTES.project(project.id)}
								className='flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-4 transition-colors hover:bg-muted'
							>
								<div className='rounded-lg bg-blue-600/10 p-2 text-blue-600 dark:text-blue-400'>
									<FolderKanban size={18} />
								</div>
								<div>
									<p className='font-bold text-foreground'>{project.name}</p>
									<p className='text-xs text-muted-foreground'>{project.client_name}</p>
								</div>
							</Link>
						))}
					</div>
				</Card>
			)}
		</div>
	);
}
