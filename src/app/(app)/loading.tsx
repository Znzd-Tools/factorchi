export default function AppLoading() {
	return (
		<div className='space-y-4 animate-pulse'>
			<div className='h-8 w-48 rounded-xl bg-muted' />
			<div className='h-28 rounded-2xl bg-muted' />
			<div className='grid grid-cols-2 gap-3'>
				<div className='h-24 rounded-2xl bg-muted' />
				<div className='h-24 rounded-2xl bg-muted' />
			</div>
		</div>
	);
}
