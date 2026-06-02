import { CreditCard, Timer, User } from 'lucide-react';

import { Card } from '@/components/atoms/Card';
import { HapticLink } from '@/components/ui/HapticLink';
import { ListGroup } from '@/components/ui/ListRow';
import { PageHeader } from '@/components/ui/PageHeader';
import { ROUTES } from '@/config/routes';
import { FeedbackSettingsCard } from '@/features/profile/components/FeedbackSettingsCard';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { ensureUserProfile } from '@/lib/auth/ensure-user-profile';
import { requireUser } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

export default async function ProfilePage() {
	const user = await requireUser();
	const supabase = await createClient();

	const profile = await ensureUserProfile(supabase, user.id, {
		fullName: user.user_metadata?.full_name ?? '',
	});

	return (
		<div className='space-y-6 pb-2'>
			<PageHeader title='پروفایل' description='اطلاعات حساب و تنظیمات پیش‌فرض' />

			<Card title='اطلاعات کاربری' description='نام و ارز پیش‌فرض برای پروژه‌ها و فاکتورها'>
				<ProfileForm
					email={user.email ?? ''}
					fullName={profile?.full_name ?? ''}
					defaultCurrency={profile?.default_currency ?? 'toman'}
				/>
			</Card>

			<FeedbackSettingsCard />

			<section className='space-y-3'>
				<h2 className='text-sm font-bold text-muted-foreground'>تنظیمات</h2>
				<ListGroup>
					<HapticLink
						href={ROUTES.quickLog}
						haptic='medium'
						className='flex items-center gap-3 px-4 py-4 transition-colors active:bg-muted'
					>
						<div className='flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent'>
							<Timer size={18} aria-hidden />
						</div>
						<div className='min-w-0 flex-1'>
							<p className='font-bold text-foreground'>ثبت سریع ساعت</p>
							<p className='text-sm text-muted-foreground'>ویجت PWA و میان‌بر نصب</p>
						</div>
					</HapticLink>
					<HapticLink
						href={ROUTES.paymentMethods}
						haptic='light'
						className='flex items-center gap-3 px-4 py-4 transition-colors active:bg-muted'
					>
						<div className='flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
							<CreditCard size={18} aria-hidden />
						</div>
						<div className='min-w-0 flex-1'>
							<p className='font-bold text-foreground'>روش‌های پرداخت</p>
							<p className='text-sm text-muted-foreground'>حساب بانکی و آدرس کریپتو</p>
						</div>
					</HapticLink>
				</ListGroup>
			</section>

			<div className='flex items-center gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-3'>
				<User size={18} className='text-muted-foreground' aria-hidden />
				<p className='truncate text-sm text-muted-foreground' dir='ltr'>
					{user.email}
				</p>
			</div>
		</div>
	);
}
