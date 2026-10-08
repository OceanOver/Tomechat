import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { SettingsTabs } from '@/store/global/initialState';

const Header = memo(({ activeTab }: { activeTab: SettingsTabs }) => {
  const { t } = useTranslation('setting');

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border bg-background/80 px-3 backdrop-blur">
      <div className="pl-2">
        <span className="truncate text-sm font-medium leading-tight">{t(`tab.${activeTab}`)}</span>
      </div>
    </header>
  );
});

export default Header;
