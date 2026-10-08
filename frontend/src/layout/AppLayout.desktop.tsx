import { ReactNode, memo } from 'react';

import SideBar from '@/features/SideBar';
import { useIsPWA } from '@/hooks/useIsPWA';
import { cn } from '@/utils/cn';
import { SidebarTabKey } from '@/store/global/initialState';

interface AppLayoutDesktopProps {
  children: ReactNode;
  sidebarKey?: SidebarTabKey;
}
const AppLayoutDesktop = memo<AppLayoutDesktopProps>(({ children, sidebarKey }) => {
  const isPWA = useIsPWA();

  return (
    <div className={cn('flex h-full w-full flex-row', isPWA && 'border-t border-border')}>
      <SideBar sidebarKey={sidebarKey} />
      {children}
    </div>
  );
});

export default AppLayoutDesktop;
