import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
					borderRadius: 96,
					fontSize: 220,
					fontWeight: 800,
					color: '#fff',
				}}
			>
				ف
			</div>
		),
		size,
	);
}
