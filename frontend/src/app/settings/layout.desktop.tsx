'use client';

import { ReactNode, memo } from 'react';

import AppLayoutDesktop from '@/layout/AppLayout.desktop';
import { SettingsTabs, SidebarTabKey } from '@/store/global/initialState';

import Header from './features/Header';
import SideBar from './features/SideBar';

export interface DesktopLayoutProps {
  activeTab: SettingsTabs;
  children: ReactNode;
}

const DesktopLayout = memo<DesktopLayoutProps>(({ children, activeTab }) => {
  return (
    <AppLayoutDesktop sidebarKey={SidebarTabKey.Setting}>
      <SideBar activeTab={activeTab} />
      <div className="relative flex h-full min-w-0 flex-1 flex-col">
        <Header activeTab={activeTab} />
        <div className="flex flex-1 justify-center overflow-y-auto p-6">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-stretch gap-6">
            {children}
          </div>
        </div>
      </div>
    </AppLayoutDesktop>
  );
});

export default DesktopLayout;
