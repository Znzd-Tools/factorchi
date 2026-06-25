import { CreditCard, Settings, Smartphone } from 'lucide-react';

import { Card } from '@/components/atoms/Card';
import { HapticLink } from '@/components/ui/HapticLink';
import { ListGroup } from '@/components/ui/ListRow';
import { PageHeader } from '@/components/ui/PageHeader';
import { Surface } from '@/components/ui/Surface';
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
			<PageHeader title='تنظیمات' description='حساب، پرداخت و ترجیحات' />

			<Surface title='حساب کاربری' description='نام و ارز پیش‌فرض'>
				<ProfileForm
					email={user.email ?? ''}
					fullName={profile?.full_name ?? ''}
					defaultCurrency={profile?.default_currency ?? 'toman'}
				/>
			</Surface>

			<section className='space-y-3'>
				<h2 className='text-sm font-bold text-muted-foreground'>بخش‌ها</h2>
				<ListGroup>
					<HapticLink
						href={ROUTES.paymentMethods}
						haptic='light'
						className='flex items-center gap-3 px-4 py-4 transition-colors active:bg-muted'
					>
						<div className='flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
							<CreditCard size={18} aria-hidden />
						</div>
						<div className='min-w-0 flex-1'>
							<p className='font-bold text-foreground'>روش‌های پرداخت</p>
							<p className='text-sm text-muted-foreground'>حساب بانکی و آدرس کریپتو</p>
						</div>
					</HapticLink>
				</ListGroup>
			</section>

			<FeedbackSettingsCard />

			<Card title='میان‌بر PWA' description='ثبت سریع از صفحه اصلی گوشی'>
				<div className='flex items-start gap-3 text-sm text-muted-foreground'>
					<Smartphone size={18} className='mt-0.5 shrink-0 text-primary' aria-hidden />
					<p>
						برای ثبت سریع ساعت، اپ را به Home Screen اضافه کنید. میان‌بر «ثبت سریع» در نوار
						پایین و داشبورد امروز در دسترس است.
					</p>
				</div>
			</Card>

			<div className='flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3'>
				<Settings size={18} className='text-muted-foreground' aria-hidden />
				<p className='truncate text-sm text-muted-foreground' dir='ltr'>
					{user.email}
				</p>
			</div>
		</div>
	);
}
