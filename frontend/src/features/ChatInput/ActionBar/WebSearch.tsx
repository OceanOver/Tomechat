import { Globe } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import ActionIcon from '@/components/ActionIcon';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const WebSearchAction = memo(() => {
  const { t } = useTranslation('setting');
  const searchEngine = useSessionStore((s) => agentSelectors.currentAgentConfig(s).searchEngine);
  const updateAgentConfig = useSessionStore((s) => s.updateAgentConfig);

  return (
    <ActionIcon
      active={!!searchEngine}
      icon={Globe}
      placement={'bottom'}
      title={t('settingChat.searchEngine.title')}
      onClick={() => updateAgentConfig({ searchEngine: !searchEngine })}
    />
  );
});

export default WebSearchAction;
