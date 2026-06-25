import Link from 'next/link';
import { ChevronLeft, FolderKanban } from 'lucide-react';

import { HapticLink } from '@/components/ui/HapticLink';
import { Surface } from '@/components/ui/Surface';
import { ROUTES } from '@/config/routes';
import { formatJalaliMonthLabel } from '@/lib/jalali';
import type { Project } from '@/lib/supabase/database.types';

interface IRecentProjectsProps {
	projects: Project[];
	monthRangeStart: Date;
}

export function RecentProjects({ projects, monthRangeStart }: IRecentProjectsProps) {
	if (projects.length === 0) {
		return null;
	}

	return (
		<Surface
			title='پروژه‌های اخیر'
			description={`فعال در ${formatJalaliMonthLabel(monthRangeStart)}`}
		>
			<div className='space-y-1'>
				{projects.slice(0, 4).map((project) => (
					<HapticLink
						key={project.id}
						href={ROUTES.project(project.id)}
						haptic='light'
						className='flex items-center gap-3 rounded-lg px-2 py-3 transition-colors active:bg-muted'
					>
						<div className='flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
							<FolderKanban size={18} aria-hidden />
						</div>
						<div className='min-w-0 flex-1'>
							<p className='truncate text-sm font-bold text-foreground'>{project.name}</p>
							<p className='truncate text-xs text-muted-foreground'>{project.client_name}</p>
						</div>
						<ChevronLeft size={16} className='shrink-0 text-muted-foreground' aria-hidden />
					</HapticLink>
				))}
			</div>
			{projects.length > 4 && (
				<div className='mt-3 border-t border-border pt-3'>
					<Link
						href={ROUTES.projects}
						className='text-sm font-bold text-primary hover:underline'
					>
						مشاهده همه پروژه‌ها
					</Link>
				</div>
			)}
		</Surface>
	);
}
