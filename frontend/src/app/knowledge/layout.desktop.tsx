'use client';

import { PropsWithChildren, memo } from 'react';

import AppLayoutDesktop from '@/layout/AppLayout.desktop';
import { SidebarTabKey } from '@/store/global/initialState';

export default memo(({ children }: PropsWithChildren) => {
  return (
    <AppLayoutDesktop sidebarKey={SidebarTabKey.Knowledge}>
      <div
        className="relative h-full flex-1 px-5"
        id={'chat-conversion-container'}
      >
        {children}
      </div>
    </AppLayoutDesktop>
  );
});
