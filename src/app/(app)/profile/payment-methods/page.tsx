import { PaymentMethodsList } from '@/features/profile/components/PaymentMethodsList';
import { requireUser } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

export default async function PaymentMethodsPage() {
	const user = await requireUser();
	const supabase = await createClient();

	const { data: paymentMethods } = await supabase
		.from('payment_methods')
		.select('*')
		.eq('user_id', user.id)
		.order('is_default', { ascending: false })
		.order('created_at', { ascending: false });

	return <PaymentMethodsList paymentMethods={paymentMethods ?? []} />;
}
