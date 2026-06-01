import { Card } from '@/components/atoms/Card';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
	return (
		<Card title='ورود' description='به فاکتورچی خوش آمدید' className='w-full'>
			<LoginForm />
		</Card>
	);
}
