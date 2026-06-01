import type { Metadata, Viewport } from 'next';

import { AppToaster } from '@/components/layout/AppToaster';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { iranSansX } from '@/app/fonts';

import './globals.css';

export const metadata: Metadata = {
	title: 'فاکتورچی',
	description: 'مدیریت پروژه، ثبت ساعت و صدور فاکتور',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'فاکتورچی',
	},
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	viewportFit: 'cover',
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#f4f6fb' },
		{ media: '(prefers-color-scheme: dark)', color: '#070b14' },
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='fa' dir='rtl' className={`${iranSansX.variable} ${iranSansX.className} h-full antialiased`} suppressHydrationWarning>
			<body className='min-h-full flex flex-col bg-background font-sans text-foreground'>
				<ThemeProvider>
					{children}
					<AppToaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
