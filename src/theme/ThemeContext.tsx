import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadJSON, saveJSON } from '../lib/storage';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'jenkins-workshop:theme';

type ThemeContextValue = { theme: Theme; toggle: () => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => loadJSON<Theme>(STORAGE_KEY, 'light'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveJSON(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme muss innerhalb von ThemeProvider verwendet werden.');
  return ctx;
}
