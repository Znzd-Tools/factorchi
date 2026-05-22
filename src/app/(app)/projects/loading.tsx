export default function ProjectsLoading() {
	return (
		<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
			{Array.from({ length: 3 }).map((_, index) => (
				<div key={index} className='h-40 animate-pulse rounded-2xl bg-slate-200' />
			))}
		</div>
	);
}
