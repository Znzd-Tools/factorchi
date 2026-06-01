import type { MetadataRoute } from 'next';

import { ROUTES } from '@/config/routes';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'فاکتورچی',
		short_name: 'فاکتورچی',
		description: 'مدیریت پروژه، ثبت ساعت و صدور فاکتور',
		start_url: ROUTES.dashboard,
		display: 'standalone',
		orientation: 'portrait',
		lang: 'fa',
		dir: 'rtl',
		background_color: '#f4f6fb',
		theme_color: '#4f46e5',
		icons: [
			{
				src: '/icon',
				sizes: '32x32',
				type: 'image/png',
			},
			{
				src: '/apple-icon',
				sizes: '180x180',
				type: 'image/png',
				purpose: 'any',
			},
		],
		shortcuts: [
			{
				name: 'ثبت سریع ساعت',
				short_name: 'ثبت ساعت',
				description: 'ثبت ساعت کار برای امروز',
				url: ROUTES.quickLog,
				icons: [{ src: '/icon', sizes: '96x96', type: 'image/png' }],
			},
		],
	};
}
