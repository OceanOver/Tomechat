import { memo } from 'react';

import DraggablePanel, { DraggablePanelContainer } from '@/components/DraggablePanel';
import { CHAT_SIDEBAR_WIDTH } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import TopicListContent from '@/app/chat/features/TopicListContent';

import SystemRole from './SystemRole';
import SystemRoleEditDialog from './SystemRoleEditDialog';

const Desktop = memo(() => {
  const [showAgentSettings, toggleConfig] = useGlobalStore((s) => [
    s.preference.showChatSideBar,
    s.toggleChatSideBar,
  ]);

  const isInbox = useSessionStore(sessionSelectors.isInboxSession);

  return (
    <>
      <DraggablePanel
        className="h-full bg-muted/40"
        classNames={{
          content: 'flex h-full flex-col',
        }}
        expand={showAgentSettings}
        minWidth={CHAT_SIDEBAR_WIDTH}
        mode={'fixed'}
        onExpandChange={toggleConfig}
        placement={'right'}
      >
        <DraggablePanelContainer
          className="h-full max-h-[100dvh] overflow-y-auto"
          style={{
            flex: 'none',
            minWidth: CHAT_SIDEBAR_WIDTH,
          }}
        >
          {!isInbox && <SystemRole />}
          <TopicListContent />
        </DraggablePanelContainer>
      </DraggablePanel>
      {/* Edit dialog rendered outside the panel subtree */}
      <SystemRoleEditDialog />
    </>
  );
});

export default Desktop;
