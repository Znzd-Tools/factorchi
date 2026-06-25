'use client';

import { useMemo, useState } from 'react';

import { ProjectListItem } from '@/features/projects/components/ProjectListItem';
import type { IProjectHealth } from '@/features/projects/utils/project-health';
import type { Project } from '@/lib/supabase/database.types';

type ProjectFilter = 'attention' | 'active' | 'archived';

interface IProjectsPortfolioProps {
	projects: Project[];
	healthByProject: Map<string, IProjectHealth>;
}

const FILTER_ITEMS: { id: ProjectFilter; label: string }[] = [
	{ id: 'attention', label: 'نیازمند توجه' },
	{ id: 'active', label: 'فعال' },
	{ id: 'archived', label: 'بایگانی' },
];

function healthPriority(health: IProjectHealth): number {
	if (health.level === 'critical') {
		return 0;
	}

	if (health.level === 'warning') {
		return 1;
	}

	return 2;
}

export function ProjectsPortfolio({ projects, healthByProject }: IProjectsPortfolioProps) {
	const [filter, setFilter] = useState<ProjectFilter>('active');

	const filteredProjects = useMemo(() => {
		let list = projects;

		if (filter === 'active') {
			list = projects.filter((project) => project.status === 'active');
		} else if (filter === 'archived') {
			list = projects.filter((project) => project.status === 'archived');
		} else {
			list = projects.filter((project) => {
				const health = healthByProject.get(project.id);
				return health && health.level !== 'healthy';
			});
		}

		return [...list].sort((a, b) => {
			const healthA = healthByProject.get(a.id);
			const healthB = healthByProject.get(b.id);
			const priorityA = healthA ? healthPriority(healthA) : 2;
			const priorityB = healthB ? healthPriority(healthB) : 2;

			if (priorityA !== priorityB) {
				return priorityA - priorityB;
			}

			return a.name.localeCompare(b.name, 'fa');
		});
	}, [filter, healthByProject, projects]);

	return (
		<div className='space-y-4'>
			<div className='flex gap-1 rounded-xl bg-muted p-1'>
				{FILTER_ITEMS.map((item) => (
					<button
						key={item.id}
						type='button'
						onClick={() => setFilter(item.id)}
						className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
							filter === item.id
								? 'bg-card text-primary shadow-[var(--shadow-soft)]'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						{item.label}
					</button>
				))}
			</div>

			{filteredProjects.length === 0 ? (
				<p className='rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground'>
					{filter === 'attention'
						? 'پروژه‌ای نیازمند توجه نیست.'
						: filter === 'archived'
							? 'پروژه بایگانی‌شده‌ای ندارید.'
							: 'هنوز پروژه فعالی ندارید.'}
				</p>
			) : (
				<ul className='space-y-2'>
					{filteredProjects.map((project) => (
						<li key={project.id}>
							<ProjectListItem
								project={project}
								health={
									healthByProject.get(project.id) ?? {
										level: 'healthy',
										score: 90,
										label: 'سالم',
										hint: 'وضعیت خوب',
									}
								}
							/>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
