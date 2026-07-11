import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { readDoc, writeDoc } from '../../core/storage/localStore';
import { palettes, type AppPalette, type ThemeMode } from '../../core/theme/palette';

type ThemeContextValue = {
  mode: ThemeMode;
  palette: AppPalette;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

type StoredTheme = { mode: ThemeMode };

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    let alive = true;
    readDoc<StoredTheme>('themeMode').then((stored) => {
      if (alive && stored?.mode) setModeState(stored.mode);
    });
    return () => {
      alive = false;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void writeDoc('themeMode', { mode: next });
  }, []);

  const toggle = useCallback(() => {
    setModeState((current) => {
      const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
      void writeDoc('themeMode', { mode: next });
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, palette: palettes[mode], toggle, setMode }),
    [mode, toggle, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme precisa estar dentro de <ThemeProvider>');
  }
  return ctx;
}
