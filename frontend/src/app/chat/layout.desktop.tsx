'use client';

import { PropsWithChildren, memo } from 'react';

import AppLayoutDesktop from '@/layout/AppLayout.desktop';
import { SidebarTabKey } from '@/store/global/initialState';

import ResponsiveSessionList from './features/SessionList';

export default memo(({ children }: PropsWithChildren) => {
  return (
    <AppLayoutDesktop sidebarKey={SidebarTabKey.Chat}>
      <ResponsiveSessionList />
      <div
        className="relative flex min-w-0 flex-1 flex-col"
        id={'chat-conversion-container'}
        style={{ height: '100%' }}
      >
        {children}
      </div>
    </AppLayoutDesktop>
  );
});
