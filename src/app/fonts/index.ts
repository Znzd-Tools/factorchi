import localFont from 'next/font/local';

export const iranSansX = localFont({
	src: [
		{
			path: './Iransansx/woff2/IRANSansX-Regular.woff2',
			weight: '400',
			style: 'normal',
		},
		{
			path: './Iransansx/woff2/IRANSansX-Medium.woff2',
			weight: '500',
			style: 'normal',
		},
		{
			path: './Iransansx/woff2/IRANSansX-DemiBold.woff2',
			weight: '600',
			style: 'normal',
		},
		{
			path: './Iransansx/woff2/IRANSansX-ExtraBold.woff2',
			weight: '800',
			style: 'normal',
		},
	],
	variable: '--font-iran-sans-x',
	display: 'swap',
	preload: true,
});
