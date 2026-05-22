import { z } from 'zod';

const bankDetailsSchema = z
	.object({
		bankName: z.string(),
		accountName: z.string(),
		cardNumber: z.string(),
		shebaNumber: z.string(),
		accountNumber: z.string(),
	})
	.refine((details) => details.shebaNumber.trim() || details.accountNumber.trim(), {
		message: 'حداقل یکی از شماره شبا یا شماره حساب الزامی است.',
		path: ['shebaNumber'],
	});

const cryptoDetailsSchema = z
	.object({
		coin: z.string(),
		network: z.string(),
		address: z.string(),
	})
	.refine((details) => details.coin.trim() || details.address.trim(), {
		message: 'حداقل نوع ارز یا آدرس ولت الزامی است.',
		path: ['coin'],
	});

export const paymentMethodFormSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('bank'),
		label: z.string().trim().min(1, 'نام روش پرداخت الزامی است.'),
		isDefault: z.boolean().optional(),
		details: bankDetailsSchema,
	}),
	z.object({
		type: z.literal('crypto'),
		label: z.string().trim().min(1, 'نام روش پرداخت الزامی است.'),
		isDefault: z.boolean().optional(),
		details: cryptoDetailsSchema,
	}),
]);

export const updatePaymentMethodSchema = z
	.object({
		id: z.string().uuid('شناسه روش پرداخت نامعتبر است.'),
	})
	.and(paymentMethodFormSchema);

export type IBankPaymentDetails = z.infer<typeof bankDetailsSchema>;
export type ICryptoPaymentDetails = z.infer<typeof cryptoDetailsSchema>;
export type IPaymentMethodFormValues = z.infer<typeof paymentMethodFormSchema>;
export type IUpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>;

export const defaultBankDetails: IBankPaymentDetails = {
	bankName: '',
	accountName: '',
	cardNumber: '',
	shebaNumber: '',
	accountNumber: '',
};

export const defaultCryptoDetails: ICryptoPaymentDetails = {
	coin: '',
	network: '',
	address: '',
};

/** Maps legacy jsonb (single accountNumber) to split fields. */
export function normalizeBankDetails(
	raw: Partial<IBankPaymentDetails> & { accountNumber?: string },
): IBankPaymentDetails {
	const sheba = raw.shebaNumber?.trim() ?? '';
	const account = raw.accountNumber?.trim() ?? '';

	if (sheba) {
		return {
			bankName: raw.bankName ?? '',
			accountName: raw.accountName ?? '',
			cardNumber: raw.cardNumber ?? '',
			shebaNumber: sheba,
			accountNumber: account && !account.toUpperCase().startsWith('IR') ? account : '',
		};
	}

	if (account.toUpperCase().startsWith('IR')) {
		return {
			bankName: raw.bankName ?? '',
			accountName: raw.accountName ?? '',
			cardNumber: raw.cardNumber ?? '',
			shebaNumber: account,
			accountNumber: '',
		};
	}

	return {
		bankName: raw.bankName ?? '',
		accountName: raw.accountName ?? '',
		cardNumber: raw.cardNumber ?? '',
		shebaNumber: '',
		accountNumber: account,
	};
}

export function getDefaultPaymentMethodValues(
	type: 'bank' | 'crypto' = 'bank',
): IPaymentMethodFormValues {
	if (type === 'crypto') {
		return {
			type: 'crypto',
			label: '',
			isDefault: false,
			details: { ...defaultCryptoDetails },
		};
	}

	return {
		type: 'bank',
		label: '',
		isDefault: false,
		details: { ...defaultBankDetails },
	};
}
