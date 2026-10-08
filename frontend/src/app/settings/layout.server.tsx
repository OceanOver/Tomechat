import { ReactNode, memo } from 'react';

import { SettingsTabs } from '@/store/global/initialState';

import DesktopLayout from './layout.desktop';

export interface SettingLayoutProps {
  activeTab: SettingsTabs;
  children: ReactNode;
}
const SettingLayout = memo<SettingLayoutProps>(({ children, ...res }) => (
  <DesktopLayout {...res}>{children}</DesktopLayout>
));

export default SettingLayout;
