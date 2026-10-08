import { LucideGalleryVerticalEnd, LucideMessageSquarePlus } from 'lucide-react';
import { memo } from 'react';
import { useHotkeys } from '@/hooks/useHotkeys';
import { useTranslation } from 'react-i18next';

import ActionIcon from '@/components/ActionIcon';
import HotKeys from '@/components/HotKeys';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PREFIX_KEY, SAVE_TOPIC_KEY } from '@/const/hotkeys';
import { useChatStore } from '@/store/chat';

const SaveTopic = memo<{ mobile?: boolean }>(() => {
  const { t } = useTranslation('chat');
  const [hasTopic, openNewTopicOrSaveTopic] = useChatStore((s) => [
    !!s.activeTopicId,
    s.openNewTopicOrSaveTopic,
  ]);

  const icon = hasTopic ? LucideMessageSquarePlus : LucideGalleryVerticalEnd;
  const desc = t(hasTopic ? 'topic.openNewTopic' : 'topic.saveCurrentMessages');

  const hotkeys = [PREFIX_KEY, SAVE_TOPIC_KEY].join('+');
  useHotkeys(hotkeys, openNewTopicOrSaveTopic, {
    enableOnFormTags: true,
    preventDefault: true,
  });

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <ActionIcon aria-label={desc} icon={icon} onClick={openNewTopicOrSaveTopic} />
        </TooltipTrigger>
        <TooltipContent>
          <HotKeys desc={desc} keys={hotkeys} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

export default SaveTopic;
