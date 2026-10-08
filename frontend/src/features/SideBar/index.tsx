import { memo } from 'react';

import { SidebarTabKey } from '@/store/global/initialState';

import BottomActions from './BottomActions';
import TopActions from './TopActions';

interface Props {
  sidebarKey?: SidebarTabKey;
}

export default memo<Props>(({ sidebarKey }) => {
  return (
    <nav className="flex h-full w-16 flex-none flex-col items-center justify-between bg-muted/40 py-4">
      <div className="flex flex-col items-center gap-2">{<TopActions tab={sidebarKey} />}</div>
      <div className="flex flex-col items-center gap-2">{<BottomActions tab={sidebarKey} />}</div>
    </nav>
  );
});
