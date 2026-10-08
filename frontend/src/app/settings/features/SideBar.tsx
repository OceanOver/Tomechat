'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { CHAT_SIDEBAR_WIDTH } from '@/const/layoutTokens';
import { useResponsive } from '@/hooks/useResponsive';

import SettingList, { SettingListProps } from './SettingList';

const SideBar = memo<SettingListProps>(({ activeTab }) => {
  const { t } = useTranslation('common');
  const { isMobile } = useResponsive();
  const mobile = !!isMobile;

  return (
    <aside
      className="flex shrink-0 flex-col border-r border-border"
      style={{ width: CHAT_SIDEBAR_WIDTH }}
    >
      <div className="px-4 py-4 text-xl font-bold">{t('setting')}</div>
      <div className="flex flex-col gap-2 px-2">
        <SettingList activeTab={activeTab} mobile={mobile} />
      </div>
    </aside>
  );
});

export default SideBar;
