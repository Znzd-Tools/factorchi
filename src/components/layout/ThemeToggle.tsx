'use client';

import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { useTheme } from '@/components/layout/ThemeProvider';

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();

	return (
		<Button
			type='button'
			variant='ghost'
			size='sm'
			onClick={toggleTheme}
			aria-label={theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
		>
			{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
		</Button>
	);
}
