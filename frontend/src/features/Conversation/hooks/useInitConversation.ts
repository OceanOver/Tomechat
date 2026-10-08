import { useEffect } from 'react';

import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';

export const useInitConversation = () => {
  const [sessionId] = useSessionStore((s) => [s.activeId]);
  const [init, activeTopicId, switchTopic, useFetchMessages, useFetchTopics] = useChatStore((s) => [
    s.messagesInit,
    s.activeTopicId,
    s.switchTopic,
    s.useFetchMessages,
    s.useFetchTopics,
  ]);

  useFetchMessages(sessionId, activeTopicId);
  useFetchTopics(sessionId);

  useEffect(() => {
    // // when activeId changed, switch topic to undefined
    const unsubscribe = useSessionStore.subscribe(
      (s) => s.activeId,
      () => {
        switchTopic();
      },
    );
    return () => {
      unsubscribe();
    };
  }, []);

  return init;
};
