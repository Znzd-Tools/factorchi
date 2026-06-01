import { Card } from '@/components/atoms/Card';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
	return (
		<Card title='ثبت‌نام' description='حساب جدید بسازید' className='w-full'>
			<RegisterForm />
		</Card>
	);
}
