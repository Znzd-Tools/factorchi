'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface IThemeContext {
	theme: Theme;
	toggleTheme: () => void;
}

const ThemeContext = createContext<IThemeContext>({
	theme: 'light',
	toggleTheme: () => {},
});

function getInitialTheme(): Theme {
	const stored = localStorage.getItem('factorchi-theme');

	if (stored === 'dark' || stored === 'light') {
		return stored;
	}

	return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>(() =>
		typeof window !== 'undefined' ? getInitialTheme() : 'light',
	);

	useEffect(() => {
		document.documentElement.classList.toggle('dark', theme === 'dark');
	}, [theme]);

	const toggleTheme = () => {
		setTheme((current) => {
			const next = current === 'dark' ? 'light' : 'dark';
			localStorage.setItem('factorchi-theme', next);
			return next;
		});
	};

	return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	return useContext(ThemeContext);
}
