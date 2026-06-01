export default function ProjectsLoading() {
	return (
		<div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
			{Array.from({ length: 6 }).map((_, index) => (
				<div key={index} className='h-32 animate-pulse rounded-2xl bg-muted' />
			))}
		</div>
	);
}
