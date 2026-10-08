import { ThreadPrimitive, useThreadViewport } from '@assistant-ui/react';
import isEqual from 'fast-deep-equal';
import { memo, useEffect, useMemo } from 'react';

import HistoryDivider from '@/features/Conversation/components/HistoryDivider';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { ChatMessage } from '@/types/message';


import ThreadAssistant from '../Messages/ThreadAssistant';
import ThreadUser from '../Messages/ThreadUser';
import BackBottom from './BackBottom';

/** Scroll to bottom on session/topic switch (replaces the old VirtualizedList scrollToIndex logic) */
const ScrollOnChatSwitch = memo(() => {
  const chatKey = useChatStore(chatSelectors.currentChatKey);
  const scrollToBottom = useThreadViewport((s) => s.scrollToBottom);

  useEffect(() => {
    scrollToBottom({ behavior: 'auto' });
  }, [chatKey, scrollToBottom]);

  return null;
});

ScrollOnChatSwitch.displayName = 'ScrollOnChatSwitch';

const MessageItem = memo<{
  message?: ChatMessage;
  showHistoryDivider?: boolean;
}>(({ message, showHistoryDivider }) => {
  const role = message?.role ?? 'assistant';

  return (
    <>
      <HistoryDivider enable={showHistoryDivider} />
      {role === 'user' ? (
        <ThreadUser message={message} />
      ) : (
        <ThreadAssistant message={message} />
      )}
    </>
  );
});

MessageItem.displayName = 'MessageItem';

const Thread = memo<{ mobile?: boolean }>(({ mobile }) => {
  const meta = useSessionStore(agentSelectors.currentAgentMeta, isEqual);
  const chats = useChatStore((s) => chatSelectors.currentChatsWithGuideMessage(meta)(s), isEqual);
  const historyLength = useChatStore((s) => s.messages.length);
  const agentConfig = useSessionStore(
    (s) => agentSelectors.currentAgentConfig(s),
    isEqual,
  );

  const indexById = useMemo(() => new Map(chats.map((c, index) => [c.id, index])), [chats]);

  return (
    <ThreadPrimitive.Root className="relative h-full">
      <ThreadPrimitive.Viewport autoScroll className="h-full overflow-y-auto">
        <div className="flex w-full flex-col pb-4" style={{ paddingTop: mobile ? 24 : 32 }}>
          <ThreadPrimitive.Messages>
            {({ message }) => {
              const index = indexById.get(message.id) ?? -1;
              const showHistoryDivider =
                !!agentConfig.enableHistoryCount &&
                historyLength > (agentConfig.historyCount ?? 0) &&
                agentConfig.historyCount === historyLength - index + 1;

              return (
                <MessageItem
                  key={message.id}
                  message={index >= 0 ? chats[index] : undefined}
                  showHistoryDivider={showHistoryDivider}
                />
              );
            }}
          </ThreadPrimitive.Messages>
        </div>
        <BackBottom />
        <ScrollOnChatSwitch />
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
});

Thread.displayName = 'Thread';

export default Thread;
