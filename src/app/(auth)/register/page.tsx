import { Card } from '@/components/atoms/Card';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
	return (
		<div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
			<Card title='ثبت‌نام' description='حساب جدید بسازید' className='w-full max-w-md'>
				<RegisterForm />
			</Card>
		</div>
	);
}
