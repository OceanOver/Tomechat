'use client';

import { memo } from 'react';

import { SettingsTabs } from '@/store/global/initialState';

import Common from './common';
import { SettingsCommonProps } from './common/Common';
import DesktopLayout from './layout.desktop';

export default memo<SettingsCommonProps>((props) => (
  <DesktopLayout activeTab={SettingsTabs.Common}>
    <Common {...props} />
  </DesktopLayout>
));
