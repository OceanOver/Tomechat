import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Avatar from '@/components/Avatar';
import { ChatHeaderTitle } from '@/components/ChatHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { useSessionStore } from '@/store/session';
import { agentSelectors, sessionSelectors } from '@/store/session/selectors';
import { pathString } from '@/utils/url';

import Tags from './Tags';

const Main = memo(() => {
  const { t } = useTranslation('chat');

  const router = useRouter();

  const [init, isInbox, title, description, avatar, backgroundColor] = useSessionStore((s) => [
    sessionSelectors.isSomeSessionActive(s),
    sessionSelectors.isInboxSession(s),
    agentSelectors.currentAgentTitle(s),
    agentSelectors.currentAgentDescription(s),
    agentSelectors.currentAgentAvatar(s),
    agentSelectors.currentAgentBackgroundColor(s),
  ]);

  const displayTitle = isInbox ? t('inbox.title') : title;
  const displayDesc = isInbox ? t('inbox.desc') : description;

  return !init ? (
    <div className="flex items-center gap-3">
      <Skeleton className="size-10 rounded-full" />
      <Skeleton className="h-5 w-52" />
    </div>
  ) : (
    <div className="flex items-start gap-3">
      <Avatar
        avatar={avatar}
        background={backgroundColor}
        onClick={() => router.push(pathString('/chat/settings', { search: location.search }))}
        size={40}
        title={title}
      />
      <ChatHeaderTitle desc={displayDesc} tag={<Tags />} title={displayTitle} />
    </div>
  );
});

export default Main;
