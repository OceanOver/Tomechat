import { Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ActionIcon from '@/components/ActionIcon';
import { pathString } from '@/utils/url';

const SettingButton = memo(() => {
  const { t } = useTranslation('setting');
  const router = useRouter();

  return (
    <ActionIcon
      icon={Settings2}
      onClick={() => {
        router.push(pathString('/chat/settings', { search: location.search }));
      }}
      title={t('header.session')}
    />
  );
});

export default SettingButton;
