import Link from 'next/link';
import {
	Clock,
	FileText,
	FolderKanban,
	PartyPopper,
	Sparkles,
	TrendingUp,
	Wallet,
} from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { HapticLink } from '@/components/ui/HapticLink';
import { StatTile } from '@/components/ui/StatTile';
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
import { toFaNumber } from '@/lib/locale/persian-digits';
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
			value: toFaNumber(stats.activeProjectCount),
			icon: FolderKanban,
			tone: 'primary' as const,
		},
		{
			label: 'ساعات این ماه',
			value: formatHoursAsDurationFa(stats.monthlyHours),
			icon: Clock,
			tone: 'default' as const,
		},
		{
			label: 'دریافت‌شده',
			value: formatMoney(stats.totalPaid),
			icon: Wallet,
			tone: 'success' as const,
		},
		{
			label: 'در انتظار',
			value: formatMoney(stats.totalPending),
			icon: TrendingUp,
			tone: 'warning' as const,
		},
	];

	return (
		<div className='space-y-6 pb-2'>
			<section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-indigo-600 to-violet-700 p-5 text-primary-foreground shadow-[var(--shadow-elevated)] sm:p-7'>
				<div className='relative z-10 max-w-2xl'>
					<p className='flex items-center gap-2 text-sm opacity-90'>
						<Sparkles size={16} aria-hidden />
						{formatJalaliMonthLabel(monthRange.start)}
					</p>
					<h1 className='mt-2 text-2xl font-black sm:text-3xl'>
						{greeting}، {displayName}
					</h1>
					<p className='mt-3 flex items-start gap-2 text-sm leading-relaxed opacity-90'>
						<PartyPopper size={18} className='mt-0.5 shrink-0' aria-hidden />
						{insight}
					</p>
					<div className='mt-5 flex flex-wrap gap-2'>
						<Link href={ROUTES.projectNew}>
							<Button className='bg-card text-primary hover:opacity-95' haptic='medium'>
								<FolderKanban size={16} />
								پروژه جدید
							</Button>
						</Link>
						<Link href={ROUTES.projects}>
							<Button
								variant='secondary'
								className='border-white/25 bg-white/15 text-primary-foreground hover:bg-white/25'
								haptic='light'
							>
								<FileText size={16} />
								پروژه‌ها
							</Button>
						</Link>
					</div>
				</div>
			</section>

			<div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
				{quickStats.map((item) => (
					<StatTile
						key={item.label}
						label={item.label}
						value={item.value}
						icon={item.icon}
						tone={item.tone}
					/>
				))}
			</div>

			<div className='grid gap-4 lg:grid-cols-2'>
				<Card title='خلاصه مالی' description='نمای کلی از فاکتورها'>
					<div className='space-y-2'>
						<div className='flex items-center justify-between rounded-xl bg-muted px-4 py-3.5'>
							<span className='text-sm text-muted-foreground'>کل صورتحساب‌ها</span>
							<span className='font-bold tabular-nums'>{formatMoney(stats.totalInvoiced)}</span>
						</div>
						<div className='flex items-center justify-between rounded-xl bg-muted px-4 py-3.5'>
							<span className='text-sm text-muted-foreground'>فاکتورهای پرداخت‌شده</span>
							<span className='font-bold tabular-nums text-accent'>
								{toFaNumber(stats.paidInvoiceCount)}
							</span>
						</div>
						<div className='flex items-center justify-between rounded-xl bg-muted px-4 py-3.5'>
							<span className='text-sm text-muted-foreground'>پیش‌نویس‌ها</span>
							<span className='font-bold tabular-nums text-amber-600 dark:text-amber-400'>
								{toFaNumber(stats.draftInvoiceCount)}
							</span>
						</div>
					</div>
				</Card>

				<Card title='فعالیت' description='آمار کار و پروژه'>
					<div className='space-y-2'>
						<div className='flex items-center gap-3 rounded-xl bg-muted px-4 py-3.5'>
							<Clock size={18} className='text-primary' aria-hidden />
							<div>
								<p className='text-sm text-muted-foreground'>کل ساعات ثبت‌شده</p>
								<p className='font-black tabular-nums' dir='ltr'>
									{formatHoursAsDurationFa(stats.totalHours)}
								</p>
							</div>
						</div>
						{stats.topProjectByHours ? (
							<div className='flex items-center gap-3 rounded-xl bg-muted px-4 py-3.5'>
								<FolderKanban size={18} className='text-primary' aria-hidden />
								<div>
									<p className='text-sm text-muted-foreground'>پرکارترین پروژه</p>
									<p className='font-bold'>{stats.topProjectByHours.name}</p>
									<p className='text-xs tabular-nums text-muted-foreground' dir='ltr'>
										{formatHoursAsDurationFa(stats.topProjectByHours.hours)}
									</p>
								</div>
							</div>
						) : (
							<p className='px-1 text-sm text-muted-foreground'>هنوز ساعتی ثبت نشده.</p>
						)}
					</div>
				</Card>
			</div>

			{(projects ?? []).length > 0 && (
				<Card title='پروژه‌های اخیر'>
					<div className='space-y-2'>
						{(projects ?? []).slice(0, 4).map((project) => (
							<HapticLink
								key={project.id}
								href={ROUTES.project(project.id)}
								haptic='light'
								className='flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4 transition-colors active:bg-muted'
							>
								<div className='flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
									<FolderKanban size={20} aria-hidden />
								</div>
								<div className='min-w-0 flex-1'>
									<p className='truncate font-bold text-foreground'>{project.name}</p>
									<p className='truncate text-xs text-muted-foreground'>{project.client_name}</p>
								</div>
							</HapticLink>
						))}
					</div>
				</Card>
			)}
		</div>
	);
}
