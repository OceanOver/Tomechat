'use client';

import { PropsWithChildren, memo } from 'react';

import ThemeProvider from './ThemeProvider';
import Locale from './Locale';
import StoreHydration from './StoreHydration';

const Container = memo<PropsWithChildren>(({ children }) => (
  <div className="flex h-full max-h-[100dvh] flex-col items-center overflow-hidden bg-background">
    {children}
  </div>
));

interface GlobalLayoutProps extends PropsWithChildren {
  defaultLang?: string;
}

const GlobalLayout = ({ children, defaultLang }: GlobalLayoutProps) => {
  return (
    <ThemeProvider>
      <Locale defaultLang={defaultLang}>
        <StoreHydration />
        <Container>{children}</Container>
      </Locale>
    </ThemeProvider>
  );
};

export default GlobalLayout;
