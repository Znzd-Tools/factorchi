import Link from 'next/link';

import { Card } from '@/components/atoms/Card';
import { ROUTES } from '@/config/routes';
import { ProfileForm } from '@/features/profile/components/ProfileForm';
import { requireUser } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

export default async function ProfilePage() {
	const user = await requireUser();
	const supabase = await createClient();

	const { data: profile } = await supabase
		.from('profiles')
		.select('full_name, default_currency')
		.eq('id', user.id)
		.single();

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-2xl font-black text-slate-900'>پروفایل</h1>
				<p className='mt-1 text-sm text-slate-500'>اطلاعات حساب و تنظیمات پیش‌فرض</p>
			</div>

			<Card title='اطلاعات کاربری' description='نام و ارز پیش‌فرض برای پروژه‌ها و فاکتورها'>
				<ProfileForm
					email={user.email ?? ''}
					fullName={profile?.full_name ?? ''}
					defaultCurrency={profile?.default_currency ?? 'toman'}
				/>
			</Card>

			<Card title='روش‌های پرداخت' description='مدیریت حساب‌های بانکی و آدرس‌های کریپتو'>
				<Link
					href={ROUTES.paymentMethods}
					className='text-sm font-bold text-blue-600 hover:underline'
				>
					مدیریت روش‌های پرداخت
				</Link>
			</Card>
		</div>
	);
}
