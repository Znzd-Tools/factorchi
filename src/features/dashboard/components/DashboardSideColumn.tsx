'use client';

import { Disclosure } from '@/components/ui/Disclosure';
import { StreakCard } from '@/features/engagement/components/StreakCard';
import { WrappedTeaser } from '@/features/engagement/components/WrappedTeaser';
import { MonthlyGoalsCard } from '@/features/goals/components/MonthlyGoalsCard';
import type { ITimeStreakStats } from '@/features/engagement/utils/time-streak';

interface IDashboardSideColumnProps {
	monthLabel: string;
	hoursGoal: number | null;
	incomeGoal: number | null;
	currentHours: number;
	currentIncome: number;
	streak: ITimeStreakStats;
	wrapped: {
		year: number;
		month: number;
		monthLabel: string;
		headline: string;
		totalHours: number;
		incomeTotal: number;
		hasActivity: boolean;
	};
}

export function DashboardSideColumn({
	monthLabel,
	hoursGoal,
	incomeGoal,
	currentHours,
	currentIncome,
	streak,
	wrapped,
}: IDashboardSideColumnProps) {
	return (
		<aside className='space-y-4'>
			<MonthlyGoalsCard
				monthLabel={monthLabel}
				hoursGoal={hoursGoal}
				incomeGoal={incomeGoal}
				currentHours={currentHours}
				currentIncome={currentIncome}
			/>

			<div className='md:hidden'>
				<Disclosure title='پیشرفت و انگیزه' defaultOpen={false}>
					<div className='space-y-4'>
						<StreakCard streak={streak} />
						<WrappedTeaser stats={wrapped} />
					</div>
				</Disclosure>
			</div>

			<div className='hidden space-y-4 md:block'>
				<StreakCard streak={streak} />
				<WrappedTeaser stats={wrapped} />
			</div>
		</aside>
	);
}
