import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ActionIcon from '@/components/ActionIcon';
import { useGlobalStore } from '@/store/global';

import SettingButton from './SettingButton';

const HeaderAction = memo(() => {
  const { t } = useTranslation('chat');

  const [showAgentSettings, toggleConfig] = useGlobalStore((s) => [
    s.preference.showChatSideBar,
    s.toggleChatSideBar,
  ]);

  return (
    <>
      <ActionIcon
        icon={showAgentSettings ? PanelRightClose : PanelRightOpen}
        onClick={() => toggleConfig()}
        title={t('roleAndArchive')}
      />
      <SettingButton />
    </>
  );
});

export default HeaderAction;
