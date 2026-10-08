import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ActionIcon from '@/components/ActionIcon';
import { GlobalStore } from '@/store/global';
import { SidebarTabKey } from '@/store/global/initialState';

export interface BottomActionProps {
  tab?: GlobalStore['sidebarKey'];
}

const BottomActions = memo<BottomActionProps>(({ tab }) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const goToSettings = () => router.push('/settings/common');

  const icon = (
    <div className="relative">
      <ActionIcon
        active={tab === SidebarTabKey.Setting}
        icon={Settings}
        onClick={goToSettings}
        title={t('setting')}
      />
    </div>
  );

  return icon;
});

export default BottomActions;
