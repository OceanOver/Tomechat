import { Settings2 } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { SettingsTabs } from '@/store/global/initialState';

import Item from './Item';

export interface SettingListProps {
  activeTab?: SettingsTabs;
  mobile?: boolean;
}

const SettingList = memo<SettingListProps>(({ activeTab, mobile }) => {
  const { t } = useTranslation('setting');

  const items = [{ icon: Settings2, label: t('tab.common'), value: SettingsTabs.Common }];

  return (
    <>
      {items.map(({ value, icon, label }) => (
        <Link aria-label={label} className="block" href={`/settings/${value}`} key={value}>
          <Item
            active={mobile ? false : activeTab === value}
            hoverable={!mobile}
            icon={icon}
            label={label}
          />
        </Link>
      ))}
    </>
  );
});

export default SettingList;
