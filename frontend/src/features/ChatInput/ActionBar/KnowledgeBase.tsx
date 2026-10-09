import { BookOpen, Check } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ActionIcon from '@/components/ActionIcon';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { knowledgeService } from '@/services/knowledge';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const KnowledgeBaseAction = memo(() => {
  const { t } = useTranslation('setting');
  const knowledgeBase = useSessionStore((s) => agentSelectors.currentAgentConfig(s).knowledgeBase);
  const updateAgentConfig = useSessionStore((s) => s.updateAgentConfig);

  const [kbList, setKbList] = useState<{ kb_name: string }[]>([]);
  useEffect(() => {
    knowledgeService.getList().then((res) => {
      if (res.code === 200) setKbList(res.data ?? []);
    }).catch(() => {
      // backend unreachable — leave the KB list empty
    });
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ActionIcon
          active={!!knowledgeBase}
          icon={BookOpen}
          placement={'bottom'}
          title={t('settingChat.knowledgeBase.title')}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onCloseAutoFocus={(e) => e.preventDefault()}>
        {/* updateAgentConfig 走 lodash deep-merge，undefined 会被跳过；用 '' 表示不使用 */}
        <DropdownMenuItem onClick={() => updateAgentConfig({ knowledgeBase: '' })}>
          {!knowledgeBase ? <Check className="size-4" /> : <div className="size-4" />}
          {t('settingChat.knowledgeBase.unset')}
        </DropdownMenuItem>
        {kbList.map((kb) => (
          <DropdownMenuItem key={kb.kb_name} onClick={() => updateAgentConfig({ knowledgeBase: kb.kb_name })}>
            {knowledgeBase === kb.kb_name ? <Check className="size-4" /> : <div className="size-4" />}
            {kb.kb_name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export default KnowledgeBaseAction;
