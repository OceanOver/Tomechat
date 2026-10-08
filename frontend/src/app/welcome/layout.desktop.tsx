'use client';

import { PropsWithChildren, memo } from 'react';

import AppLayoutDesktop from '@/layout/AppLayout.desktop';

const Desktop = memo<PropsWithChildren>(({ children }) => {
  return (
    <AppLayoutDesktop>
      <div className="relative flex h-full flex-1 items-center justify-center bg-card">
        <div className="relative flex h-full max-w-5xl flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      </div>
    </AppLayoutDesktop>
  );
});

export default Desktop;
