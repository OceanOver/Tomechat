'use client';

import { ReactNode, memo, useEffect } from 'react';

import { Toaster } from '@/components/ui/sonner';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';

/**
 * Light theme only: applies the user-configured root font size and mounts the global Toaster
 */
const ThemeProvider = memo<ThemeProviderProps>(({ children }) => {
  const fontSize = useGlobalStore((s) => settingsSelectors.currentSettings(s).fontSize);

  // apply fontSize to the root element whenever it changes (including initially)
  useEffect(() => {
    if (fontSize) {
      document.documentElement.style.fontSize = `${fontSize}px`;
    }
  }, [fontSize]);

  return (
    <>
      {children}
      <Toaster />
    </>
  );
});

export interface ThemeProviderProps {
  children?: ReactNode;
}

export default ThemeProvider;
