import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';

import { AppToaster } from '@/components/layout/AppToaster';
import { ThemeProvider } from '@/components/layout/ThemeProvider';

import './globals.css';

const vazirmatn = Vazirmatn({
	subsets: ['arabic', 'latin'],
	weight: ['300', '400', '600', '700', '900'],
	variable: '--font-vazirmatn',
});

export const metadata: Metadata = {
	title: 'فاکتورچی',
	description: 'مدیریت پروژه، ثبت ساعت و صدور فاکتور',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='fa' dir='rtl' className={`${vazirmatn.variable} h-full antialiased`} suppressHydrationWarning>
			<body className='min-h-full flex flex-col bg-background font-sans text-foreground'>
				<ThemeProvider>
					{children}
					<AppToaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
