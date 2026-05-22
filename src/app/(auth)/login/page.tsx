import { Card } from '@/components/atoms/Card';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
	return (
		<div className='flex min-h-screen items-center justify-center bg-slate-50 p-4'>
			<Card title='ورود' description='به فاکتورچی خوش آمدید' className='w-full max-w-md'>
				<LoginForm />
			</Card>
		</div>
	);
}
