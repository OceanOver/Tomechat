import { memo } from 'react';

import { cn } from '@/utils/cn';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';

import DefaultContent from './DefaultContent';
import TopicContent from './TopicContent';

export interface ConfigCellProps {
  active?: boolean;
  fav?: boolean;
  id?: string;
  title: string;
}

const TopicItem = memo<ConfigCellProps>(({ title, active, id, fav }) => {
  const toggleConfig = useGlobalStore((s) => s.toggleMobileTopic);
  const [toggleTopic] = useChatStore((s) => [s.switchTopic]);

  return (
    <div
      className={cn(
        'group flex cursor-pointer items-center justify-between rounded-md px-2 py-2 transition-colors',
        active ? 'bg-accent font-medium' : 'hover:bg-accent/50',
      )}
      onClick={() => {
        toggleTopic(id);
        toggleConfig(false);
      }}
    >
      {!id ? (
        <DefaultContent />
      ) : (
        <TopicContent fav={fav} id={id} title={title} />
      )}
    </div>
  );
});

export default TopicItem;
